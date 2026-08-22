import 'server-only'
import crypto from 'crypto'
import { and, eq, inArray, notInArray } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { libChunks } from '@/server/db/library-schema'
import { chunkText } from './chunk'
import type { LibrarySourceType } from './config'

export interface IndexSourceInput {
  userId: string
  sourceType: LibrarySourceType
  sourceId: string
  title: string
  text: string
}

export interface IndexSourceResult {
  total: number
  written: number
  removed: number
}

const hash = (content: string) => crypto.createHash('sha256').update(content).digest('hex')

/**
 * Brings one note or material's chunks in line with its current text.
 *
 * Diffs by content hash rather than replacing wholesale. An unchanged chunk is
 * left completely alone — it keeps its embedding, so a typo fix does not
 * re-embed a whole note, and it generates no write, which matters because Neon
 * bills instant restore per GB of write history.
 *
 * Vectors are not computed here. Rows land with a null embedding and the sweep
 * fills them; the trigram index covers the gap, so the source is searchable by
 * its words immediately.
 */
export async function indexSource({
  userId,
  sourceType,
  sourceId,
  title,
  text,
}: IndexSourceInput): Promise<IndexSourceResult> {
  const chunks = chunkText(text)

  if (chunks.length === 0) {
    const cleared = await removeSourceChunks(userId, sourceId)
    return { total: 0, written: 0, removed: cleared }
  }

  const existing = await db
    .select({
      position: libChunks.position,
      contentHash: libChunks.contentHash,
    })
    .from(libChunks)
    .where(and(eq(libChunks.userId, userId), eq(libChunks.sourceId, sourceId)))

  const existingByPosition = new Map(existing.map((row) => [row.position, row.contentHash]))

  const changed = chunks
    .map((chunk) => ({ ...chunk, contentHash: hash(chunk.content) }))
    .filter((chunk) => existingByPosition.get(chunk.position) !== chunk.contentHash)

  // Positions beyond the new end: the source got shorter.
  const staleTail = existing
    .map((row) => row.position)
    .filter((position) => position >= chunks.length)

  await db.transaction(async (tx) => {
    if (staleTail.length > 0) {
      await tx
        .delete(libChunks)
        .where(
          and(
            eq(libChunks.userId, userId),
            eq(libChunks.sourceId, sourceId),
            inArray(libChunks.position, staleTail)
          )
        )
    }

    for (const chunk of changed) {
      await tx
        .insert(libChunks)
        .values({
          userId,
          sourceType,
          sourceId,
          title,
          position: chunk.position,
          content: chunk.content,
          contentHash: chunk.contentHash,
          embedding: null,
        })
        .onConflictDoUpdate({
          target: [libChunks.sourceId, libChunks.position],
          set: {
            content: chunk.content,
            contentHash: chunk.contentHash,
            title,
            // The text changed, so the old vector describes text that is gone.
            embedding: null,
          },
        })
    }

    // A retitled source keeps its chunks but has to keep naming itself
    // correctly, since the title is what a result cites.
    if (changed.length < chunks.length) {
      await tx
        .update(libChunks)
        .set({ title })
        .where(
          and(
            eq(libChunks.userId, userId),
            eq(libChunks.sourceId, sourceId),
            notInArray(
              libChunks.position,
              changed.map((chunk) => chunk.position)
            )
          )
        )
    }
  })

  return { total: chunks.length, written: changed.length, removed: staleTail.length }
}

export async function removeSourceChunks(userId: string, sourceId: string): Promise<number> {
  const deleted = await db
    .delete(libChunks)
    .where(and(eq(libChunks.userId, userId), eq(libChunks.sourceId, sourceId)))
    .returning({ chunkId: libChunks.chunkId })

  return deleted.length
}

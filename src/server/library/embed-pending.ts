import 'server-only'
import { and, eq, isNull, asc } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { libChunks } from '@/server/db/library-schema'
import { embedDocument, EmbeddingUnavailable } from '@/server/embeddings'
import { EMBED_SWEEP_BATCH } from './config'

export interface EmbedSweepResult {
  embedded: number
  remaining: number
}

/**
 * Fills in embeddings for chunks written without one.
 *
 * Runs after the write, never inside it: a note save must not wait on a model
 * call per chunk. Until this lands, a chunk is still findable — the trigram
 * index does not care whether it has a vector — so the delay costs ranking
 * quality rather than visibility.
 *
 * Sequential and bounded. Embedding is rate-limited upstream, and a parallel
 * batch is how one sweep exhausts that limit for every other caller.
 */
export async function embedPendingChunks(
  scope: { userId?: string; sourceId?: string } = {},
  limit = EMBED_SWEEP_BATCH
): Promise<EmbedSweepResult> {
  const filters = [isNull(libChunks.embedding)]
  if (scope.userId) filters.push(eq(libChunks.userId, scope.userId))
  if (scope.sourceId) filters.push(eq(libChunks.sourceId, scope.sourceId))

  const pending = await db
    .select({ chunkId: libChunks.chunkId, content: libChunks.content })
    .from(libChunks)
    .where(and(...filters))
    .orderBy(asc(libChunks.createdAt))
    .limit(limit)

  if (pending.length === 0) return { embedded: 0, remaining: 0 }

  let embedded = 0

  for (const chunk of pending) {
    try {
      const embedding = await embedDocument(chunk.content)
      await db
        .update(libChunks)
        .set({ embedding })
        .where(eq(libChunks.chunkId, chunk.chunkId))
      embedded++
    } catch (error) {
      // Rows keep their null embedding and the next pass retries them. Stop the
      // batch rather than hammer a service that just failed — but say so loudly,
      // with the cause. A silent warning here is how every chunk stayed NULL
      // while the write path looked like it was working.
      const reason = error instanceof EmbeddingUnavailable ? error.cause ?? error.message : error
      console.error(
        `[library] Embedding failed after ${embedded}/${pending.length} chunks:`,
        reason
      )
      if (!(error instanceof EmbeddingUnavailable)) throw error
      break
    }
  }

  console.info(`[library] Embedded ${embedded}/${pending.length} pending chunks`)

  return { embedded, remaining: pending.length - embedded }
}

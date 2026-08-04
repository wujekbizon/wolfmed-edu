import 'server-only'
import { and, eq, isNull, asc, inArray } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { libChunks } from '@/server/db/library-schema'
import { embedDocuments, EmbeddingUnavailable } from '@/server/embeddings'
import { EMBED_BATCH_SIZE, EMBED_PACE_MS } from '@/constants/embeddings'
import { EMBED_SWEEP_BATCH } from './config'

export interface EmbedSweepResult {
  embedded: number
  remaining: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fills in embeddings for chunks written without one.
 *
 * Runs after the write, never inside it: a note save must not wait on a model
 * call per chunk. Until this lands, a chunk is still findable — the trigram
 * index does not care whether it has a vector — so the delay costs ranking
 * quality rather than visibility.
 *
 * Batched, because the Vertex quota meters requests rather than tokens: a
 * 24-chunk document costs 24 units one at a time and 2 in batches of 16.
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

  for (let start = 0; start < pending.length; start += EMBED_BATCH_SIZE) {
    const batch = pending.slice(start, start + EMBED_BATCH_SIZE)

    // Space the requests out. Retrying is recovery; pacing is avoidance, and
    // the quota is shared with every other caller including the memory layer.
    if (start > 0) await sleep(EMBED_PACE_MS)

    try {
      const vectors = await embedDocuments(batch.map((chunk) => chunk.content))

      // One statement per batch rather than per chunk: this runs inside a
      // request's after() or a cron with a timeout, and round trips add up.
      await db.transaction(async (tx) => {
        await Promise.all(
          batch.map((chunk, index) =>
            tx
              .update(libChunks)
              .set({ embedding: vectors[index]! })
              .where(inArray(libChunks.chunkId, [chunk.chunkId]))
          )
        )
      })

      embedded += batch.length
    } catch (error) {
      // Rows keep their null embedding and the next pass retries them. Stop
      // rather than hammer a service that just refused — but say so loudly, with
      // the cause. A silent warning here is how every chunk stayed NULL while
      // the write path looked like it was working.
      const reason = error instanceof EmbeddingUnavailable ? error.cause ?? error.message : error
      console.error(
        `[library] Embedding failed after ${embedded}/${pending.length} chunks — ` +
          `the rest stay pending for the next pass:`,
        reason
      )
      if (!(error instanceof EmbeddingUnavailable)) throw error
      break
    }
  }

  console.info(`[library] Embedded ${embedded}/${pending.length} pending chunks`)

  return { embedded, remaining: pending.length - embedded }
}

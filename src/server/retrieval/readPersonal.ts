import 'server-only'
import { LIB_TOP_K, PERSONAL_MISS_SCORE } from '@/server/library/config'
import { retrieveLibrary } from '@/server/library/retrieve'
import { dropMissedSources } from '@/helpers/dropMissedSources'
import type { ContextChunk } from '@/types/retrievalTypes'

export async function readPersonal(userId: string, query: string): Promise<ContextChunk[]> {
  try {
    const hits = await retrieveLibrary(userId, query, { topK: LIB_TOP_K })
    const kept = dropMissedSources(hits)
    if (kept.length < hits.length) {
      console.log(
        `[retrieval] personal miss (< ${PERSONAL_MISS_SCORE}), dropping ${hits.length - kept.length} chunks`
      )
    }
    return kept.map((hit) => ({
      text: hit.content,
      origin: hit.sourceType,
      label: hit.title,
      score: hit.score,
    }))
  } catch (error) {
    console.error('[retrieval] Personal library search failed:', error)
    return []
  }
}

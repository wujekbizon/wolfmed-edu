import 'server-only'
import { RAG_CANDIDATE_TIMEOUT_MS } from '@/constants/rag'
import { selectCorpusChunks } from '@/helpers/selectCorpusChunks'
import { retrieveContexts } from '@/server/vertex-rag/retrieve'
import type { ContextChunk, CorpusRelevance } from '@/types/retrievalTypes'

export async function readCorpus(
  query: string,
  topK: number,
  relevance: CorpusRelevance
): Promise<ContextChunk[]> {
  try {
    const contexts = await retrieveContexts(query, {
      topK,
      ...(relevance === 'model' ? { signal: AbortSignal.timeout(RAG_CANDIDATE_TIMEOUT_MS) } : {}),
    })
    const candidates: ContextChunk[] = contexts
      .filter((context) => context.text.trim().length > 0)
      .map((context) => ({
        text: context.text,
        origin: 'corpus',
        label: context.sourceDisplayName ?? 'Baza wiedzy',
        score: context.score,
      }))
    const chunks = selectCorpusChunks(candidates, relevance)
    const scores = candidates.flatMap((chunk) => chunk.score === undefined ? [] : [chunk.score])
    console.info('[retrieval] corpus selection', {
      query,
      relevance,
      retrieved: contexts.length,
      nonempty: candidates.length,
      selected: chunks.length,
      bestDistance: scores.length ? Math.min(...scores) : null,
    })
    return chunks
  } catch (error) {
    console.error('[retrieval] Corpus search failed:', error)
    if (relevance === 'model') {
      throw new Error('Baza wiedzy jest chwilowo niedostępna. Spróbuj ponownie za chwilę.')
    }
    return []
  }
}

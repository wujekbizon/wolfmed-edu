import { isCorpusMiss } from '@/helpers/isCorpusMiss'
import type { ContextChunk, CorpusRelevance } from '@/types/retrievalTypes'

export function selectCorpusChunks(
  chunks: ContextChunk[],
  relevance: CorpusRelevance = 'distance'
): ContextChunk[] {
  return relevance === 'model' || !isCorpusMiss(chunks) ? chunks : []
}

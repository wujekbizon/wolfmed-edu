import { CORPUS_MISS_DISTANCE } from '@/constants/rag'
import type { ContextChunk } from '@/types/retrievalTypes'

// Vertex reports a vector DISTANCE, so lower is better and the best chunk is the
// minimum. Chunks without a score fail open: an unscored corpus is treated as a
// hit rather than silently discarded.
export function isCorpusMiss(chunks: ContextChunk[]): boolean {
  if (chunks.length === 0) return true

  const scores = chunks.map((chunk) => chunk.score).filter((score) => score != null)
  if (scores.length === 0) return false

  return Math.min(...scores) > CORPUS_MISS_DISTANCE
}

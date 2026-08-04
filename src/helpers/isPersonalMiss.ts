import { PERSONAL_MISS_SCORE } from '@/server/library/config'
import type { ContextChunk } from '@/types/retrievalTypes'

// Mirror of isCorpusMiss, inverted: library hits are similarity scores, so the
// best one is the maximum. Judged on the best chunk alone — a library that has
// the answer says so loudly in its top row, and a per-chunk cut would leave the
// tail of a genuinely relevant document behind.
export function isPersonalMiss(chunks: ContextChunk[]): boolean {
  if (chunks.length === 0) return true

  const scores = chunks.map((chunk) => chunk.score).filter((score) => score != null)
  if (scores.length === 0) return false

  return Math.max(...scores) < PERSONAL_MISS_SCORE
}

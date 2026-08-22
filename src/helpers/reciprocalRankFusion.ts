/**
 * Merges ranked lists by position rather than by score.
 *
 * The corpus and the personal library are searched by different embedding
 * models, so their similarity scores are not on a shared scale — the corpus runs
 * text-multilingual-embedding-002 and the library gemini-embedding-001. Sorting
 * a combined list by score would let whichever model produces tighter distances
 * win every time, and it would look like a relevance result rather than a units
 * bug. Rank is the only thing the two lists agree on.
 *
 * Each item scores `1 / (k + rank)` in every list it appears in, summed. Small
 * `k` sharpens the difference between early positions; the conventional 60 is
 * calibrated for lists of hundreds and flattens lists of a dozen.
 */
export function reciprocalRankFusion<T>(
  lists: T[][],
  identity: (item: T) => string,
  k: number
): T[] {
  const scores = new Map<string, { item: T; score: number }>()

  for (const list of lists) {
    list.forEach((item, index) => {
      const id = identity(item)
      const contribution = 1 / (k + index + 1)
      const existing = scores.get(id)

      if (existing) existing.score += contribution
      else scores.set(id, { item, score: contribution })
    })
  }

  return [...scores.values()].sort((a, b) => b.score - a.score).map((entry) => entry.item)
}

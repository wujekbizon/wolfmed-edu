import { FUSED_SCORE_FLOOR, FUSION_WEIGHTS } from '@/server/memory/config'
import { getMemoryTier } from '@/helpers/getMemoryTier'
import type { RankedMemoryRow, ScoredMemoryRow } from '@/types/memoryRetrievalTypes'

export function fuseMemoryHits(
  vector: ScoredMemoryRow[],
  lexical: ScoredMemoryRow[],
  limit: number
): RankedMemoryRow[] {
  const rows = new Map<string, { content: string; vector?: number; lexical?: number }>()
  for (const hit of vector) rows.set(hit.id, { content: hit.content, vector: hit.score })
  for (const hit of lexical) {
    const current = rows.get(hit.id)
    if (current) current.lexical = hit.score
    else rows.set(hit.id, { content: hit.content, lexical: hit.score })
  }

  return [...rows.entries()]
    .map(([id, row]) => {
      const score =
        row.vector != null && row.lexical != null
          ? FUSION_WEIGHTS.vector * row.vector + FUSION_WEIGHTS.lexical * row.lexical
          : (row.vector ?? row.lexical ?? 0)
      return { id, content: row.content, score, tier: getMemoryTier(score) }
    })
    .filter((hit) => hit.score >= FUSED_SCORE_FLOOR)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

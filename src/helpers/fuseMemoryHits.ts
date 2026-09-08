import { FUSED_SCORE_FLOOR, FUSION_WEIGHTS } from '@/server/memory/config'
import { getMemoryTier } from '@/helpers/getMemoryTier'
import type { RankedMemoryRow, ScoredMemoryRow } from '@/types/memoryRetrievalTypes'

export function fuseMemoryHits(
  vector: ScoredMemoryRow[],
  lexical: ScoredMemoryRow[]
): RankedMemoryRow[] {
  const rows = new Map<string, { row: ScoredMemoryRow; vector?: number; lexical?: number }>()
  for (const row of vector) rows.set(row.id, { row, vector: row.score })
  for (const row of lexical) {
    const current = rows.get(row.id)
    if (current) current.lexical = row.score
    else rows.set(row.id, { row, lexical: row.score })
  }
  const maxLexical = Math.max(0, ...lexical
    .filter((row) => row.score >= FUSED_SCORE_FLOOR).map((row) => row.score))
  return [...rows.values()].map(({ row, vector, lexical }) => {
    const normalized = lexical != null && maxLexical > 0 ? lexical / maxLexical : null
    const eligible = lexical != null && lexical >= FUSED_SCORE_FLOOR
    const weighted = vector != null && normalized != null && eligible
      ? FUSION_WEIGHTS.vector * vector + FUSION_WEIGHTS.lexical * normalized
      : (vector ?? (eligible ? normalized ?? 0 : 0))
    // A positive lexical observation must never reduce the vector-only baseline.
    const score = Math.max(vector ?? 0, weighted)
    return {
      ...row, score, tier: getMemoryTier(score),
      vectorScore: vector ?? null, lexicalScore: lexical ?? null,
      normalizedLexicalScore: normalized,
    }
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
}

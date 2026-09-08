import { TIER_THRESHOLDS, type RetrievalTier } from '@/server/memory/config'

export function getMemoryTier(score: number): RetrievalTier {
  if (score >= TIER_THRESHOLDS.high) return 'high'
  if (score >= TIER_THRESHOLDS.standard) return 'standard'
  return 'low'
}

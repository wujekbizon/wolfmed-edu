import crypto from 'crypto'
import type { FactCandidate, PreparedFactCandidate } from '@/types/memoryTypes'

export function prepareFactCandidate(candidate: FactCandidate): PreparedFactCandidate {
  const normalized = candidate.content.trim().replace(/\s+/g, ' ').toLowerCase()
  const contentHash = crypto.createHash('sha256').update(normalized).digest('hex')
  const status =
    candidate.source !== 'llm_inferred' ||
    (candidate.confidence >= 0.7 && candidate.hasSecondObservation)
      ? 'active'
      : 'provisional'
  const metadata = candidate.factKey
    ? { ...(candidate.metadata ?? {}), key: candidate.factKey }
    : candidate.metadata ?? null
  return { contentHash, status, metadata }
}

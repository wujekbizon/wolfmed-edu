import type { db } from '@/server/db/index'
import type { JevAuditContext } from './jevAuditTypes'

export type WolfekMetricsTx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type WolfekInteraction = {
  source: 'panel' | 'kierunki' | 'practice'
  route: string
  userId: string | null
  kind: 'question' | 'topic_click' | 'prepared_batch'
  question: string | null
  topic: string | null
  confidence: number | null
  outcome: 'provider' | 'typed_provider' | 'batch_first' | 'batch_reuse' | 'cache_hit' | 'unavailable' | 'topic_click'
}
export type WolfekMetricIncrement = {
  source: JevAuditContext['source']
  route: string
  model: string
  kind: 'provider' | 'question' | 'topic_click' | 'prepared_batch'
  outcome: string
  topic: string
  happenedAt: Date
  inputTokens: number
  outputTokens: number
  missingUsage: number
  latencyMs: number
  reviewCount: number
}

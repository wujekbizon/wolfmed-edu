import type { db } from '@/server/db/index'
import type { JevAuditContext } from './jevAuditTypes'

export type WolfekMetricsTx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type WolfekInteraction = {
  source: 'panel' | 'kierunki'
  route: string
  userId: string | null
  kind: 'question' | 'topic_click'
  question: string | null
  topic: string | null
  confidence: number | null
  outcome: 'provider' | 'cache_hit' | 'unavailable' | 'topic_click'
}
export type WolfekMetricIncrement = {
  source: JevAuditContext['source']
  route: string
  model: string
  kind: 'provider' | 'question' | 'topic_click'
  outcome: string
  topic: string
  happenedAt: Date
  inputTokens: number
  outputTokens: number
  missingUsage: number
  latencyMs: number
  reviewCount: number
}

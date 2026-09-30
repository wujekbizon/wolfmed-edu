import 'server-only'
import { db } from '@/server/db/index'
import { wolfekInteractions } from '@/server/db/schema'
import { JEV_AUDIT_RETENTION_DAYS } from '@/constants/jevAudit'
import { WOLFEK_TOPIC_MIN_CONFIDENCE } from '@/constants/wolfekRouting'
import { addWolfekDailyMetric } from './addWolfekDailyMetric'
import type { WolfekInteraction } from '@/types/wolfekMetricTypes'

export async function recordWolfekInteraction(record: WolfekInteraction): Promise<void> {
  const createdAt = new Date()
  const needsReview = record.kind === 'question' &&
    (record.topic === 'other' || record.confidence === null || record.confidence < WOLFEK_TOPIC_MIN_CONFIDENCE)
  try {
    await db.transaction(async (tx) => {
      await tx.insert(wolfekInteractions).values({ ...record, needsReview, createdAt,
        expiresAt: new Date(createdAt.getTime() + JEV_AUDIT_RETENTION_DAYS * 86_400_000) })
      await addWolfekDailyMetric(tx, {
        source: record.source, route: record.route, model: '', kind: record.kind,
        outcome: record.outcome, topic: record.topic ?? 'unknown', happenedAt: createdAt,
        inputTokens: 0, outputTokens: 0, missingUsage: 0, latencyMs: 0, reviewCount: needsReview ? 1 : 0,
      })
    })
  } catch {
    console.error('Wolfek interaction write failed', { source: record.source, route: record.route })
  }
}

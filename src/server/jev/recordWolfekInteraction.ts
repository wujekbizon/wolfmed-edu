import 'server-only'
import { db } from '@/server/db/index'
import { wolfekInteractions } from '@/server/db/schema'
import { JEV_AUDIT_RETENTION_DAYS } from '@/constants/jevAudit'
import { needsWolfekInteractionReview } from '@/helpers/needsWolfekInteractionReview'
import { addWolfekDailyMetric } from './addWolfekDailyMetric'
import type { WolfekInteraction } from '@/types/wolfekMetricTypes'
import { WOLFEK_ADMIN_LOGGING_ENABLED } from '@/constants/wolfekAdmin'

export async function recordWolfekInteraction(record: WolfekInteraction): Promise<void> {
  if (!WOLFEK_ADMIN_LOGGING_ENABLED) return
  const createdAt = new Date()
  const needsReview = needsWolfekInteractionReview(record)
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

import 'server-only'
import { db } from '@/server/db/index'
import { jevAuditLogs } from '@/server/db/schema'
import { JEV_AUDIT_RETENTION_DAYS } from '@/constants/jevAudit'
import type { JevAuditRecord } from '@/types/jevAuditTypes'
import { getJevTokenUsage } from '@/helpers/getJevTokenUsage'
import { addWolfekDailyMetric } from './addWolfekDailyMetric'

export async function writeJevAuditLog(record: JevAuditRecord): Promise<void> {
  try {
    const usage = getJevTokenUsage(record.responsePayload)
    await db.transaction(async (tx) => {
      await tx.insert(jevAuditLogs).values({
        ...record, userId: record.userId ?? null, sessionId: record.sessionId ?? null,
        model: record.requestPayload.model, usageAggregated: true,
        expiresAt: new Date(record.startedAt.getTime() + JEV_AUDIT_RETENTION_DAYS * 86_400_000),
      })
      await addWolfekDailyMetric(tx, {
        source: record.source, route: record.route, model: record.requestPayload.model,
        kind: 'provider', outcome: record.status, topic: '', happenedAt: record.startedAt,
        inputTokens: usage.input ?? 0, outputTokens: usage.output ?? 0,
        missingUsage: usage.input === null || usage.output === null ? 1 : 0,
        latencyMs: record.latencyMs, reviewCount: 0,
      })
    })
  } catch {
    console.error('Jev audit log write failed', { source: record.source, route: record.route })
  }
}

import 'server-only'
import { desc } from 'drizzle-orm'
import { requireAdmin } from '@/helpers/requireAdmin'
import { buildWolfekCsv } from '@/helpers/buildWolfekCsv'
import { db } from '@/server/db/index'
import { jevAuditLogs, wolfekInteractions } from '@/server/db/schema'
import { WOLFEK_EXPORT_LIMIT } from '@/constants/wolfekAdmin'
import { buildAuditWhere } from './buildAuditWhere'
import { buildInteractionWhere } from './buildInteractionWhere'
import { getWolfekMetrics } from './getWolfekMetrics'
import type { WolfekAdminFilters } from '@/types/wolfekAdminTypes'

export async function getWolfekExport(filters: WolfekAdminFilters, format: 'csv' | 'json') {
  await requireAdmin()
  if (filters.view === 'usage') {
    const metrics = await getWolfekMetrics(filters)
    return format === 'json' ? JSON.stringify({ filters, generatedAt: new Date().toISOString(), ...metrics }, null, 2)
      : buildWolfekCsv(metrics.daily.map((row) => ({ ...row })),
        ['day', 'questions', 'clicks', 'cacheHits', 'providerCalls', 'errors', 'inputTokens', 'outputTokens'])
  }
  const rows = filters.view === 'insights'
    ? await db.select().from(wolfekInteractions).where(buildInteractionWhere(filters))
      .orderBy(desc(wolfekInteractions.createdAt), desc(wolfekInteractions.id)).limit(WOLFEK_EXPORT_LIMIT + 1)
    : await db.select().from(jevAuditLogs).where(buildAuditWhere(filters))
      .orderBy(desc(jevAuditLogs.startedAt), desc(jevAuditLogs.id)).limit(WOLFEK_EXPORT_LIMIT + 1)
  if (rows.length > WOLFEK_EXPORT_LIMIT) throw new Error(`Eksport przekracza ${WOLFEK_EXPORT_LIMIT} wierszy. Zawęź daty lub filtry.`)
  if (format === 'json') return JSON.stringify({ filters, generatedAt: new Date().toISOString(), rows }, null, 2)
  const columns = filters.view === 'insights'
    ? ['id', 'createdAt', 'source', 'route', 'kind', 'outcome', 'question', 'topic', 'confidence', 'needsReview', 'userId']
    : ['id', 'startedAt', 'source', 'route', 'status', 'model', 'policyVersion', 'httpStatus', 'latencyMs',
      'userId', 'sessionId', 'requestPayload', 'responsePayload', 'responseText', 'errorName', 'errorMessage']
  return buildWolfekCsv(rows, columns)
}

import 'server-only'
import { count, desc, sql } from 'drizzle-orm'
import { requireAdmin } from '@/helpers/requireAdmin'
import { getJevTokenUsage } from '@/helpers/getJevTokenUsage'
import { db } from '@/server/db/index'
import { jevAuditLogs as logs } from '@/server/db/schema'
import { WOLFEK_ADMIN_PAGE_SIZE } from '@/constants/wolfekAdmin'
import { WOLFEK_TOPIC_MIN_CONFIDENCE } from '@/constants/wolfekRouting'
import { buildAuditWhere } from './buildAuditWhere'
import type { WolfekAdminFilters, WolfekAdminRow } from '@/types/wolfekAdminTypes'

export async function getAuditRows(filters: WolfekAdminFilters): Promise<{ rows: WolfekAdminRow[]; totalRows: number }> {
  await requireAdmin()
  const where = buildAuditWhere(filters)
  const [items, totals] = await Promise.all([
    db.select({ id: logs.id, createdAt: logs.startedAt, source: logs.source, route: logs.route,
      model: logs.model, status: logs.status, latencyMs: logs.latencyMs,
      question: sql<string>`COALESCE(${logs.requestPayload} #>> '{state,question}', 'Sesja ćwiczeń')`,
      usage: sql<unknown>`${logs.responsePayload} -> 'usage'`,
      answer: sql<unknown>`COALESCE((SELECT value FROM jsonb_each(COALESCE(${logs.responsePayload}->'answers', '{}'::jsonb))
        WHERE key LIKE '%__response' LIMIT 1), ${logs.responsePayload} #> '{answers,response}', ${logs.responsePayload} #> '{answers,guide}',
        ${logs.responsePayload} #> '{answers,help}', ${logs.responsePayload} #> '{answers,support}')`,
    }).from(logs).where(where).orderBy(desc(logs.startedAt), desc(logs.id))
      .limit(WOLFEK_ADMIN_PAGE_SIZE).offset((filters.page - 1) * WOLFEK_ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(logs).where(where),
  ])
  return { totalRows: totals[0]?.total ?? 0, rows: items.map((row) => {
    const usage = getJevTokenUsage({ usage: row.usage })
    const answer = row.answer as { choice?: unknown; confidence?: unknown } | null
    const topic = typeof answer?.choice === 'string' ? answer.choice : null
    const confidence = typeof answer?.confidence === 'number' && Number.isFinite(answer.confidence) ? answer.confidence : null
    return { id: row.id, createdAt: row.createdAt.toISOString(), source: row.source, route: row.route,
      model: row.model, status: row.status, latencyMs: row.latencyMs, question: row.question,
      inputTokens: usage.input, outputTokens: usage.output, topic, confidence, kind: 'provider',
      needsReview: topic === 'other' || topic === 'no_match' || topic === 'clarify' ||
        topic?.startsWith('unavailable_') === true || (confidence !== null && confidence < WOLFEK_TOPIC_MIN_CONFIDENCE) }
  }) }
}

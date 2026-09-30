import 'server-only'
import { count, desc } from 'drizzle-orm'
import { requireAdmin } from '@/helpers/requireAdmin'
import { db } from '@/server/db/index'
import { wolfekInteractions as events } from '@/server/db/schema'
import { WOLFEK_ADMIN_PAGE_SIZE } from '@/constants/wolfekAdmin'
import { buildInteractionWhere } from './buildInteractionWhere'
import type { WolfekAdminFilters, WolfekAdminRow } from '@/types/wolfekAdminTypes'

export async function getInteractionRows(filters: WolfekAdminFilters): Promise<{ rows: WolfekAdminRow[]; totalRows: number }> {
  await requireAdmin()
  const where = buildInteractionWhere(filters)
  const [items, totals] = await Promise.all([
    db.select().from(events).where(where).orderBy(desc(events.createdAt), desc(events.id))
      .limit(WOLFEK_ADMIN_PAGE_SIZE).offset((filters.page - 1) * WOLFEK_ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(events).where(where),
  ])
  return { totalRows: totals[0]?.total ?? 0, rows: items.map((row) => ({
    id: row.id, createdAt: row.createdAt.toISOString(), source: row.source, route: row.route,
    model: '', status: row.outcome, kind: row.kind, question: row.question ?? 'Kliknięcie tematu',
    topic: row.topic, confidence: row.confidence, latencyMs: null, inputTokens: null,
    outputTokens: null, needsReview: row.needsReview,
  })) }
}

'use server'

import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/helpers/requireAdmin'
import { checkRateLimit } from '@/lib/rateLimit'
import { db } from '@/server/db/index'
import { jevAuditLogs } from '@/server/db/schema'
import { WolfekAdminFiltersSchema, WolfekAdminAuditIdSchema } from '@/server/schema'
import { getWolfekAdminReport } from '@/server/wolfek-admin/getWolfekAdminReport'

export async function getAdminWolfekReportAction(input: unknown) {
  const { userId } = await requireAdmin()
  if (!(await checkRateLimit(userId, 'admin:wolfek')).success) throw new Error('Zbyt wiele odświeżeń. Spróbuj za chwilę.')
  return getWolfekAdminReport(WolfekAdminFiltersSchema.parse(input))
}

export async function getAdminWolfekAuditDetailAction(input: unknown) {
  const { userId } = await requireAdmin()
  if (!(await checkRateLimit(userId, 'admin:wolfek')).success) throw new Error('Zbyt wiele odświeżeń. Spróbuj za chwilę.')
  const id = WolfekAdminAuditIdSchema.parse(input)
  const [row] = await db.select().from(jevAuditLogs).where(eq(jevAuditLogs.id, id)).limit(1)
  if (!row) throw new Error('Log wygasł lub został usunięty.')
  return { ...row, startedAt: row.startedAt.toISOString(), createdAt: row.createdAt.toISOString(), expiresAt: row.expiresAt.toISOString() }
}

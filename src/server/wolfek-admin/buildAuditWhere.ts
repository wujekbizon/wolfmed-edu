import 'server-only'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { jevAuditLogs as logs } from '@/server/db/schema'
import type { WolfekAdminFilters } from '@/types/wolfekAdminTypes'

export function buildAuditWhere(filters: WolfekAdminFilters) {
  const search = filters.search.replace(/[\\%_]/g, '\\$&')
  return and(
    sql`${logs.startedAt} >= (${filters.from}::date::timestamp AT TIME ZONE 'Europe/Warsaw')`,
    sql`${logs.startedAt} < ((${filters.to}::date + 1)::timestamp AT TIME ZONE 'Europe/Warsaw')`,
    filters.source === 'all' ? undefined : eq(logs.source, filters.source),
    filters.view === 'errors' ? sql`${logs.status} <> 'success'` : undefined,
    filters.status === 'all' ? undefined : eq(logs.status, filters.status),
    search ? or(ilike(sql`${logs.requestPayload} #>> '{state,question}'`, `%${search}%`),
      ilike(logs.errorMessage, `%${search}%`), ilike(logs.model, `%${search}%`)) : undefined,
  )
}

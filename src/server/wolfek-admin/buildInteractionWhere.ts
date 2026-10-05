import 'server-only'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { wolfekInteractions as events } from '@/server/db/schema'
import type { WolfekAdminFilters } from '@/types/wolfekAdminTypes'

export function buildInteractionWhere(filters: WolfekAdminFilters) {
  const search = filters.search.replace(/[\\%_]/g, '\\$&')
  return and(
    sql`${events.createdAt} >= (${filters.from}::date::timestamp AT TIME ZONE 'Europe/Warsaw')`,
    sql`${events.createdAt} < ((${filters.to}::date + 1)::timestamp AT TIME ZONE 'Europe/Warsaw')`,
    filters.source === 'all' ? undefined : eq(events.source, filters.source),
    search ? or(ilike(events.question, `%${search}%`), ilike(events.topic, `%${search}%`)) : undefined,
  )
}

import 'server-only'
import { requireAdmin } from '@/helpers/requireAdmin'
import { WolfekAdminFiltersSchema } from '@/server/schema'
import { getWolfekMetrics } from './getWolfekMetrics'
import { getAuditRows } from './getAuditRows'
import { getInteractionRows } from './getInteractionRows'
import type { WolfekAdminFilters, WolfekAdminReport } from '@/types/wolfekAdminTypes'

export async function getWolfekAdminReport(input: WolfekAdminFilters): Promise<WolfekAdminReport> {
  await requireAdmin()
  const filters = WolfekAdminFiltersSchema.parse(input)
  const [metrics, list] = await Promise.all([
    getWolfekMetrics(filters), filters.view === 'usage' ? Promise.resolve({ rows: [], totalRows: 0 })
      : filters.view === 'insights' ? getInteractionRows(filters) : getAuditRows(filters),
  ])
  return { ...metrics, ...list }
}

import { getWolfekMetricDay } from './getWolfekMetricDay'
import type { WolfekAdminFilters } from '@/types/wolfekAdminTypes'

export function getDefaultWolfekAdminFilters(): WolfekAdminFilters {
  return { view: 'insights', source: 'all', status: 'all', search: '', page: 1,
    from: getWolfekMetricDay(new Date(Date.now() - 29 * 86_400_000)), to: getWolfekMetricDay(new Date()) }
}

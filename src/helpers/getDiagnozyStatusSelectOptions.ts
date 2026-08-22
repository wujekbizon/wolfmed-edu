import { DIAGNOZY_STATUS_LABELS } from '@/constants/diagnozyBrowse'
import type { DiagnozyStatusFilter } from '@/types/diagnozyTypes'
import type { SelectOption } from '@/types/uiTypes'

export function getDiagnozyStatusSelectOptions(): SelectOption[] {
  return (Object.keys(DIAGNOZY_STATUS_LABELS) as DiagnozyStatusFilter[]).map((status) => ({
    value: status,
    label: DIAGNOZY_STATUS_LABELS[status],
  }))
}

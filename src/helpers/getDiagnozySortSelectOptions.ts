import { DIAGNOZY_SORT_LABELS } from '@/constants/diagnozyBrowse'
import { DIAGNOZY_SORT_KEYS } from '@/types/diagnozyTypes'
import type { SelectOption } from '@/types/uiTypes'

export function getDiagnozySortSelectOptions(): SelectOption[] {
  return DIAGNOZY_SORT_KEYS.map((key) => ({
    value: key,
    label: DIAGNOZY_SORT_LABELS[key],
  }))
}

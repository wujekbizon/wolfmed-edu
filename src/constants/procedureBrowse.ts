import type { ProcedureBrowseCriteria } from '@/types/procedureBrowseTypes'
import type { SelectOption } from '@/types/uiTypes'

export const PROCEDURE_BROWSE_STALE_TIME = 10 * 60 * 1000

export const PROCEDURE_BROWSE_DEFAULT_CRITERIA: ProcedureBrowseCriteria = {
  search: '',
  sort: 'default',
}

export const PROCEDURE_BROWSE_SORT_OPTIONS: SelectOption[] = [
  { value: 'default', label: 'Domyślna kolejność' },
  { value: 'name-asc', label: 'Nazwa A–Z' },
  { value: 'name-desc', label: 'Nazwa Z–A' },
]

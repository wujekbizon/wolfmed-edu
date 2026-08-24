import type { NaukaCategoryBrowseCriteria } from '@/types/categoryType'
import type { SelectOption } from '@/types/uiTypes'

export const CUSTOM_CATEGORIES_FILTER = '__custom__'
export const CUSTOM_TEST_CATEGORY_PREFIX = 'moje-testy__'

export const NAUKA_CATEGORY_DEFAULT_CRITERIA: NaukaCategoryBrowseCriteria = {
  search: '',
  course: '',
  sort: 'default',
}

export const NAUKA_CATEGORY_SORT_OPTIONS: SelectOption[] = [
  { value: 'default', label: 'Domyślna kolejność' },
  { value: 'name-asc', label: 'Nazwa A–Z' },
  { value: 'name-desc', label: 'Nazwa Z–A' },
  { value: 'questions-desc', label: 'Najwięcej pytań' },
  { value: 'questions-asc', label: 'Najmniej pytań' },
]

export const NAUKA_COURSE_LABELS: Record<string, string> = {
  pielegniarstwo: 'Pielęgniarstwo',
  'opiekun-medyczny': 'Opiekun medyczny',
}

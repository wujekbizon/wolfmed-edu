import type { SelectOption } from '@/types/uiTypes'
import type { SortOption } from '@/store/useSortCompletedTestsStore'

export const COMPLETED_TEST_SORT_OPTIONS: SelectOption[] = [
  { value: 'dateDesc' satisfies SortOption, label: 'Od najnowszych' },
  { value: 'dateAsc' satisfies SortOption, label: 'Od najstarszych' },
  { value: 'scoreDesc' satisfies SortOption, label: 'Najwyższy wynik' },
  { value: 'scoreAsc' satisfies SortOption, label: 'Najniższy wynik' },
]

import DropdownSelect from '@/components/ui/DropdownSelect'
import { COMPLETED_TEST_SORT_OPTIONS } from '@/constants/completedTestSortOptions'
import { useSortCompletedTestsStore } from '@/store/useSortCompletedTestsStore'

export default function SortSelect() {
  const { sortOption, setSortOption } = useSortCompletedTestsStore()

  return (
    <div className="results-sort">
      <span className="results-sort-label">Sortuj według</span>
      <DropdownSelect
        value={sortOption}
        onSelect={(value) => setSortOption(value as typeof sortOption)}
        options={COMPLETED_TEST_SORT_OPTIONS}
        ariaLabel="Sortuj wyniki testów"
        className="w-full sm:w-56"
      />
    </div>
  )
}

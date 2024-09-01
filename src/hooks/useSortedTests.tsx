import { useSortCompletedTestsStore } from '@/store/useSortCompletedTestsStore'
import { CompletedTest } from '@/types/dataTypes'

export function useSortedTests(tests: CompletedTest[]) {
  const { sortOption } = useSortCompletedTestsStore()

  const sortedTests = [...tests].sort((a, b) => {
    const dateA = new Date(a.completedAt ?? '1970-01-01T00:00:00Z').getTime()
    const dateB = new Date(b.completedAt ?? '1970-01-01T00:00:00Z').getTime()

    switch (sortOption) {
      case 'dateAsc':
        return dateA - dateB
      case 'dateDesc':
        return dateB - dateA
      case 'scoreAsc':
        return a.score - b.score
      case 'scoreDesc':
        return b.score - a.score
      default:
        return 0
    }
  })

  return sortedTests
}

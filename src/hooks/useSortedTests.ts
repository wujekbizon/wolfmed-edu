import { useMemo } from 'react'
import { useSortCompletedTestsStore } from '@/store/useSortCompletedTestsStore'
import { CompletedTest } from '@/types/dataTypes'

const FALLBACK_DATE = '1970-01-01T00:00:00Z'

export function useSortedTests(tests: CompletedTest[]) {
  const { sortOption } = useSortCompletedTestsStore()

  return useMemo(() => {
    switch (sortOption) {
      case 'dateAsc':
        return [...tests]
          .map((t) => ({ t, d: new Date(t.completedAt ?? FALLBACK_DATE).getTime() }))
          .sort((a, b) => a.d - b.d)
          .map(({ t }) => t)
      case 'dateDesc':
        return [...tests]
          .map((t) => ({ t, d: new Date(t.completedAt ?? FALLBACK_DATE).getTime() }))
          .sort((a, b) => b.d - a.d)
          .map(({ t }) => t)
      case 'scoreAsc':
        return [...tests].sort((a, b) => a.score - b.score)
      case 'scoreDesc':
        return [...tests].sort((a, b) => b.score - a.score)
      default:
        return tests
    }
  }, [tests, sortOption])
}

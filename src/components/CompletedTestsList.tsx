'use client'

import { CompletedTest } from '@/types/dataTypes'
import CompletedTestCard from './CompletedTestCard'
import SortSelect from './SortSelect'
import { useSortedTests } from '@/hooks/useSortedTests'

interface CompletedTestsListProps {
  tests: CompletedTest[]
}

export default function CompletedTestsList({ tests }: CompletedTestsListProps) {
  const sortedTests = useSortedTests(tests)

  return (
    <div className="flex w-full flex-col items-center gap-6 overflow-y-auto p-4 scrollbar-webkit md:p-8">
      <SortSelect />
      {sortedTests.length === 0 && <p>No tests results yet...</p>}
      {sortedTests.map((completedTest) => (
        <CompletedTestCard key={completedTest.id} completedTest={completedTest} />
      ))}
    </div>
  )
}

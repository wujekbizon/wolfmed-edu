import { CompletedTest } from '@/types/dataTypes'
import CompletedTestCard from './CompletedTestCard'

interface CompletedTestsListProps {
  tests: CompletedTest[]
}

export default function CompletedTestsList({ tests }: CompletedTestsListProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6 overflow-y-auto p-4 scrollbar-webkit md:p-8">
      {tests.length === 0 && <p>No tests results yet...</p>}
      {tests.map((completedTest) => {
        return <CompletedTestCard key={completedTest.id} completedTest={completedTest} />
      })}
    </div>
  )
}

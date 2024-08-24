import { Test } from '@/server/getData'
import Link from 'next/link'

interface FilteredTestsListProps {
  tests: Test[] | undefined
  isLoading: boolean
  error?: Error | null
}

export default function FilteredTestsList({ tests, isLoading, error }: FilteredTestsListProps) {
  if (isLoading) {
    return <p className="text-center">Loading tests...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">Error loading tests: {error.message}</p>
  }

  if (!tests?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Brak dostępnych testów...</p>
      </div>
    )
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 xl:w-5/6">
      {tests.map((item, index) => (
        <p key={item.data.question}>{item.category}</p>
        // <QuestionCard
        //   key={item.data.question}
        //   test={item}
        //   questionNumber={`${index + 1}/${tests.length}`}
        // />
      ))}
    </div>
  )
}

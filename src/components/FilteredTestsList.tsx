import { Test } from '@/server/getData'
import LearningCard from './LearningCard'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import PaginationControls from './PaginationControls'

interface FilteredTestsListProps {
  tests: Test[]
  isLoading: boolean
  error?: Error | null
}

export default function FilteredTestsList({ tests, isLoading, error }: FilteredTestsListProps) {
  const { currentPage, perPage, setCurrentPage } = useSearchTermStore()

  // Calculate the total number of pages
  const totalPages = Math.ceil(tests?.length / perPage)

  // Adjust currentPage if it exceeds totalPages after filtering
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages)
  }

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * perPage
  const paginatedTests = tests.slice(startIndex, startIndex + perPage)

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
    <div className="grid w-full grid-cols-1 gap-8 xl:w-3/4">
      {paginatedTests.map((item, index) => (
        <LearningCard
          key={item.data.question}
          test={item}
          questionNumber={`${index + 1 + (currentPage - 1) * perPage}/${tests.length}`}
        />
      ))}
      <PaginationControls totalPages={totalPages} />
    </div>
  )
}

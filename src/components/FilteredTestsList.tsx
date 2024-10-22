import { useEffect, useRef } from 'react'
import { Test } from '@/types/dataTypes'
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
  const listRef = useRef<HTMLDivElement>(null)

  // Scroll to top when the current page changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scroll({ top: 0, behavior: 'auto' })
    }
  }, [currentPage])

  // Calculate the total number of pages
  const totalPages = Math.ceil(tests?.length / perPage)

  // Adjust currentPage if it exceeds totalPages after filtering
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages)
  }

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * perPage
  const paginatedTests = tests.slice(startIndex, startIndex + perPage)

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
    <div
      className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] flex flex-col gap-6 pb-2 pr-1 overflow-y-auto scrollbar-webkit"
      ref={listRef}
    >
      {paginatedTests.map((item, index) => (
        <LearningCard
          key={item.data.question}
          test={item}
          questionNumber={`${index + 1 + (currentPage - 1) * perPage}/${tests.length}`}
        />
      ))}
      <div className="flex w-full justify-center bg-zinc-50 rounded-lg shadow-md shadow-zinc-500 border border-red-200/60">
        <PaginationControls totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  )
}

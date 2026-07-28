import { useEffect, useRef } from 'react'
import { Test } from '@/types/dataTypes'
import LearningCard from './LearningCard'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import LearningPaginationControls from './LearningPaginationControls'

interface FilteredTestsListProps {
  tests: Test[]
  category: string
  isLoading: boolean
  error?: Error | null
}

export default function FilteredTestsList({ tests, category, error }: FilteredTestsListProps) {
  const { perPage, pageByCategory, setCurrentPage } = useSearchTermStore()
  const listRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.max(1, Math.ceil(tests.length / perPage))
  const bookmarkedPage = pageByCategory[category] ?? 1

  // Reading the bookmark by category keeps the first paint correct: a category
  // with no bookmark renders page 1 instead of flashing the previous category's
  // page. Clamping is derived rather than written during render — the effect
  // below only repairs a bookmark left beyond a category that has since shrunk.
  const currentPage = Math.min(bookmarkedPage, totalPages)

  useEffect(() => {
    if (bookmarkedPage !== currentPage) setCurrentPage(currentPage)
  }, [bookmarkedPage, currentPage, setCurrentPage])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

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
      className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] flex flex-col gap-6 pb-2 pr-1 overflow-y-auto scrollbar-webkit [scroll-margin-top:128px]"
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
        <LearningPaginationControls totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  )
}

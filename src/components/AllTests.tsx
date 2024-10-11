'use client'

import { useEffect, useRef } from 'react'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useQuery } from '@tanstack/react-query'

import { useSearchTermStore } from '@/store/useSearchTermStore'
import SearchTerm from './SearchTerm'
import FilteredTestsList from './FilteredTestsList'
import { Test } from '@/types/dataTypes'

export default function AllTests(props: { tests: Test[] }) {
  const { searchTerm, currentPage } = useSearchTermStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const listRef = useRef<HTMLDivElement>(null)

  // Scroll to top when the current page changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [currentPage])

  // creates an array directly from object's values
  const testsArr = Object.values(props.tests)

  // Query to cache the unfiltered tests
  const { data: cachedTestsArr } = useQuery({
    queryKey: ['allTests'],
    queryFn: async () => testsArr,
    initialData: testsArr, // Initial data as testsArr
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })

  const filteredTestsQueryFn = async () => {
    if (!debouncedSearchTerm) return cachedTestsArr

    return cachedTestsArr.filter((test) => {
      const matchQuestion = test.data.question.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchAnswers = test.data.answers.some((answer) =>
        answer.option.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      return matchQuestion || matchAnswers
    })
  }

  const {
    data: filteredTests,
    isLoading: searchLoading,
    error,
  } = useQuery({
    queryKey: ['filteredTests', debouncedSearchTerm],
    queryFn: filteredTestsQueryFn,
    enabled: !!searchTerm || true,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <section className="px-1 sm:px-4 py-4 w-full overflow-y-auto scrollbar-webkit" ref={listRef}>
      <div className=" h-full flex flex-col items-center gap-8 pr-1">
        <div className="w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
          <SearchTerm label="Szukaj terminu" />
        </div>
        <FilteredTestsList tests={filteredTests ?? cachedTestsArr} isLoading={searchLoading} error={error} />
      </div>
    </section>
  )
}

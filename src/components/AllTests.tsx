'use client'

import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import SearchTerm from '@/components/SearchTerm'
import FilteredTestsList from '@/components/FilteredTestsList'
import type { Test } from '@/types/dataTypes'

export default function AllTests(props: { tests: Test[] }) {
  const { searchTerm, setSearchTerm, isExpanded, toggleExpand } = useSearchTermStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

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
    <section className="flex flex-col items-center w-full h-full">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] pb-4">
        <SearchTerm
          label="Szukaj testów"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isExpanded={isExpanded}
          toggleExpand={toggleExpand}
          title="Baza pytań"
        />
      </div>
      <FilteredTestsList tests={filteredTests ?? cachedTestsArr} isLoading={searchLoading} error={error} />
    </section>
  )
}

'use client'

import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useQuery } from '@tanstack/react-query'
import { Test } from '@/server/getData'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import SearchTerm from './SearchTerm'
import FilteredTestsList from './FilteredTestsList'
import LearningAssistant from './LearningAssistant'

export default function AllTests(props: { tests: Test[] }) {
  const { searchTerm } = useSearchTermStore()
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
    staleTime: 10 * 60 * 1000, // Cache results for 10 minutes
  })

  return (
    <section className="flex flex-col items-center gap-4 px-1 sm:px-4 w-full h-full overflow-y-auto scrollbar-webkit">
      <LearningAssistant />
      <div className="animate-slideInDown opacity-0 [--slidein-delay:500ms] place-self-center w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
        <SearchTerm />
      </div>
      <FilteredTestsList tests={filteredTests ?? cachedTestsArr} isLoading={searchLoading} error={error} />
    </section>
  )
}

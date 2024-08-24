'use client'

import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useQuery } from '@tanstack/react-query'
import { Test } from '@/server/getData'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import SearchTerm from './SearchTerm'
import FilteredTestsList from './FilteredTestsList'

export default function AllTests(props: { tests: Test[] }) {
  const { searchTerm } = useSearchTermStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const filteredTestsQueryFn = async () => {
    if (!debouncedSearchTerm) return props.tests // Return all tests if no search term or category selected

    return props.tests.filter((test) => {
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
    enabled: !!searchTerm,
    staleTime: 10 * 60 * 1000, // Cache results for 10 minutes
  })

  return (
    <section className="flex flex-col items-center gap-4 px-4 w-full h-full overflow-y-auto scrollbar-webkit">
      <div className="place-self-center xl:place-self-end w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
        <SearchTerm />
      </div>
      <FilteredTestsList tests={filteredTests} isLoading={searchLoading} error={error} />
    </section>
  )
}

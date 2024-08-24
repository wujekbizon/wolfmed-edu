'use client'

import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useQuery } from '@tanstack/react-query'
import { Test } from '@/server/getData'
import { useSearchTermStore } from '@/store/useSearchTermStore'

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
    <div className="w-full h-full overflow-y-auto scrollbar-webkit">
      {/* {props.tests.map((test) => (
        <p key={test.data.question}>{test.category}</p>
      ))} */}
    </div>
  )
}

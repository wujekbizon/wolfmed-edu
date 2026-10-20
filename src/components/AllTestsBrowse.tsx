'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import SearchTerm from '@/components/SearchTerm'
import FilteredTestsList from '@/components/FilteredTestsList'
import PracticeSignInRequired from '@/components/learning/PracticeSignInRequired'
import LearningPracticeSkeleton from '@/components/skeletons/LearningPracticeSkeleton'
import type { Test } from '@/types/dataTypes'

export default function AllTestsBrowse(props: { tests: Test[]; category: string; userId?: string }) {
  const client = useQueryClient()
  const { userId, isLoaded } = useAuth()
  const authorized = isLoaded && Boolean(userId) && userId === props.userId
  const { searchTerm, setSearchTerm, isExpanded, toggleExpand, openCategory } = useSearchTermStore()

  useEffect(() => {
    if (isLoaded && !authorized) {
      client.removeQueries({ queryKey: ['allTests', props.userId] })
      client.removeQueries({ queryKey: ['filteredTests', props.userId] })
    }
  }, [client, isLoaded, authorized, props.userId])

  useEffect(() => {
    openCategory(props.category)
  }, [props.category, openCategory])
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)

  const testsArr = Object.values(props.tests)

  const { data: cachedTestsArr } = useQuery({
    queryKey: ['allTests', props.userId, props.category],
    queryFn: async () => testsArr,
    initialData: testsArr,
    staleTime: 10 * 60 * 1000,
    enabled: authorized,
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
    queryKey: ['filteredTests', props.userId, debouncedSearchTerm, props.category],
    queryFn: filteredTestsQueryFn,
    enabled: authorized,
    staleTime: 10 * 60 * 1000,
  })

  if (!isLoaded) return <LearningPracticeSkeleton />
  if (!authorized) return <PracticeSignInRequired />

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
      <FilteredTestsList
        tests={filteredTests ?? cachedTestsArr}
        category={props.category}
        isLoading={searchLoading}
        error={error}
      />
    </section>
  )
}

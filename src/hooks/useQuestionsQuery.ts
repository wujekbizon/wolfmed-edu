import { useQuery } from '@tanstack/react-query'
import { Test } from '@/types/dataTypes'
import { useMemo } from 'react'
import { useDebouncedValue } from '@/hooks/useDebounceValue'

interface UseQuestionsQueryProps {
  questions: Test[]
  searchQuery: string
  currentPage: number
  questionsPerPage: number
}

export function useQuestionsQuery({ questions, searchQuery, currentPage, questionsPerPage }: UseQuestionsQueryProps) {
  const debouncedSearchTerm = useDebouncedValue(searchQuery, 250)

  // Query to cache the unfiltered tests
  const { data: cachedQuestions } = useQuery({
    queryKey: ['categoryQuestions'],
    queryFn: async () => questions,
    initialData: questions,
    staleTime: 10 * 60 * 1000,
  })

  const filteredQuestionsQueryFn = async () => {
    if (!debouncedSearchTerm) return cachedQuestions

    return cachedQuestions.filter((test) => {
      const matchQuestion = test.data.question.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      return matchQuestion
    })
  }

  const { data: filteredQuestions } = useQuery({
    queryKey: ['filteredCategoryQuestions', debouncedSearchTerm],
    queryFn: filteredQuestionsQueryFn,
    enabled: !!debouncedSearchTerm || true,
    staleTime: 10 * 60 * 1000,
  })

  const paginatedData = useMemo(() => {
    const questionsToUse = filteredQuestions ?? cachedQuestions
    const totalItems = questionsToUse.length
    const totalPages = Math.max(1, Math.ceil(totalItems / questionsPerPage))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const indexOfLastQuestion = safeCurrentPage * questionsPerPage
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage

    return {
      currentQuestions: questionsToUse.slice(indexOfFirstQuestion, indexOfLastQuestion),
      totalPages,
    }
  }, [filteredQuestions, cachedQuestions, currentPage, questionsPerPage])

  return {
    ...paginatedData,
    isLoading: false,
    totalFilteredQuestions: (filteredQuestions ?? cachedQuestions).length,
  }
}

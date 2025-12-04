'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Test } from '@/types/dataTypes'
import { UserCustomCategory } from '@/server/db/schema'
import CategoriesPanel from './CategoriesPanel'
import QuestionsPanel from './QuestionsPanel'
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery'

const QUESTIONS_PER_PAGE = 12

interface Props {
  initialCategories: UserCustomCategory[]
  questions: Test[]
}

export default function CustomCategoryManager({ initialCategories, questions }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const testsArr = Array.isArray(questions) ? questions : Object.values(questions)

  const { data: cachedTests = []} = useQuery({
    queryKey: ['allTests', questions[0]?.category ?? 'custom-categories'],
    queryFn: async () => testsArr,
    initialData: testsArr,
    staleTime: 10 * 60 * 1000,
  })
  
  const customCategories = initialCategories.map(cat => ({
    id: cat.id,
    name: cat.categoryName,
    questionIds: cat.questionIds as string[]
  }))

  const { currentQuestions, totalPages } = useQuestionsQuery({
    questions: cachedTests as Test [],
    searchQuery,
    currentPage,
    questionsPerPage: QUESTIONS_PER_PAGE,
  })

  return (
    <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 min-h-[calc(100vh-64px)]">
      <CategoriesPanel
        categories={customCategories}
        questions={cachedTests as Test []}
      />
      <QuestionsPanel
        questions={currentQuestions}
        customCategories={customCategories}
        searchQuery={searchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        onSearch={setSearchQuery}
        onPrevPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        onNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
      />
    </div>
  )
}

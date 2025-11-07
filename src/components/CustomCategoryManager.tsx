'use client'

import { useState } from 'react'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import { Test } from '@/types/dataTypes'
import CategoriesPanel from './CategoriesPanel'
import QuestionsPanel from './QuestionsPanel'
import { useQuestionsQuery } from '@/hooks/useQuestionsQuery'

const QUESTIONS_PER_PAGE = 12

interface Props {
  questions: Test[]
}

export default function CustomCategoryManager({ questions }: Props) {
  const { customCategories, addQuestionToCategory, removeQuestionFromCategory } = useQuestionSelectionStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { currentQuestions, totalPages } = useQuestionsQuery({
    questions,
    searchQuery,
    currentPage,
    questionsPerPage: QUESTIONS_PER_PAGE,
  })

  const handleToggleCategory = (categoryId: string, questionId: string) => {
    if (customCategories.find((cat) => cat.id === categoryId)?.questionIds.includes(questionId)) {
      removeQuestionFromCategory(categoryId, questionId)
    } else {
      addQuestionToCategory(categoryId, questionId)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 min-h-[calc(100vh-64px)]">
      <CategoriesPanel questions={questions} />
      <QuestionsPanel
        questions={currentQuestions}
        customCategories={customCategories}
        searchQuery={searchQuery}
        currentPage={currentPage}
        totalPages={totalPages}
        onSearch={setSearchQuery}
        onPrevPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        onNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        onToggleCategory={handleToggleCategory}
      />
    </div>
  )
}

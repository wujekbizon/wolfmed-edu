'use client'

import React from 'react'
import { Test } from '@/types/dataTypes'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import { useState } from 'react'
import DefaultTestOptions from './DefaultTestOptions'
import CustomTestOptions from './CustomTestOptions'

interface Props {
  isLoading?: boolean
  allQuestions?: Test[]
  onSelectQuestions?: (questions: Test[] | null) => void
}

export default function TestsLevelMenu({ isLoading, allQuestions, onSelectQuestions }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState<'all' | 'custom'>('all')
  const { customCategories } = useQuestionSelectionStore()

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (!allQuestions || !onSelectQuestions) return

    const category = customCategories.find((cat) => cat.id === categoryId)
    if (category) {
      const selectedQuestions = allQuestions.filter((q) => category.questionIds.includes(q.id))
      onSelectQuestions(selectedQuestions)
    }
  }

  const handleSourceChange = (source: 'all' | 'custom') => {
    setActiveSource(source)
    if (source === 'all') {
      setSelectedCategory(null)
      onSelectQuestions?.(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 rounded-2xl border bg-zinc-800/30 backdrop-blur-md border-zinc-600/20 shadow-md p-2 xs:p-4 sm:p-8">
        <div className="flex justify-center">
          <div className="inline-flex p-1 gap-1 bg-zinc-100 rounded-lg">
            <button
              onClick={() => handleSourceChange('all')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all
                ${
                  activeSource === 'all'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
            >
              Wszystkie pytania
            </button>
            <button
              onClick={() => handleSourceChange('custom')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all
                ${
                  activeSource === 'custom'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
            >
              Moje kategorie
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin scrollbar-track-zinc-200 scrollbar-thumb-zinc-400 pr-2">
          {activeSource === 'all' ? (
            <DefaultTestOptions isLoading={isLoading ?? false} />
          ) : (
            <CustomTestOptions
              isLoading={isLoading ?? false}
              onSelectCategory={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
      </div>
    </div>
  )
}

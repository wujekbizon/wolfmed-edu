'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import { useProblematicQuestionsStore } from '@/store/useProblematicQuestionsStore'
import LearningPaginationControls from './LearningPaginationControls'
import ProblematicQuestionCard from './ProblematicQuestionCard'
import type { ProblematicQuestion } from '@/types/analyticsTypes'

interface QuestionAccuracyListProps {
  questions: ProblematicQuestion[]
}

export default function QuestionAccuracyList({ questions }: QuestionAccuracyListProps) {
  const { searchTerm, setSearchTerm, currentPage, perPage, setCurrentPage } = useProblematicQuestionsStore()
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: cachedQuestions } = useQuery({
    queryKey: ['problematicQuestions'],
    queryFn: async () => questions,
    initialData: questions,
    staleTime: 10 * 60 * 1000,
  })

  const filteredQuestionsQueryFn = async () => {
    if (!debouncedSearchTerm) return cachedQuestions

    return cachedQuestions.filter((question) => {
      const matchQuestion = question.questionText.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchCategory = question.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchAnswer = question.correctAnswer.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      return matchQuestion || matchCategory || matchAnswer
    })
  }

  const { data: filteredQuestions } = useQuery({
    queryKey: ['filteredProblematicQuestions', debouncedSearchTerm],
    queryFn: filteredQuestionsQueryFn,
    enabled: true,
    staleTime: 10 * 60 * 1000,
  })

  const questionsToDisplay = filteredQuestions ?? cachedQuestions
  const totalPages = Math.ceil(questionsToDisplay.length / perPage)

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages)
  }

  const startIndex = (currentPage - 1) * perPage
  const paginatedQuestions = questionsToDisplay.slice(startIndex, startIndex + perPage)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-4 sm:p-6 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Problematyczne pytania</h3>
        <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
          <p className="text-center">Świetna robota! Nie masz pytań z niską dokładnością.</p>
          <p className="text-sm text-zinc-400 mt-2">Pytania z dokładnością poniżej 50% pojawią się tutaj</p>
        </div>
      </div>
    )
  }

  const emptySlots = perPage - paginatedQuestions.length
  const placeholders = emptySlots > 0 ? Array.from({ length: emptySlots }) : []

  return (
    <div ref={listRef} className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Problematyczne pytania</h3>
            <p className="text-sm text-zinc-600">Pytania, w których popełniasz najwięcej błędów</p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj pytania..."
              className="w-full px-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9898]/50 focus:border-[#ff9898] bg-white/80"
            />
          </div>
        </div>
        {questionsToDisplay.length > 0 && (
          <p className="text-xs text-zinc-500">
            Wyświetlono {startIndex + 1}-{Math.min(startIndex + perPage, questionsToDisplay.length)} z {questionsToDisplay.length} pytań
          </p>
        )}
      </div>

      {questionsToDisplay.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
          <p className="text-center">Nie znaleziono pytań pasujących do wyszukiwania</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-4 min-h-[600px]">
            {paginatedQuestions.map((question) => (
              <ProblematicQuestionCard key={question.questionId} question={question} />
            ))}

            {placeholders.map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="p-3 sm:p-4 bg-zinc-50/50 rounded-lg border border-zinc-200/40 opacity-40"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-zinc-100 text-zinc-400 rounded-full border border-zinc-200">
                    Pusty slot
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-400 mb-3 leading-relaxed">
                  Brak pytania
                </p>
                <div className="h-16"></div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="bg-white/60 rounded-lg border border-zinc-200/60">
              <LearningPaginationControls totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

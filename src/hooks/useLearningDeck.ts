'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from './useDebounceValue'
import { usePracticeSession } from './usePracticeSession'
import { usePracticeSupport } from './usePracticeSupport'
import { useWolfekAnswerReaction } from './useWolfekAnswerReaction'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import { buildPracticeCardView } from '@/helpers/buildPracticeCardView'
import { filterLearningCards } from '@/helpers/filterLearningCards'
import { getLearningCardFilterCounts } from '@/helpers/getLearningCardFilterCounts'
import type { LearningDeckProps } from '@/types/learningUiTypes'
import type { LearningCardFilter } from '@/types/learningUiTypes'
import type { PracticeTutorAttachment } from '@/types/learningPracticeTypes'

export function useLearningDeck({ questions, category, userId, initialSession, premium }: LearningDeckProps) {
  const search = useSearchTermStore()
  const [focusedId, focus] = useState<string | null>(null)
  const [compareId, compare] = useState<string | null>(null)
  const [filter, setFilter] = useState<LearningCardFilter>('all')
  const [tutor, setTutor] = useState<PracticeTutorAttachment | null>(null)
  const [advanceToId, setAdvanceToId] = useState<string | null>(null)
  const query = usePracticeSession(userId, category, initialSession)
  const { reaction, onAnswered } = useWolfekAnswerReaction()
  const session = query.data ?? null
  usePracticeSupport(query.authorized ? session : null, query.update)
  const term = useDebouncedValue(search.searchTerm, 250)
  useEffect(() => {
    search.openCategory(category)
    setFilter('all')
  }, [category, search.openCategory])
  const progress = useMemo(() => new Map((session?.cards ?? []).map((card) =>
    [`${card.id}:${card.revision}`, card] as const)), [session?.cards])
  const { data: filtered = questions } = useQuery({
    queryKey: ['learningQuestions', userId, category, term, filter, session?.version],
    queryFn: () => filterLearningCards(questions, term, filter, progress),
    initialData: () => filterLearningCards(questions, term, filter, progress),
    staleTime: 600_000,
    gcTime: 0,
  })
  const matchesSearch = useMemo(() => filterLearningCards(questions, term, 'all', progress),
    [questions, term, progress])
  const filterCounts = getLearningCardFilterCounts(matchesSearch, progress)
  const perPage = Math.max(1, search.perPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const page = Math.max(1, Math.min(search.pageByCategory[category] ?? 1, totalPages))
  const start = (page - 1) * perPage
  const pageQuestions = filtered.slice(start, start + perPage)
  useEffect(() => {
    if (!advanceToId || !pageQuestions.some((card) => card.id === advanceToId)) return
    focus(advanceToId)
    setAdvanceToId(null)
    requestAnimationFrame(() => {
      const nextCard = document.getElementById(`learning-card-${advanceToId}`)
      nextCard?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      nextCard?.focus({ preventScroll: true })
    })
  }, [advanceToId, pageQuestions])
  const question = pageQuestions.find((q) => q.id === focusedId) ?? pageQuestions[0]
  const currentFilteredIndex = question ? filtered.findIndex((card) => card.id === question.id) : -1
  const canContinue = currentFilteredIndex >= 0 && currentFilteredIndex < filtered.length - 1
  const index = question ? questions.findIndex((q) => q.id === question.id) : 0
  const companion = question ? buildPracticeCardView(category, question, index, questions.length,
    session, session?.cards.find((card) => card.id === question.id && card.revision === question.revision)) : null

  const changePage = (next: number) => {
    search.setCurrentPage(next)
    focus(null)
    compare(null)
    document.getElementById('learning-card-feed')?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  const changeFilter = (next: LearningCardFilter) => {
    setFilter(next)
    search.setCurrentPage(1)
    focus(null)
    compare(null)
  }
  const continueToNextCard = () => {
    if (!canContinue) return false
    const next = filtered[currentFilteredIndex + 1]
    if (!next) return false
    const nextPage = Math.floor((currentFilteredIndex + 1) / perPage) + 1
    setAdvanceToId(next.id)
    if (nextPage !== page) search.setCurrentPage(nextPage)
    compare(null)
    return true
  }
  const askTutor = () => {
    const card = companion?.question
    if (!premium || !card || !companion.id || card.correctIndex === null || card.invalid) return
    setTutor({ sessionId: companion.id, questionId: card.id, questionRevision: card.revision,
      attemptId: card.attemptId, purpose: 'explain', questionNumber: index + 1 })
  }
  return { search, session, update: query.update, error: query.error, authorized: query.authorized,
    pageQuestions, total: filtered.length, filter, filterCounts, changeFilter,
    page, totalPages, question, companion,
    focus, compareId, compare, tutor, setTutor, askTutor, changePage, reaction, onAnswered,
    continueToNextCard, canContinue }
}

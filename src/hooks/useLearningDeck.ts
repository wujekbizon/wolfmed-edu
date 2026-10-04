'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from './useDebounceValue'
import { usePracticeSession } from './usePracticeSession'
import { useWolfekAnswerReaction } from './useWolfekAnswerReaction'
import { useLearningDeckNavigation } from './useLearningDeckNavigation'
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
  const query = usePracticeSession(userId, category, initialSession)
  const { reaction, onAnswered } = useWolfekAnswerReaction()
  const session = query.data ?? null
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
  const question = pageQuestions.find((q) => q.id === focusedId) ?? pageQuestions[0]
  const index = question ? questions.findIndex((q) => q.id === question.id) : 0
  const companion = question ? buildPracticeCardView(category, question, index, questions.length,
    session, session?.cards.find((card) => card.id === question.id && card.revision === question.revision)) : null

  const changeFilter = (next: LearningCardFilter) => {
    setFilter(next)
    search.setCurrentPage(1)
    focus(null)
    compare(null)
  }
  const navigation = useLearningDeckNavigation({ questions, filtered, pageQuestions, session,
    questionId: question?.id, page, perPage, onFocus: focus, onCompare: compare, onFilter: setFilter })
  const askTutor = () => {
    const card = companion?.question
    if (!premium || !card || !companion.id || card.correctIndex === null || card.invalid) return
    setTutor({ sessionId: companion.id, questionId: card.id, questionRevision: card.revision,
      attemptId: card.attemptId, purpose: 'explain', questionNumber: index + 1 })
  }
  return { search, session, update: query.update, error: query.error, authorized: query.authorized,
    pageQuestions, total: filtered.length, filter, filterCounts, changeFilter,
    page, totalPages, question, companion,
    focus, compareId, compare, tutor, setTutor, askTutor, changePage: navigation.changePage,
    reaction, onAnswered, continueToNextCard: navigation.continueToNextCard,
    reviewRevealedCard: navigation.reviewRevealedCard, canContinue: navigation.canContinue }
}

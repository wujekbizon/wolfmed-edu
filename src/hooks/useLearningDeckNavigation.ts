'use client'

import { useEffect, useState } from 'react'
import { useSearchTermStore } from '@/store/useSearchTermStore'
import type { LearningDeckNavigationProps } from '@/types/learningUiTypes'

export function useLearningDeckNavigation({
  questions, filtered, pageQuestions, session, questionId, page, perPage,
  onFocus, onCompare, onFilter,
}: LearningDeckNavigationProps) {
  const [advanceToId, setAdvanceToId] = useState<string | null>(null)
  const setCurrentPage = useSearchTermStore((state) => state.setCurrentPage)
  const clearSearchTerm = useSearchTermStore((state) => state.clearSearchTerm)
  const currentFilteredIndex = questionId ? filtered.findIndex((card) => card.id === questionId) : -1
  const canContinue = currentFilteredIndex >= 0 && currentFilteredIndex < filtered.length - 1

  useEffect(() => {
    if (!advanceToId || !pageQuestions.some((card) => card.id === advanceToId)) return
    onFocus(advanceToId)
    setAdvanceToId(null)
    requestAnimationFrame(() => {
      const nextCard = document.getElementById(`learning-card-${advanceToId}`)
      nextCard?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      nextCard?.focus({ preventScroll: true })
    })
  }, [advanceToId, pageQuestions, onFocus])

  const changePage = (next: number) => {
    setCurrentPage(next)
    onFocus(null)
    onCompare(null)
    document.getElementById('learning-card-feed')?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  const continueToNextCard = () => {
    if (!canContinue) return false
    const next = filtered[currentFilteredIndex + 1]
    if (!next) return false
    const nextPage = Math.floor((currentFilteredIndex + 1) / perPage) + 1
    setAdvanceToId(next.id)
    if (nextPage !== page) setCurrentPage(nextPage)
    onCompare(null)
    return true
  }
  const reviewRevealedCard = () => {
    const prior = session?.cards.find((card) => card.outcome === 'revealed' && card.id !== questionId &&
      questions.some((entry) => entry.id === card.id && entry.revision === card.revision && entry.practiceable))
    if (!prior) return false
    const targetIndex = questions.findIndex((card) => card.id === prior.id)
    clearSearchTerm()
    onFilter('all')
    setCurrentPage(Math.floor(targetIndex / perPage) + 1)
    setAdvanceToId(prior.id)
    onCompare(null)
    return true
  }
  return { changePage, continueToNextCard, reviewRevealedCard, canContinue }
}

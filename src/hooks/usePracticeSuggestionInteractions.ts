'use client'

import { startTransition } from 'react'
import { recordPracticeSuggestionAction } from '@/actions/learning-suggestion'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { PracticeView, PracticeSuggestionInteraction } from '@/types/learningPracticeTypes'

const EMPTY_DISMISSED: string[] = []

export function usePracticeSuggestionInteractions(userId: string, category: string, session: PracticeView | null) {
  const dismissed = useSettingsStore((state) => state.practiceDismissedSuggestions[userId] ?? EMPTY_DISMISSED)
  const dismissSuggestion = useSettingsStore((state) => state.dismissPracticeSuggestion)
  const recommendationKey = `${category}:${session?.question?.id}:${session?.question?.suggestedEventId}`
  const record = (interaction: PracticeSuggestionInteraction) => {
    const question = session?.question
    if (!session?.id || !question?.suggestedAction || !question.suggestedEventId) return
    const input = {
      category, sessionId: session.id, version: session.version, questionId: question.id,
      trigger: question.suggestedEventId, action: question.suggestedAction,
      interaction, eventId: crypto.randomUUID(),
    }
    startTransition(() => {
      void recordPracticeSuggestionAction(input).catch(() => undefined)
    })
  }
  const bubbleSession = session && dismissed.includes(recommendationKey) && session.question
    ? { ...session, question: { ...session.question, suggestedAction: null } } : session
  const hide = () => dismissSuggestion(userId, recommendationKey)
  return { bubbleSession, record, hide }
}

'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { practiceAction } from '@/actions/learning-practice'
import { recordPracticeHelpInteractionAction } from '@/actions/learning-help-interaction'
import { EMPTY_PRACTICE_STATE } from '@/constants/learningPractice'
import { useToastMessage } from '@/hooks/useToastMessage'
import { usePracticeTutorHandoff } from '@/hooks/usePracticeTutorHandoff'
import { usePracticeSuggestionInteractions } from '@/hooks/usePracticeSuggestionInteractions'
import type { PracticeCompanionMode } from '@/types/learningPracticeTypes'
import type { WolfekCompanionProps } from '@/types/learningUiTypes'

export function usePracticeCompanion({
  userId, category, session, premium, onSaved, onAskTutor, onCompare, onContinue, onReview,
}: WolfekCompanionProps) {
  const [mode, setMode] = useState<PracticeCompanionMode>('welcome')
  const { bubbleSession, record, hide } =
    usePracticeSuggestionInteractions(userId, category, session)
  const [state, action, pending] = useActionState(practiceAction, EMPTY_PRACTICE_STATE)
  const form = useRef<HTMLFormElement>(null)
  const eventInput = useRef<HTMLInputElement>(null)
  const commandInput = useRef<HTMLInputElement>(null)
  const events = useRef(new Map<string, string>())
  const callback = useRef(onSaved)
  const toast = useToastMessage(state)
  useEffect(() => { callback.current = onSaved }, [onSaved])
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.session) callback.current(state.session)
  }, [state])
  const runCommand = (command: string) => {
    if (!session?.question || !commandInput.current || !form.current || pending) return false
    commandInput.current.value = command
    form.current.requestSubmit()
    return true
  }
  const startRecommendedTutor = usePracticeTutorHandoff({ session, state, premium, pending,
    onAskTutor, onReveal: () => runCommand('reveal') })
  const compare = () => {
    setMode('compare')
    onCompare?.()
    const question = session?.question
    if (session?.id && question) {
      const input = {
        category, sessionId: session.id, version: session.version,
        questionId: question.id, eventId: crypto.randomUUID(), action: 'compare',
      }
      startTransition(() => {
        void recordPracticeHelpInteractionAction(input).catch(() => undefined)
      })
    }
  }
  const chat = () => {
    if (premium && session?.question?.correctIndex != null) onAskTutor()
    else setMode('chat')
  }
  const recommend = () => {
    if (session?.question?.suggestedAction === 'tutor') {
      if (startRecommendedTutor()) record('accepted')
      else setMode('chat')
      return
    }
    if (session?.question?.suggestedAction === 'continue') {
      if (onContinue()) record('accepted')
      else { record('dismissed'); hide() }
      return
    }
    if (session?.question?.suggestedAction === 'review') {
      if (onReview()) record('accepted')
      else { record('dismissed'); hide() }
      return
    }
    record('accepted')
    switch (session?.question?.suggestedAction) {
      case 'hint': setMode('hint'); if (!session?.question?.hintOpened) runCommand('hint'); break
      case 'compare': compare(); break
      case 'reveal': runCommand('reveal'); break
      default: document.getElementById(`learning-card-${session?.question?.id}`)?.focus({ preventScroll: true })
    }
  }
  const onSubmit = () => {
    const key = `${session?.version}:${session?.question?.id}:${commandInput.current?.value}`
    const id = events.current.get(key) ?? crypto.randomUUID()
    events.current.set(key, id)
    if (eventInput.current) eventInput.current.value = id
  }
  const openHint = () => { setMode('hint'); if (!session?.question?.hintOpened) runCommand('hint') }
  const dismissRecommendation = () => { record('dismissed'); hide() }
  return { mode, setMode, bubbleSession, state, action, pending, form, eventInput, commandInput,
    toast, onSubmit, openHint, compare, chat, recommend, dismissRecommendation,
    recordNavigation: () => record('accepted'), runCommand }
}

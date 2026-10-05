'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { practiceAction } from '@/actions/learning-practice'
import { recordPracticeHelpInteractionAction } from '@/actions/learning-help-interaction'
import { EMPTY_PRACTICE_STATE } from '@/constants/learningPractice'
import { useToastMessage } from '@/hooks/useToastMessage'
import { usePracticeTutorHandoff } from '@/hooks/usePracticeTutorHandoff'
import { usePracticeSuggestionInteractions } from '@/hooks/usePracticeSuggestionInteractions'
import { usePracticeWolfekQuestions } from '@/hooks/usePracticeWolfekQuestions'
import type { PracticeCompanionMode } from '@/types/learningPracticeTypes'
import type { WolfekCompanionProps } from '@/types/learningUiTypes'

export function usePracticeCompanion(props: WolfekCompanionProps) {
  const { userId, category, session, premium, onSaved, onAskTutor, onCompare } = props
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
    if (state.session) callback.current(state.session)
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
  const onSubmit = () => {
    const key = `${session?.version}:${session?.question?.id}:${commandInput.current?.value}`
    const id = events.current.get(key) ?? crypto.randomUUID()
    events.current.set(key, id)
    if (eventInput.current) eventInput.current.value = id
  }
  const dismissRecommendation = () => { record('dismissed'); hide() }
  const questions = usePracticeWolfekQuestions(props,
    { hintOpened: () => setMode('hint'), compare, openTutor: onAskTutor, revealTutor: startRecommendedTutor })
  return { mode, setMode, bubbleSession, state, action, pending: pending || questions.pending, form, eventInput, commandInput,
    toast, onSubmit, openHint: () => questions.submitPrepared('hint'),
    compare: () => questions.submitPrepared('compare'), chat: () => questions.submitPrepared('assistant'),
    recommend: questions.recommendation, dismissRecommendation, questions,
    recordNavigation: () => record('accepted'), runCommand }
}

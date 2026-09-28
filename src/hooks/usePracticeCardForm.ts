'use client'

import { useActionState, useEffect, useRef } from 'react'
import { practiceAction } from '@/actions/learning-practice'
import { EMPTY_PRACTICE_STATE } from '@/constants/learningPractice'
import { usePracticeSelectionStore } from '@/store/usePracticeSelectionStore'
import type { PracticeQuestionCardProps } from '@/types/learningUiTypes'

export function usePracticeCardForm({ userId, category, question, onSaved, onAnswered }: PracticeQuestionCardProps) {
  const [state, action, pending] = useActionState(practiceAction, EMPTY_PRACTICE_STATE)
  const eventInput = useRef<HTMLInputElement>(null)
  const submittedEventId = useRef<string | null>(null)
  const events = useRef(new Map<string, string>())
  const callback = useRef({ onSaved, onAnswered })
  const answered = useRef<string | null>(null)
  const key = `${userId}:${category}:${question.id}`
  const selected = usePracticeSelectionStore((store) => store.selections[key])
  const select = usePracticeSelectionStore((store) => store.select)
  const clear = usePracticeSelectionStore((store) => store.clear)
  useEffect(() => { callback.current = { onSaved, onAnswered } }, [onSaved, onAnswered])
  useEffect(() => {
    if (state.status !== 'SUCCESS' || !state.session) return
    callback.current.onSaved(state.session)
    const result = state.session.question
    if (result?.attemptId && result.attemptId === submittedEventId.current && result.attemptId !== answered.current) {
      answered.current = result.attemptId
      callback.current.onAnswered(result)
    }
  }, [state])
  useEffect(() => () => clear(key), [clear, key])
  return { state, action, pending, eventInput, submittedEventId, events, selected,
    select: (index: number) => select(key, index), clearSelection: () => clear(key) }
}

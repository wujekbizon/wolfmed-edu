'use client'

import { useEffect, useState } from 'react'
import type { PracticeTutorHandoffProps } from '@/types/learningUiTypes'

export function usePracticeTutorHandoff({
  session, state, premium, pending, onAskTutor, onReveal,
}: PracticeTutorHandoffProps) {
  const [handoff, setHandoff] = useState<{ questionId: string; stateTimestamp: number } | null>(null)
  useEffect(() => {
    if (!handoff) return
    const question = session?.question
    const submitted = state.session?.question
    if (!question || question.id !== handoff.questionId ||
      (state.timestamp !== handoff.stateTimestamp && (state.status === 'ERROR' ||
        (state.status === 'SUCCESS' && (!submitted || submitted.id !== handoff.questionId ||
          submitted.correctIndex === null))))) {
      setHandoff(null)
      return
    }
    if (question.correctIndex === null) return
    setHandoff(null)
    onAskTutor()
  }, [handoff, session?.question?.id, session?.question?.correctIndex,
    state.session?.question?.id, state.session?.question?.correctIndex,
    state.status, state.timestamp, onAskTutor])

  return () => {
    const question = session?.question
    if (!premium || !question || pending) return false
    if (question.correctIndex !== null) { onAskTutor(); return true }
    if (question.invalid || !onReveal()) return false
    setHandoff({ questionId: question.id, stateTimestamp: state.timestamp })
    return true
  }
}

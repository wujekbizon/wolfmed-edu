'use client'

import { useEffect, useState } from 'react'
import type { PracticeView } from '@/types/learningPracticeTypes'
import type { WolfekAnswerReaction } from '@/types/wolfekTypes'

export function useWolfekAnswerReaction() {
  const [reaction, setReaction] = useState<WolfekAnswerReaction | null>(null)

  useEffect(() => {
    if (!reaction) return
    const timeout = setTimeout(() => setReaction(null), 1200)
    return () => clearTimeout(timeout)
  }, [reaction])

  const onAnswered = (question: NonNullable<PracticeView['question']>) => {
    if (!question.attemptId || question.correct === null) return
    if (question.correct && question.attempts !== 1) return
    setReaction({ eventId: question.attemptId, gesture: question.correct ? 'yes' : 'no' })
  }

  return { reaction, onAnswered }
}

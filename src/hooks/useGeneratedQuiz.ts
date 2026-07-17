'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import {
  generateProcedureQuizAction,
  submitGeneratedQuizAction,
} from '@/actions/generatedQuizzes'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import type { AiChallengeType, GeneratedQuizPlayView } from '@/types/generatedQuizTypes'
import type { QuizPhase, QuizReviewItem } from '@/types/quizUiTypes'

/**
 * State machine for the AI quiz flow: intro → playing → result. Answers are
 * collected client-side; grading and answer reveal happen server-side.
 */
export function useGeneratedQuiz(initialQuiz: GeneratedQuizPlayView | null) {
  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [quiz, setQuiz] = useState<GeneratedQuizPlayView | null>(initialQuiz)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [review, setReview] = useState<QuizReviewItem[]>([])
  const [score, setScore] = useState(0)
  const startTimeRef = useRef(Date.now())

  const [generateState, generateAction, isGenerating] = useActionState(
    generateProcedureQuizAction,
    EMPTY_FORM_STATE
  )
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitGeneratedQuizAction,
    EMPTY_FORM_STATE
  )

  useEffect(() => {
    if (generateState.status !== 'SUCCESS' || !generateState.values?.playView) return
    setQuiz(JSON.parse(generateState.values.playView as string))
    setAnswers({})
    setSelectedErrors([])
    setSelectedOption(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }, [generateState])

  useEffect(() => {
    if (submitState.status !== 'SUCCESS' || submitState.values?.review === undefined) return
    setReview(JSON.parse(submitState.values.review as string))
    setScore(Number(submitState.values.score ?? 0))
    setPhase('result')
  }, [submitState])

  const playExisting = () => {
    if (!quiz) return
    setAnswers({})
    setSelectedErrors([])
    setSelectedOption(null)
    startTimeRef.current = Date.now()
    setPhase('playing')
  }

  const buildAnswersJson = (challengeType: AiChallengeType): string => {
    if (challengeType === 'knowledge-quiz') return JSON.stringify(answers)
    if (challengeType === 'spot-error') return JSON.stringify(selectedErrors)
    return JSON.stringify(selectedOption)
  }

  const elapsedSeconds = () =>
    Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))

  const toggleError = (stepId: string) =>
    setSelectedErrors((current) =>
      current.includes(stepId)
        ? current.filter((id) => id !== stepId)
        : [...current, stepId]
    )

  const selectAnswer = (questionId: string, optionIndex: number) =>
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }))

  return {
    phase, quiz, answers, selectedErrors, selectedOption, review, score,
    generateState, generateAction, isGenerating,
    submitState, submitAction, isSubmitting,
    playExisting, buildAnswersJson, elapsedSeconds,
    toggleError, selectAnswer, setSelectedOption,
  }
}

export type GeneratedQuizController = ReturnType<typeof useGeneratedQuiz>

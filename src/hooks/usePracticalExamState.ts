'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gradePracticalExamAction } from '@/actions/praktyczny'
import { useToastMessage } from '@/hooks/useToastMessage'
import { toPracticalExamFormState } from '@/helpers/toPracticalExamFormState'
import { buildInitialPracticalExamAnswers } from '@/helpers/buildInitialPracticalExamAnswers'
import { EMPTY_PRACTICAL_EXAM_STATE } from '@/types/praktycznyTypes'
import type { ExamAnswers, PublicExam } from '@/types/praktycznyTypes'
import type { PracticalExamStage } from '@/types/practicalExamWorkspaceTypes'

export function usePracticalExamState(exam: PublicExam) {
  const [stage, setStage] = useState<PracticalExamStage>('brief')
  const [answers, setAnswers] = useState<ExamAnswers>(() => buildInitialPracticalExamAnswers(exam))
  const [startTime, setStartTime] = useState(0)
  const [state, action, isPending] = useActionState(gradePracticalExamAction, EMPTY_PRACTICAL_EXAM_STATE)
  const prevTimestamp = useRef(state.timestamp)
  const submitting = useRef(false)
  const formState = toPracticalExamFormState(state)
  const noScriptFallback = useToastMessage(formState)

  useEffect(() => {
    if (!isPending) submitting.current = false
  }, [isPending, state.timestamp])

  const handleSubmitCapture = (event: FormEvent<HTMLFormElement>) => {
    if (submitting.current) {
      event.preventDefault()
      return
    }
    submitting.current = true
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000))
    const field = event.currentTarget.elements.namedItem('timeSpent') as HTMLInputElement | null
    if (field) field.value = String(elapsed)
  }

  useEffect(() => {
    if (state.timestamp === prevTimestamp.current) return
    prevTimestamp.current = state.timestamp
    if (state.status === 'SUCCESS' && state.result) setStage('results')
  }, [state])

  const handleValueChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleListLineChange = (key: string, line: number, value: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[key]) ? [...(prev[key] as string[])] : []
      current[line] = value
      return { ...prev, [key]: current }
    })
  }

  const handleOrderChange = (taskIndex: number, order: string[]) => {
    setAnswers((prev) => ({ ...prev, [`procedure:${taskIndex}`]: order }))
  }

  const handleChoiceToggle = (key: string, optionId: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : []
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      return { ...prev, [key]: next }
    })
  }

  const handleStart = () => {
    submitting.current = false
    setStartTime(Date.now())
    setStage('exam')
  }

  const handleRestart = () => {
    submitting.current = false
    setAnswers(buildInitialPracticalExamAnswers(exam))
    setStartTime(0)
    setStage('brief')
  }

  return { stage, answers, state, formState, noScriptFallback, action, isPending, startTime, handleSubmitCapture, handleValueChange, handleListLineChange, handleOrderChange, handleChoiceToggle, handleStart, handleRestart }
}

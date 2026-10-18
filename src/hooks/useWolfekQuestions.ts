'use client'

import { startTransition, useActionState, useId, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { askWolfekQuestionAction } from '@/actions/wolfek-questions'
import { answerWolfekPreparedQuestionAction } from '@/actions/wolfek-prepared'
import { EMPTY_WOLFEK_QUESTION } from '@/constants/wolfekResponses'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import { toFormState } from '@/helpers/toFormState'
import { resolveWolfekQuestionResult } from '@/helpers/resolveWolfekQuestionResult'
import type { WolfekQuestionProps, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export function useWolfekQuestions(props: WolfekQuestionProps) {
  const { route, practice } = props
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const instance = useId()
  const viewer = isLoaded ? user?.id ?? 'anonymous' : 'loading'
  const scope = `${instance}:${pathname}:${viewer}:${route}:${practice?.questionId ?? ''}:${practice?.revision ?? ''}:${practice?.selected ?? ''}`
  const current = useRef(scope)
  current.current = scope
  const [thinking, setThinking] = useState(false)
  const [state, action, pending] = useActionState(async (previous: WolfekQuestionState, data: FormData) => {
    const submittedScope = current.current
    let result: WolfekQuestionState
    try {
      const restored = data.get('origin') === 'prepared' ? props.preparedResult?.(String(data.get('preparedQuestionId'))) : null
      if (restored) result = restored
      else {
        setThinking(true)
        result = data.get('origin') === 'prepared' ? await answerWolfekPreparedQuestionAction(data)
          : await askWolfekQuestionAction(previous, data)
      }
    } catch (error) {
      result = { ...toFormState('ERROR', error instanceof Error ? error.message : 'Nie mogę teraz odpowiedzieć.'),
        answer: null, confidence: null }
    } finally { setThinking(false) }
    return resolveWolfekQuestionResult(result, submittedScope, current.current, props.onSession)
  }, EMPTY_WOLFEK_QUESTION)
  const prepareForm = (data: FormData) => {
    data.set('route', route)
    data.set('submissionId', crypto.randomUUID())
    data.set('practice', practice ? JSON.stringify(practice) : '')
    if (props.recentMessages) data.set('recentMessages', JSON.stringify(props.recentMessages))
  }
  const submitPrepared = (id: string) => {
    const button = getWolfekPreparedQuestion(route, id)
    if (!button || pending || !isLoaded) return
    const data = new FormData()
    prepareForm(data)
    data.set('question', button.prompt)
    data.set('origin', 'prepared')
    data.set('preparedQuestionId', id)
    startTransition(() => action(data))
  }
  const stale = state.values?.viewScope !== scope || (practice && state.status === 'SUCCESS' &&
    state.values?.practiceVersion !== practice.version && state.session?.version !== practice.version)
  return { state: stale ? EMPTY_WOLFEK_QUESTION : state, action,
    pending: pending || !isLoaded, viewer, thinking, submitPrepared }
}

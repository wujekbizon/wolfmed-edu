'use client'

import { startTransition, useActionState, useRef, useState } from 'react'
import { askWolfekQuestionAction } from '@/actions/wolfek-questions'
import { EMPTY_WOLFEK_QUESTION } from '@/constants/wolfekResponses'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import { toFormState } from '@/helpers/toFormState'
import { useWolfekPreparedVisit } from './useWolfekPreparedVisit'
import type { WolfekQuestionProps, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export function useWolfekQuestions(props: WolfekQuestionProps) {
  const { route, practice } = props
  const prepared = useWolfekPreparedVisit(props)
  const scope = `${prepared.visit.id}:${prepared.visit.viewer}:${route}:${practice?.questionId ?? ''}:${practice?.revision ?? ''}:${practice?.selected ?? ''}`
  const current = useRef(scope)
  current.current = scope
  const [thinking, setThinking] = useState(false)
  const [state, action, pending] = useActionState(async (previous: WolfekQuestionState, data: FormData) => {
    const submittedScope = current.current
    let result: WolfekQuestionState
    try {
      if (data.get('origin') === 'prepared') result = props.preparedResult?.(String(data.get('preparedQuestionId'))) ??
        await prepared.usePrepared(data, () => setThinking(true))
      else { setThinking(true); result = await askWolfekQuestionAction(previous, data) }
    } catch (error) {
      result = { ...toFormState('ERROR', error instanceof Error ? error.message : 'Nie mogę teraz odpowiedzieć.'),
        answer: null, confidence: null }
    } finally { setThinking(false) }
    return submittedScope === current.current
      ? { ...result, values: { ...result.values, viewScope: submittedScope } } : EMPTY_WOLFEK_QUESTION
  }, EMPTY_WOLFEK_QUESTION)
  const prepareForm = (data: FormData) => {
    data.set('route', route)
    data.set('submissionId', crypto.randomUUID())
    data.set('practice', practice ? JSON.stringify(practice) : '')
    if (props.recentMessages) data.set('recentMessages', JSON.stringify(props.recentMessages))
  }
  const submitPrepared = (id: string) => {
    const button = getWolfekPreparedQuestion(route, id)
    if (!button || pending || !prepared.visit.ready) return
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
    pending: pending || !prepared.visit.ready, viewer: prepared.visit.viewer, thinking, prepareForm, submitPrepared }
}

'use client'

import { useEffect, useRef } from 'react'
import { useWolfekQuestions } from './useWolfekQuestions'
import { getPracticeWolfekQuestionId } from '@/helpers/getPracticeWolfekQuestionId'
import type { WolfekCompanionProps, PracticeWolfekQuestionHandlers } from '@/types/learningUiTypes'

export function usePracticeWolfekQuestions(props: WolfekCompanionProps, handlers: PracticeWolfekQuestionHandlers) {
  const card = props.session?.question
  const practice = card ? { category: props.category, sessionId: props.session?.id || null,
    version: props.session?.version ?? 0, questionId: card.id, revision: card.revision } : null
  const help = useWolfekQuestions({ route: 'learning.practice', practice })
  const callbacks = useRef({ props, handlers })
  callbacks.current = { props, handlers }
  const delivered = useRef(0)
  useEffect(() => {
    const { state } = help
    if (!state.answer || delivered.current === state.timestamp) return
    delivered.current = state.timestamp
    const { props: latest, handlers: actions } = callbacks.current
    if (state.session) latest.onSaved(state.session)
    const button = state.values?.preparedQuestionId
    const action = state.answer.action?.type
    if (action === 'show_hint') actions.hintOpened()
    if (action === 'highlight_comparison' && (button === 'compare' || button === 'accept_suggestion')) actions.compare()
    if (action === 'next_card' && (button === 'next' || button === 'accept_suggestion')) latest.onContinue()
    if (action === 'review_card' && (button === 'review' || button === 'accept_suggestion')) latest.onReview()
    if (action === 'open_tutor' && ['assistant', 'ask_tutor', 'reveal_tutor', 'accept_suggestion'].includes(String(button))) actions.openTutor()
    if (action === 'confirm_reveal_then_tutor' && (button === 'reveal_tutor' || button === 'accept_suggestion')) actions.revealTutor()
  }, [help.state])
  const recommendation = () => {
    help.submitPrepared(getPracticeWolfekQuestionId(props.session))
  }
  return { ...help, practice, recommendation }
}

'use client'

import { useEffect, useRef } from 'react'
import { useWolfekQuestions } from '@/hooks/useWolfekQuestions'
import type { WolfekQuestionChatProps } from '@/types/wolfekResponseTypes'
import WolfekPreparedQuestions from './WolfekPreparedQuestions'
import WolfekQuestionForm from './WolfekQuestionForm'
import WolfekSelectedResponse from './WolfekSelectedResponse'
import WolfekSpeech from './WolfekSpeech'

export default function WolfekQuestionChat(props: WolfekQuestionChatProps) {
  const help = useWolfekQuestions(props)
  const { onAnswer, onPendingChange } = props
  const delivered = useRef(0)
  useEffect(() => { onPendingChange?.(help.thinking) }, [help.thinking, onPendingChange])
  useEffect(() => {
    if (!help.state.answer || delivered.current === help.state.timestamp) return
    delivered.current = help.state.timestamp
    onAnswer?.(help.state.answer)
  }, [help.state, onAnswer])
  return <div className="panel-wolfek-chat">
    <WolfekSpeech revealKey={help.state.timestamp} pending={help.pending}
      answerText={help.state.answer?.text ?? ''}
      answerKey={!help.pending && help.state.answer ? help.state.timestamp : 0}>
    {help.thinking && <p role="status" className="wolfek-loading-text">Wolfek sprawdza…</p>}
    {!help.pending && help.state.answer && <WolfekSelectedResponse answer={help.state.answer}
      {...(props.onAction ? { onAction: props.onAction } : {})} />}
    {!help.pending && help.state.status === 'SUCCESS' && !help.state.answer &&
      <p role="status">Nie jestem pewien. Doprecyzuj pytanie.</p>}
    </WolfekSpeech>
    <WolfekPreparedQuestions route={props.route} pending={help.pending}
      onSelect={(id) => { props.onInteraction?.(); help.submitPrepared(id) }} />
    <WolfekQuestionForm {...props} state={help.state} pending={help.pending} action={help.action} />
  </div>
}

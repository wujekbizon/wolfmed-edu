'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import FieldError from '@/components/FieldError'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import { askPanelWolfekAction, getPanelWolfekTopicAction } from '@/actions/panel-wolfek'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { PANEL_WOLFEK_VIDEOS } from '@/constants/panelWolfekVideos'
import type { PanelWolfekAnswer, PanelWolfekAskState, PanelWolfekTopic } from '@/types/panelWolfekTypes'
import WolfekAvatar from './WolfekAvatar'
import WolfekGlassCard from './WolfekGlassCard'
import PanelWolfekTopicButtons from './PanelWolfekTopicButtons'
import PanelWolfekVideoButton from './PanelWolfekVideoButton'

export default function PanelWolfekCard({ intro, onIntroDone, onMinimize, onLocate, onVideo }: {
  intro: boolean
  onIntroDone: () => void
  onMinimize: () => void
  onLocate: (topic: PanelWolfekTopic) => void
  onVideo: (topic: PanelWolfekTopic) => void
}) {
  const [state, action, pending] = useActionState(askPanelWolfekAction,
    EMPTY_FORM_STATE as PanelWolfekAskState)
  const [manualAnswer, setManualAnswer] = useState<PanelWolfekAnswer | null | undefined>(undefined)
  const [topicPending, setTopicPending] = useState(false)
  const [videoHovered, setVideoHovered] = useState(false)
  const lastLocated = useRef(0)
  const eyes = useWolfekGaze()
  const toast = useToastMessage(state)
  const answer = pending || topicPending ? null : manualAnswer === undefined ? state.answer : manualAnswer
  const videoTopic = answer?.topic ?? 'first_steps'
  useEffect(() => {
    if (state.status !== 'SUCCESS' || !state.answer || lastLocated.current === state.timestamp) return
    lastLocated.current = state.timestamp
    onLocate(state.answer.topic)
  }, [state, onLocate])
  const onTopic = (topic: PanelWolfekTopic) => {
    onIntroDone()
    setManualAnswer(null)
    setTopicPending(true)
    startTransition(async () => {
      try {
        const next = await getPanelWolfekTopicAction(topic)
        setManualAnswer(next)
        if (next) onLocate(next.topic)
      }
      catch { setManualAnswer(null) }
      finally { setTopicPending(false) }
    })
  }
  return <WolfekGlassCard avatarRef={eyes.avatar}
    onMinimize={() => { setVideoHovered(false); onMinimize() }}
    onPointerMove={eyes.follow} onPointerLeave={eyes.reset} onPointerCancel={eyes.reset}
    avatar={<WolfekAvatar gaze={eyes.gaze} positive={false} supportive interactive videoHover={videoHovered} />}>
    <div className="wolfek-card-content panel-wolfek-content">
      <h2 className="panel-wolfek-title">Wolfek pomoże Ci w panelu</h2>
      {intro && <div className="panel-wolfek-answer">
        <p>Witaj! Pokażę Ci kursy, postępy i najważniejsze miejsca w panelu.</p>
        <Button type="button" size="sm" onClick={onIntroDone}>Pokaż, w czym mogę pomóc</Button>
      </div>}
      {!intro && <>
        {answer && <div className="panel-wolfek-answer" role="status">
          <p>{answer.text}</p>
          {answer.href && <div className="panel-wolfek-answer-actions">
            <Link href={answer.href}>Otwórz stronę →</Link>
          </div>}
        </div>}
        {state.status === 'SUCCESS' && state.answer === null && !manualAnswer &&
          <p className="panel-wolfek-answer" role="status">Nie jestem pewien. Wybierz temat albo zapytaj inaczej.</p>}
        <form action={action} onSubmit={() => { setManualAnswer(undefined); onIntroDone() }}>
          <Label htmlFor="panel-wolfek-question" label="O co chcesz zapytać?" />
          <div className="panel-wolfek-question-row">
            <Input id="panel-wolfek-question" name="question" type="text"
              className="panel-wolfek-input" placeholder="Np. gdzie zmienić motto?" />
            <Button type="submit" size="sm" shape="pill" variant="secondary"
              className="panel-wolfek-send" aria-label="Wyślij pytanie" disabled={pending}>
              <ArrowUp size={19} aria-hidden="true" />
            </Button>
          </div>
          <FieldError name="question" formState={state} />
          {toast}
        </form>
        <p className="panel-wolfek-topics-label">Lub wybierz temat</p>
        <PanelWolfekTopicButtons onSelect={onTopic} pending={topicPending || pending} />
      </>}
    </div>
    <PanelWolfekVideoButton available={Boolean(PANEL_WOLFEK_VIDEOS[videoTopic])}
      onClick={() => onVideo(videoTopic)} onHoverChange={setVideoHovered} />
  </WolfekGlassCard>
}

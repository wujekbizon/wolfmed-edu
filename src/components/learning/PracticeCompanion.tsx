'use client'

import { ArrowRight } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import FormError from '@/components/FormError'
import { usePracticeCompanion } from '@/hooks/usePracticeCompanion'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import type { WolfekCompanionProps } from '@/types/learningUiTypes'
import WolfekBubble from './WolfekBubble'
import PracticeCompanionActions from './PracticeCompanionActions'
import PracticeCompanionAvatar from './PracticeCompanionAvatar'
import WolfekGlassCard from '@/components/wolfek/WolfekGlassCard'
import WolfekSpeech from '@/components/wolfek/WolfekSpeech'
import WolfekQuestionForm from '@/components/wolfek/WolfekQuestionForm'
import PracticeWolfekResponseAction from './PracticeWolfekResponseAction'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import WolfekIntro from '@/components/wolfek/WolfekIntro'

export default function PracticeCompanion(props: WolfekCompanionProps) {
  const { session, category, premium, onMinimize } = props
  const help = usePracticeCompanion(props)
  const eyes = useWolfekGaze()
  return <><form ref={help.form} action={help.action} className="min-w-0"
    aria-label="Pomoc Wolfka" onSubmit={help.onSubmit}>
    <Input type="hidden" name="category" value={category} />
    <Input type="hidden" name="sessionId" value={session?.id ?? ''} />
    <Input type="hidden" name="questionId" value={session?.question?.id ?? ''} />
    <Input type="hidden" name="version" value={session?.version ?? 0} />
    <Input type="hidden" name="eventId" inputRef={help.eventInput} />
    <Input type="hidden" name="command" defaultValue="" inputRef={help.commandInput} />
    </form><WolfekGlassCard avatarRef={eyes.avatar} onPointerMove={eyes.follow} onPointerLeave={eyes.reset}
      onPointerCancel={eyes.reset} onMinimize={onMinimize}
      avatar={<PracticeCompanionAvatar session={session} reaction={props.reaction} gaze={eyes.gaze} interactive />}>
      <div className="wolfek-card-content">
        <WolfekIntro description="Pomogę Ci z bieżącym pytaniem i kolejnym krokiem w nauce." />
        <WolfekSpeech revealKey={help.questions.state.timestamp} pending={help.pending}
          answerText={help.questions.state.answer?.text ?? ''}
          answerKey={!help.pending && help.questions.state.answer ? help.questions.state.timestamp : 0}>
          <WolfekBubble session={help.bubbleSession} mode={help.mode} premium={premium}
            pending={help.pending} answerText={help.questions.state.answer?.text ?? null} onRecommend={help.recommend}
            onDismiss={help.dismissRecommendation} onNavigate={help.recordNavigation} />
          <PracticeWolfekResponseAction answer={help.questions.state.answer} pending={help.pending}
            onRevealTutor={() => help.questions.submitPrepared('reveal_tutor')} />
        </WolfekSpeech>
        <PracticeCompanionActions mode={help.mode} premium={premium}
          answerVisible={Boolean(session?.question && session.question.correctIndex !== null)}
          suggestedAction={session?.question?.suggestedAction ?? null}
          enabled={Boolean(session?.status === 'active' && session.question && !session.question.invalid)}
          resolved={Boolean(session?.question?.resolved)} pending={help.pending}
          onMode={help.setMode} onHint={help.openHint}
          onCompare={help.compare} onAskTutor={help.chat} />
        <WolfekQuestionForm route="learning.practice" practice={help.questions.practice}
          state={help.questions.state} pending={help.pending} action={help.questions.action} />
        <div className="practice-companion-base">
          {props.canContinue && <Button type="button" size="sm" variant="ghost"
            className="practice-companion-next" disabled={help.pending}
            onClick={() => help.questions.submitPrepared('next')}>{getWolfekPreparedQuestion('learning.practice', 'next')?.prompt} <ArrowRight size={14} aria-hidden="true" /></Button>}
        </div>
      </div>
    </WolfekGlassCard>
    <FormError formState={help.state} />
    {help.pending && <p role="status" className="sr-only">Zapisywanie…</p>}
    {help.toast}
  </>
}

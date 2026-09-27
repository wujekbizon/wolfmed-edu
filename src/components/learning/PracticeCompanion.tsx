'use client'

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

export default function PracticeCompanion(props: WolfekCompanionProps) {
  const { session, category, premium, onMinimize } = props
  const help = usePracticeCompanion(props)
  const eyes = useWolfekGaze()
  return <form ref={help.form} action={help.action} className="min-w-0"
    aria-label="Pomoc Wolfka" onSubmit={help.onSubmit}>
    <Input type="hidden" name="category" value={category} />
    <Input type="hidden" name="sessionId" value={session?.id ?? ''} />
    <Input type="hidden" name="questionId" value={session?.question?.id ?? ''} />
    <Input type="hidden" name="version" value={session?.version ?? 0} />
    <Input type="hidden" name="eventId" inputRef={help.eventInput} />
    <Input type="hidden" name="command" defaultValue="" inputRef={help.commandInput} />
    <WolfekGlassCard avatarRef={eyes.avatar} onPointerMove={eyes.follow} onPointerLeave={eyes.reset}
      onPointerCancel={eyes.reset} onMinimize={onMinimize}
      avatar={<PracticeCompanionAvatar session={session} reaction={props.reaction} gaze={eyes.gaze} interactive />}>
      <div className="wolfek-card-content">
        <div className="practice-companion-orbit-decoration" aria-hidden="true">
          <span className="practice-companion-orbit-ring practice-companion-orbit-ring-outer" />
          <span className="practice-companion-orbit-ring practice-companion-orbit-ring-inner" />
        </div>
        <div className="practice-companion-detail">
          <WolfekBubble session={help.bubbleSession} mode={help.mode} premium={premium}
            pending={help.pending} onRecommend={help.recommend}
            onDismiss={help.dismissRecommendation} onNavigate={help.recordNavigation} />
        </div>
        <PracticeCompanionActions mode={help.mode} premium={premium}
          answerVisible={Boolean(session?.question && session.question.correctIndex !== null)}
          suggestedAction={session?.question?.suggestedAction ?? null}
          enabled={Boolean(session?.status === 'active' && session.question && !session.question.invalid)}
          resolved={Boolean(session?.question?.resolved)} pending={help.pending}
          onMode={help.setMode} onHint={help.openHint}
          onCompare={help.compare} onAskTutor={help.chat} />
        <div className="practice-companion-base">
          <span className="practice-companion-state">{session?.question?.correct === true ? 'Dobra robota' : 'Bez pośpiechu'}</span>
          {session?.question && props.canContinue &&
            <Button type="button" size="sm" variant="ghost"
              className="self-start" onClick={() => props.onContinue()}>Dalej</Button>}
          {session?.question && session.question.correctIndex === null && <button type="button"
            onClick={() => help.runCommand('reveal')}
            className={`practice-companion-reveal ${session.question.suggestedAction === 'reveal' ? 'practice-companion-reveal-suggested' : ''}`}>
            Pokaż odpowiedź <span aria-hidden="true">↗</span></button>}
        </div>
      </div>
    </WolfekGlassCard>
    <FormError formState={help.state} />
    {help.pending && <p role="status" className="sr-only">Zapisywanie…</p>}
    {help.toast}
  </form>
}

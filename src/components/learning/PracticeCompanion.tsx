'use client'

import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useWolfekLearningQuestions } from '@/hooks/useWolfekLearningQuestions'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import type { WolfekCompanionProps } from '@/types/learningUiTypes'
import PracticeCompanionActions from './PracticeCompanionActions'
import PracticeCompanionAvatar from './PracticeCompanionAvatar'
import WolfekGlassCard from '@/components/wolfek/WolfekGlassCard'
import WolfekSpeech from '@/components/wolfek/WolfekSpeech'
import WolfekQuestionForm from '@/components/wolfek/WolfekQuestionForm'
import WolfekSelectedResponse from '@/components/wolfek/WolfekSelectedResponse'
import WolfekIntro from '@/components/wolfek/WolfekIntro'
import WolfekSources from '@/components/wolfek/WolfekSources'

export default function PracticeCompanion(props: WolfekCompanionProps) {
  const help = useWolfekLearningQuestions(props)
  const eyes = useWolfekGaze()
  const answer = help.state.answer
  const mode = help.state.values?.learningMode
  return <WolfekGlassCard avatarRef={eyes.avatar} onPointerMove={eyes.follow} onPointerLeave={eyes.reset}
    onPointerCancel={eyes.reset} onMinimize={props.onMinimize}
    avatar={<PracticeCompanionAvatar session={props.session} reaction={props.reaction} gaze={eyes.gaze} interactive />}
    avatarActions={props.canContinue && <Button type="button" size="sm" variant="ghost"
      className="practice-companion-next" disabled={help.pending} onClick={() => props.onContinue()}>
      Następne pytanie <ArrowRight size={14} aria-hidden="true" />
    </Button>}>
    <div className="wolfek-card-content">
      <WolfekIntro description="Wskazówka, porównanie odpowiedzi lub pełne wyjaśnienie — wybierz pomoc dla siebie." />
      <WolfekSpeech revealKey={help.state.timestamp} pending={help.pending} answerText={answer?.text ?? ''}
        answerKey={!help.pending && answer && !help.state.values?.restored ? help.state.timestamp : 0}>
        {help.pending ? <p role="status" className="wolfek-loading-text">Wolfek sprawdza materiały…</p>
          : answer ? <>
            <WolfekSelectedResponse answer={answer} animate={!help.state.values?.restored} />
            {answer.action?.type === 'confirm_reveal_then_tutor' && <Button size="md" variant="secondary"
              className="wolfek-reveal-confirm" onClick={() => help.submitPrepared('reveal_tutor')}>Pokaż i wyjaśnij</Button>}
            <WolfekSources sources={help.state.sources ?? []} />
          </> : <p>Wybierz pytanie lub napisz, co chcesz zrozumieć w tej karcie.</p>}
      </WolfekSpeech>
      <PracticeCompanionActions mode={mode === 'explain' ? 'chat' : mode === 'hint' || mode === 'compare' ? mode : 'welcome'}
        enabled={Boolean(props.session?.status === 'active' && props.session.question && !props.session.question.invalid)}
        pending={help.pending} onHint={() => help.submitPrepared('hint')}
        onCompare={() => help.submitPrepared('compare')} onAskTutor={() => help.submitPrepared('assistant')} />
      <WolfekQuestionForm route="learning.practice" practice={help.practice} recentMessages={help.recentMessages}
        state={help.state} pending={help.pending} action={help.action} />
    </div>
  </WolfekGlassCard>
}

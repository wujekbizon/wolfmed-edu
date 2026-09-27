'use client'

import { ArrowLeftRight, Lightbulb, MessageCircle, Sparkles } from 'lucide-react'
import type { PracticeCompanionActionsProps } from '@/types/learningUiTypes'

export default function PracticeCompanionActions({ mode, premium, answerVisible, suggestedAction, enabled, resolved, pending, onMode, onHint, onAskTutor, onCompare }: PracticeCompanionActionsProps) {
  return <div className="practice-companion-orbit" aria-label="Sposoby pomocy">
    <button type="button" disabled={pending || !enabled || resolved} onClick={() => { onMode('hint'); onHint() }}
      aria-pressed={mode === 'hint' || suggestedAction === 'hint'} className="practice-orbit-action practice-orbit-hint">
      <span><Lightbulb size={16} aria-hidden="true" /></span><span>Wskazówka</span>
    </button>
    <button type="button" disabled={!enabled} onClick={() => { onMode('compare'); onCompare?.() }} aria-pressed={mode === 'compare' || suggestedAction === 'compare'}
      className="practice-orbit-action practice-orbit-compare">
      <span><ArrowLeftRight size={16} aria-hidden="true" /></span><span>Porównaj</span>
    </button>
    <button type="button" disabled={!enabled || !premium || pending} onClick={() => {
      if (!answerVisible) onMode('chat')
      else onAskTutor()
    }}
      aria-label={premium ? 'Asystent AI' : 'Asystent AI — tylko Premium'}
      aria-pressed={premium && mode === 'chat'} className="practice-orbit-action practice-orbit-ask">
      <span><MessageCircle size={16} aria-hidden="true" /></span>
      <span>Asystent AI</span>
    </button>
    <span className="practice-orbit-spark practice-orbit-spark-one" aria-hidden="true"><Sparkles size={13} /></span>
    <span className="practice-orbit-spark practice-orbit-spark-two" aria-hidden="true"><span /></span>
  </div>
}

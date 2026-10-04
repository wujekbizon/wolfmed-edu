'use client'

import WolfekPreparedQuestions from '@/components/wolfek/WolfekPreparedQuestions'
import type { PracticeCompanionActionsProps } from '@/types/learningUiTypes'

export default function PracticeCompanionActions({ mode, pending, enabled, onHint, onAskTutor, onCompare }: PracticeCompanionActionsProps) {
  return <WolfekPreparedQuestions route="learning.practice" pending={pending || !enabled}
    questionIds={['hint', 'compare', 'assistant']} activeId={mode === 'chat' ? 'assistant' : mode} onSelect={(id) => {
      if (id === 'hint') onHint()
      if (id === 'compare') onCompare?.()
      if (id === 'assistant') onAskTutor()
    }} />
}

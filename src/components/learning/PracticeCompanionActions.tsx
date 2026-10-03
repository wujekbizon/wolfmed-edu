'use client'

import { ArrowLeftRight, Lightbulb, MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import type { PracticeCompanionActionsProps } from '@/types/learningUiTypes'

export default function PracticeCompanionActions({ mode, pending, enabled, onHint, onAskTutor, onCompare }: PracticeCompanionActionsProps) {
  return <div className="practice-companion-orbit" aria-label="Pytania do Wolfka">
    <Button disabled={pending || !enabled} onClick={onHint} aria-pressed={mode === 'hint'}
      className="practice-orbit-action practice-orbit-hint max-w-64 whitespace-normal text-left">
      <Lightbulb size={16} aria-hidden="true" /><span>{getWolfekPreparedQuestion('learning.practice', 'hint')?.prompt}</span>
    </Button>
    <Button disabled={pending || !enabled} onClick={onCompare} aria-pressed={mode === 'compare'}
      className="practice-orbit-action practice-orbit-compare max-w-64 whitespace-normal text-left">
      <ArrowLeftRight size={16} aria-hidden="true" /><span>{getWolfekPreparedQuestion('learning.practice', 'compare')?.prompt}</span>
    </Button>
    <Button disabled={pending || !enabled} onClick={onAskTutor}
      className="practice-orbit-action practice-orbit-ask max-w-64 whitespace-normal text-left">
      <MessageCircle size={16} aria-hidden="true" /><span>{getWolfekPreparedQuestion('learning.practice', 'assistant')?.prompt}</span>
    </Button>
  </div>
}

'use client'

import { MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { WolfekPreparedQuestionButtonProps } from '@/types/wolfekBatchTypes'

export default function WolfekPreparedQuestionButton({ question, pending, onSelect, active = false }: WolfekPreparedQuestionButtonProps) {
  return <Button type="button" variant="secondary" size="sm" disabled={pending}
    aria-pressed={active || undefined}
    className="practice-orbit-action panel-wolfek-topic" onClick={() => onSelect(question.id)}>
    <span aria-hidden="true"><MessageCircle size={17} /></span><span>{question.prompt}</span>
  </Button>
}

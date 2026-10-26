'use client'

import { MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { WolfekPreparedQuestionButtonProps } from '@/types/wolfekPreparedTypes'

export default function WolfekPreparedQuestionButton({ question, pending, onSelect, active = false, appearance = 'floating' }: WolfekPreparedQuestionButtonProps) {
  return <Button type="button" variant="secondary" size="sm" disabled={pending}
    aria-pressed={active || undefined}
    className={`practice-orbit-action panel-wolfek-topic ${appearance === 'straight' ? 'wolfek-prepared-straight' : ''}`} onClick={() => onSelect(question.id)}>
    <span aria-hidden="true"><MessageCircle size={17} /></span><span>{question.prompt}</span>
  </Button>
}

'use client'

import Button from '@/components/ui/Button'
import LinkButton from '@/components/ui/LinkButton'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import type { WolfekAnswer } from '@/types/wolfekResponseTypes'

export default function PracticeWolfekResponseAction({ answer, pending, onRevealTutor }: {
  answer: WolfekAnswer | null; pending: boolean; onRevealTutor: () => void
}) {
  if (answer?.action?.href) return <LinkButton href={answer.action.href} size="sm" variant="secondary">Otwórz →</LinkButton>
  if (answer?.action?.type !== 'confirm_reveal_then_tutor') return null
  return <Button size="sm" disabled={pending} onClick={onRevealTutor}>
    {getWolfekPreparedQuestion('learning.practice', 'reveal_tutor')?.prompt}
  </Button>
}

'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import type { WolfekAnswer } from '@/types/wolfekResponseTypes'
import WolfekAnswerText from './WolfekAnswerText'

export default function WolfekSelectedResponse({ answer, onAction, pending = false }: {
  answer: WolfekAnswer; onAction?: (answer: WolfekAnswer) => void; pending?: boolean
}) {
  return <div className="panel-wolfek-answer" role="status">
    <WolfekAnswerText text={answer.text} />
    {answer.action?.href && <Link href={answer.action.href}>Otwórz →</Link>}
    {answer.action && !answer.action.href && onAction && <Button size="sm" disabled={pending} data-wolfek-response-action
      onClick={() => onAction(answer)}>Skorzystaj</Button>}
  </div>
}

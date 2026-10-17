'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startPracticeTestAction } from '@/actions/practiceTests'
import { showToast } from '@/hooks/useToastMessage'
import Button from '@/components/ui/Button'

export default function PracticeTestButton({
  category,
  questionCount,
  activeSessionId,
  disabled,
}: {
  category: string
  questionCount: number
  activeSessionId?: string | undefined
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const startPractice = () => {
    startTransition(async () => {
      if (activeSessionId) {
        router.push(`/panel/testy/${category}?sessionId=${activeSessionId}`)
        return
      }
      const result = await startPracticeTestAction(category, questionCount)
      if (!result.success) {
        showToast('ERROR', result.message)
        return
      }
      router.push(`/panel/testy/${category}?sessionId=${result.sessionId}`)
    })
  }

  return (
    <Button
      className="flex-1"
      variant="secondary"
      size="submit"
      disabled={disabled || pending}
      onClick={startPractice}
    >
      {pending ? 'Uruchamianie...' : activeSessionId ? `Wznów trening · ${questionCount} pytań` : 'Rozpocznij trening'}
    </Button>
  )
}

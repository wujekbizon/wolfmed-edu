'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { expireSessionAction } from '@/actions/actions'
import { useCountdownTestTimer } from '@/hooks/useCountdownTestTimer' // Import the renamed hook

interface TestTimerProps {
  durationMinutes: number
  sessionId: string
  onExpiration: () => void
}

export default function TestTimer({ durationMinutes, sessionId, onExpiration }: TestTimerProps) {
  const [isPending, startTransition] = useTransition()
  const [expired, setExpired] = useState(false)
  const router = useRouter()

  const { timeLeft, isWarning, isTimeUp } = useCountdownTestTimer({
    durationMinutes,
    warningThresholdSeconds: 300
  });

  const handleExpiration = useCallback(async () => {
    startTransition( async () => {
      const result = await expireSessionAction(sessionId)

      if(result.status === "SUCCESS") {
        setExpired(true)
        onExpiration()
      } else {
        toast.error(result.message || 'Nie udało się zakończyć sesji.')
      }
    })
  }, [sessionId, startTransition, setExpired, onExpiration])

  useEffect(() => {
    if (isTimeUp && !expired) {
      handleExpiration()
    }
  }, [isTimeUp, expired, handleExpiration])

  useEffect(() => {
    if (expired) {
      toast.error('Czas testu minął — sesja wygasła!')
      router.push('/panel/testy')
    }
  }, [expired, router])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div
      className={`font-mono text-lg font-bold px-4 py-2 rounded-lg ${
        isWarning
          ? 'bg-red-500/20 text-red-400'
          : 'bg-green-500/20 text-green-400'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}

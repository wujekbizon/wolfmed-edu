'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { expireSessionAction } from '@/actions/actions'
import { useCountdownTestTimer } from '@/hooks/useCountdownTestTimer'

interface TestTimerProps {
  durationMinutes: number
  sessionId: string
  onExpiration: () => void
  message: string
}

export default function TestTimer({ durationMinutes, sessionId, onExpiration, message }: TestTimerProps) {
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
    <div className="flex flex-col items-end gap-1">
      <div
        className={`flex items-center gap-4 font-mono text-lg font-bold px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg ${isWarning ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-600'}`}
      >
        <span className="text-base font-normal text-zinc-700">{message}</span>
        <span>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-yellow-600">
        ⚠️ Uwaga: Opuszczenie tej karty lub zamknięcie przeglądarki spowoduje zakończenie sesji egzaminacyjnej.
      </span>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { useCountdownTestTimer } from '@/hooks/useCountdownTestTimer'
import type { PracticalExamTimerProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamTimer({ durationMinutes, onTimeUp, startTime, isSubmitting }: PracticalExamTimerProps) {
  const expiryHandled = useRef(false)
  const expiresAt = new Date(startTime + durationMinutes * 60_000).toISOString()
  const { timeLeft, isWarning, isTimeUp } = useCountdownTestTimer({ durationMinutes, expiresAt })

  useEffect(() => {
    if (!isTimeUp || expiryHandled.current) return
    expiryHandled.current = true
    if (!isSubmitting) onTimeUp()
  }, [isTimeUp, isSubmitting, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div
      className={`font-mono text-base font-bold px-3 py-1.5 rounded-lg ${
        isWarning ? 'bg-red-500/15 text-red-600' : 'bg-green-500/15 text-green-700'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}


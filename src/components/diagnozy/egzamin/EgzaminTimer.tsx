'use client'

import { useEffect, useRef } from 'react'
import { Timer } from 'lucide-react'
import { useCountdownTestTimer } from '@/hooks/useCountdownTestTimer'
import { formatExamClock } from '@/helpers/formatExamClock'

export default function EgzaminTimer({
  durationMinutes,
  onTimeUp,
}: {
  durationMinutes: number
  onTimeUp: () => void
}) {
  const { timeLeft, isWarning, isTimeUp } = useCountdownTestTimer({ durationMinutes })
  const firedRef = useRef(false)

  useEffect(() => {
    if (isTimeUp && !firedRef.current) {
      firedRef.current = true
      onTimeUp()
    }
  }, [isTimeUp, onTimeUp])

  return (
    <span
      role="timer"
      aria-label="Pozostały czas egzaminu"
      className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1.5 tabular-nums transition-colors
        ${isWarning ? 'text-rose-700 bg-rose-100 animate-pulse' : 'text-zinc-600 bg-zinc-100'}`}
    >
      <Timer className="w-4 h-4" />
      {formatExamClock(timeLeft)}
    </span>
  )
}

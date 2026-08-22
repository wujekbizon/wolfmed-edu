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
      className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-xl px-3 py-1.5 tabular-nums
        ring-1 transition-colors
        ${
          isWarning
            ? 'text-rose-600 bg-rose-50 ring-rose-500/20 animate-pulse'
            : 'text-zinc-600 bg-white ring-zinc-900/[0.06]'
        }`}
    >
      <Timer className="w-4 h-4" />
      {formatExamClock(timeLeft)}
    </span>
  )
}

'use client'

import { TIME_SEGMENTS } from '@/constants/timeSegments'
import { useCountdown } from '@/hooks/useCountdown'

interface CountdownTimerProps {
  initialDays: number
  initialHours: number
  initialMinutes: number
  initialSeconds: number
}

export default function CountdownTimer({
  initialDays,
  initialHours,
  initialMinutes,
  initialSeconds,
}: CountdownTimerProps) {
  const timeLeft = useCountdown({
    days: initialDays,
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  })

  const isFinished = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isFinished) {
    return null
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-4 text-center max-w-xl mx-auto">
      {TIME_SEGMENTS.map(({ key, label }) => (
        <div key={key} className="flex-1 flex flex-col items-center bg-zinc-800/50 rounded-lg p-1.5 sm:p-3">
          <div className="text-lg sm:text-3xl font-bold text-[#f58a8a] animate-pulse">
            {timeLeft[key]?.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-sm text-zinc-400 mt-0.5 sm:mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}

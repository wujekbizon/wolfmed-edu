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
<div className="grid grid-cols-4 gap-2 sm:gap-3 text-center max-w-full">
  {TIME_SEGMENTS.map(({ key, label }) => (
    <div
      key={key}
      className="
        min-w-0 flex flex-col items-center
        bg-zinc-800/60 rounded-lg px-1.5 py-2 sm:px-3 sm:py-4
      "
    >
      <div className="text-lg sm:text-2xl font-bold text-[#f58a8a] tabular-nums">
        {timeLeft[key]?.toString().padStart(2, '0')}
      </div>

      <div
        className="text-[9px] sm:text-xs text-zinc-400 leading-none truncate w-full"
        title={label}
      >
        {label}
      </div>
    </div>
  ))}
</div>

  )
}

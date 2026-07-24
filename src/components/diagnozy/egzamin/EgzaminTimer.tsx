'use client'

import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { formatExamClock } from '@/helpers/formatExamClock'

export default function EgzaminTimer({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-full px-3 py-1.5 tabular-nums">
      <Timer className="w-4 h-4" />
      {formatExamClock((now - startedAt) / 1000)}
    </span>
  )
}

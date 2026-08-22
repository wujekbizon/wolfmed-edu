'use client'

import type { ExamAttemptStats } from '@/types/diagnozyTypes'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums text-zinc-800">{value}</p>
    </div>
  )
}

export default function EgzaminAttemptsStats({ stats }: { stats: ExamAttemptStats }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Stat label="Podejścia" value={String(stats.total)} />
      <Stat label="Najlepszy" value={`${stats.best}%`} />
      <Stat label="Średnia" value={`${stats.average}%`} />
    </div>
  )
}

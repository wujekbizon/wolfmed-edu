'use client'

import { formatExamClock } from '@/helpers/formatExamClock'
import type { DiagnozyExamAttempt } from '@/types/diagnozyTypes'

export default function EgzaminAttemptsList({
  attempts,
  titlesBySlug,
}: {
  attempts: DiagnozyExamAttempt[]
  titlesBySlug: Record<string, string>
}) {
  if (attempts.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-400">
        Brak podejść spełniających kryteria.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-zinc-900/[0.06]">
      {attempts.map((attempt) => (
        <li key={attempt.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm text-zinc-700 truncate">
              {titlesBySlug[attempt.diagnozaSlug] ?? attempt.diagnozaSlug}
            </p>
            <p className="text-xs text-zinc-400">
              {attempt.completedAt.toLocaleDateString('pl-PL')} · czas{' '}
              {formatExamClock(attempt.timeSpent)}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold tabular-nums ${
              attempt.passed
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-500'
            }`}
          >
            {attempt.score}%
          </span>
        </li>
      ))}
    </ul>
  )
}

import { formatExamClock } from '@/helpers/formatExamClock'
import type { DiagnozyExamAttempt } from '@/types/diagnozyTypes'

export default function EgzaminAttemptsList({
  attempts,
  titlesBySlug,
}: {
  attempts: DiagnozyExamAttempt[]
  titlesBySlug: Record<string, string>
}) {
  if (attempts.length === 0) return null

  return (
    <section aria-labelledby="egzamin-historia" className="mt-10">
      <h2 id="egzamin-historia" className="text-sm font-bold text-zinc-800 uppercase tracking-wide mb-3">
        Ostatnie podejścia
      </h2>
      <ul className="flex flex-col gap-2">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="flex items-center justify-between gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3"
          >
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
              className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums ${
                attempt.passed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {attempt.score}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

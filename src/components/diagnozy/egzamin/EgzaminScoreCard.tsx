'use client'

import { formatExamClock } from '@/helpers/formatExamClock'
import { DIAGNOZY_EXAM_PASS_THRESHOLD } from '@/helpers/gradeDiagnozyExam'

export default function EgzaminScoreCard({
  score,
  passed,
  timeSpent,
}: {
  score: number
  passed: boolean
  timeSpent: number
}) {
  return (
    <div className="rounded-2xl p-6 text-center bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
        Wynik egzaminu
      </p>
      <p
        className={`text-5xl font-semibold tabular-nums mb-3 ${
          passed ? 'text-emerald-600' : 'text-zinc-800'
        }`}
      >
        {score}%
      </p>
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
          passed ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-600'
        }`}
      >
        {passed
          ? 'Zaliczono'
          : `Nie zaliczono — próg to ${DIAGNOZY_EXAM_PASS_THRESHOLD}%`}
      </span>
      <p className="text-xs text-zinc-400 mt-2.5">Czas: {formatExamClock(timeSpent)}</p>
    </div>
  )
}

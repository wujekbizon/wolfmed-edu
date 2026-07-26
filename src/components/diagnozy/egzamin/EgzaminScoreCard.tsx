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
    <div
      className={`rounded-2xl p-6 text-center ring-1 ${
        passed
          ? 'bg-gradient-to-b from-emerald-50/80 to-white ring-emerald-500/20'
          : 'bg-gradient-to-b from-rose-50/80 to-white ring-rose-500/20'
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
        Wynik egzaminu
      </p>
      <p
        className={`text-5xl font-semibold tabular-nums mb-2 ${
          passed ? 'text-emerald-600' : 'text-rose-500'
        }`}
      >
        {score}%
      </p>
      <p className="text-sm font-medium text-zinc-700">
        {passed
          ? 'Zaliczono'
          : `Nie zaliczono — próg to ${DIAGNOZY_EXAM_PASS_THRESHOLD}%`}
      </p>
      <p className="text-xs text-zinc-400 mt-1.5">Czas: {formatExamClock(timeSpent)}</p>
    </div>
  )
}

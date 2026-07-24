'use client'

import { RotateCcw } from 'lucide-react'
import EgzaminResultStep from '@/components/diagnozy/egzamin/EgzaminResultStep'
import { formatExamClock } from '@/helpers/formatExamClock'
import { DIAGNOZY_EXAM_PASS_THRESHOLD } from '@/helpers/gradeDiagnozyExam'
import type { DiagnozyExamResult } from '@/types/diagnozyTypes'

export default function EgzaminResult({
  result,
  timeSpent,
  onRetry,
}: {
  result: DiagnozyExamResult
  timeSpent: number
  onRetry: () => void
}) {
  return (
    <div aria-live="polite">
      <div
        className={`rounded-2xl border p-6 mb-6 text-center ${
          result.passed
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-rose-50 border-rose-200'
        }`}
      >
        <p className="text-4xl font-bold text-zinc-800 tabular-nums mb-1">
          {result.score}%
        </p>
        <p
          className={`text-sm font-semibold ${
            result.passed ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {result.passed
            ? 'Zaliczono!'
            : `Nie zaliczono — próg zaliczenia to ${DIAGNOZY_EXAM_PASS_THRESHOLD}%.`}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Czas: {formatExamClock(timeSpent)}
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {result.steps.map((step) => (
          <EgzaminResultStep
            key={step.field}
            step={step}
            uzasadnienia={result.uzasadnienia}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full
          text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Spróbuj ponownie
      </button>
    </div>
  )
}

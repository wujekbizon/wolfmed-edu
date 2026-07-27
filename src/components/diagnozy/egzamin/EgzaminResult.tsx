'use client'

import { RotateCcw } from 'lucide-react'
import EgzaminScoreCard from '@/components/diagnozy/egzamin/EgzaminScoreCard'
import EgzaminResultStep from '@/components/diagnozy/egzamin/EgzaminResultStep'
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
    <div aria-live="polite" className="flex flex-col gap-6">
      <EgzaminScoreCard
        score={result.score}
        passed={result.passed}
        timeSpent={timeSpent}
      />

      <div className="flex flex-col gap-3">
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
        className="self-start inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium
          rounded-xl text-white bg-rose-500 hover:bg-rose-600 cursor-pointer transition-all
          shadow-[0_8px_18px_-8px_rgba(244,63,94,0.8)]"
      >
        <RotateCcw className="w-4 h-4" />
        Spróbuj ponownie
      </button>
    </div>
  )
}

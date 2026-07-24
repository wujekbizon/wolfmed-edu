'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function WypelnijStepper({
  stepTitles,
  currentIndex,
  canGoNext,
  onBack,
  onNext,
  children,
}: {
  stepTitles: string[]
  currentIndex: number
  canGoNext: boolean
  onBack: () => void
  onNext: () => void
  children: React.ReactNode
}) {
  const progress = ((currentIndex + 1) / stepTitles.length) * 100

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          Krok {currentIndex + 1} z {stepTitles.length}: {stepTitles[currentIndex]}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={stepTitles.length}
        aria-label="Postęp wypełniania"
        className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6"
      >
        <div
          className="h-full bg-rose-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {children}

      <div className="flex items-center justify-between gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full
            text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Wstecz
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full
            text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Dalej
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

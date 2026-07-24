'use client'

import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'

export default function EgzaminNav({
  stepIndex,
  stepCount,
  isLast,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: {
  stepIndex: number
  stepCount: number
  isLast: boolean
  submitting: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 mt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={stepIndex === 0 || submitting}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full
          text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" />
        Wstecz
      </button>
      <span className="text-xs text-zinc-400">
        {stepIndex + 1} / {stepCount}
      </span>
      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full
            text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Sprawdź
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full
            text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer"
        >
          Dalej
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

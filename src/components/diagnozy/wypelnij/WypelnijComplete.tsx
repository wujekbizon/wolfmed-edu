'use client'

import { CheckCircle2, LoaderCircle, RotateCcw } from 'lucide-react'

export default function WypelnijComplete({
  completed,
  submitting,
  disabled,
  onComplete,
  onPracticeAgain,
}: {
  completed: boolean
  submitting: boolean
  disabled: boolean
  onComplete: () => void
  onPracticeAgain: () => void
}) {
  if (completed) {
    return (
      <div aria-live="polite" className="mt-6 flex flex-wrap items-center gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
          <CheckCircle2 className="w-4 h-4" />
          Diagnoza ukończona — dobra robota!
        </p>
        <button
          type="button"
          onClick={onPracticeAgain}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
            text-zinc-700 bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50
            transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Ćwicz ponownie
        </button>
      </div>
    )
  }

  return (
    <div aria-live="polite" className="mt-6 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onComplete}
        disabled={disabled || submitting}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full
          text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
        Oznacz jako ukończone
      </button>
      {disabled && (
        <p className="text-xs text-zinc-400">
          Wypełnij wszystkie pola przewodnika, aby ukończyć diagnozę.
        </p>
      )}
    </div>
  )
}

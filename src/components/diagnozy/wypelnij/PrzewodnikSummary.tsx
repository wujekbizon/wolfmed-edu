'use client'

import { CheckCircle2, LoaderCircle } from 'lucide-react'

type Row = { label: string; items: string[] }

export default function PrzewodnikSummary({
  rows,
  completed,
  submitting,
  error,
  onComplete,
}: {
  rows: Row[]
  completed: boolean
  submitting: boolean
  error: string | null
  onComplete: () => void
}) {
  return (
    <div>
      <p className="text-sm text-zinc-600 mb-4">
        Twój wypełniony przewodnik procesu pielęgnowania:
      </p>
      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white mb-6">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`grid grid-cols-1 md:grid-cols-[180px_1fr] ${
              index > 0 ? 'border-t border-zinc-100' : ''
            }`}
          >
            <div className="px-4 py-3 bg-zinc-50 text-xs font-semibold text-zinc-600 uppercase tracking-wide md:border-r md:border-zinc-200">
              {row.label}
            </div>
            <div className="px-4 py-3">
              {row.items.length === 1 ? (
                <p className="text-sm text-zinc-700">{row.items[0]}</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700">
                  {row.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div aria-live="polite">
        {completed ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
            <CheckCircle2 className="w-4 h-4" />
            Diagnoza ukończona — dobra robota!
          </p>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={onComplete}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full
                text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}
              Oznacz jako ukończone
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

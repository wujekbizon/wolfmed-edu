'use client'

import { AlertTriangle, Send, SearchCheck } from 'lucide-react'
import type { SpotErrorPlayerProps } from '@/types/quizUiTypes'

export default function SpotErrorPlayer({
  quiz,
  selectedErrors,
  isSubmitting,
  onToggleStep,
  onSubmit,
}: SpotErrorPlayerProps) {
  const steps = quiz.steps ?? []

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 sm:p-8">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 mb-6">
        <SearchCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          W tej wersji procedury <span className="font-semibold">ukryto błędy</span>.
          Kliknij każdy krok, który Twoim zdaniem jest nieprawidłowy — uwaga,
          błędne oznaczenie poprawnego kroku obniża wynik.
        </p>
      </div>

      <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
        {steps.map((step, index) => {
          const marked = selectedErrors.includes(step.id)
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onToggleStep(step.id)}
              aria-pressed={marked}
              className={`group/step w-full text-left flex items-start gap-4 px-4 md:px-6 py-4 border-l-[3px] transition-colors duration-200 ${
                marked
                  ? 'border-l-red-500 bg-red-50/70'
                  : 'border-l-transparent hover:border-l-amber-400 hover:bg-amber-50/40'
              }`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 leading-none transition-colors duration-200 ${
                  marked
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-100 border border-zinc-200 text-zinc-500 group-hover/step:bg-amber-400 group-hover/step:text-white group-hover/step:border-transparent'
                }`}
              >
                {marked ? <AlertTriangle className="w-3.5 h-3.5" /> : index + 1}
              </span>
              <span
                className={`flex-1 text-sm md:text-base leading-relaxed transition-colors ${
                  marked ? 'text-red-800' : 'text-zinc-700'
                }`}
              >
                {step.step}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mt-6 pt-5 border-t border-zinc-100">
        <span className="text-sm text-zinc-500">
          Oznaczone błędy:{' '}
          <span className="font-bold text-zinc-800 tabular-nums">{selectedErrors.length}</span>
        </span>
        <button
          type="button"
          onClick={onSubmit}
          disabled={selectedErrors.length === 0 || isSubmitting}
          className="inline-flex w-full xs:w-auto shrink-0 items-center justify-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold transition-colors"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Sprawdzanie…' : 'Zakończ i sprawdź'}
        </button>
      </div>
    </div>
  )
}

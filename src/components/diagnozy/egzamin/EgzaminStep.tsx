'use client'

import { Check } from 'lucide-react'
import type { DiagnozyExamStep } from '@/types/diagnozyTypes'

// Exam option cards: no feedback, no reveals — grading happens on submit.
export default function EgzaminStep({
  step,
  chosen,
  onToggle,
}: {
  step: DiagnozyExamStep
  chosen: string[]
  onToggle: (option: string) => void
}) {
  return (
    <div role="group" aria-label={step.label}>
      <p className="text-sm leading-relaxed text-zinc-600 mb-1">{step.prompt}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-4" aria-live="polite">
        {step.multi
          ? `Wiele odpowiedzi · wybrano ${chosen.length}`
          : 'Jedna odpowiedź'}
      </p>

      <div className="flex flex-col gap-2">
        {step.options.map((option) => {
          const isChosen = chosen.includes(option)
          return (
            <label
              key={option}
              className={`relative flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer ring-1
                transition-all duration-200
                ${
                  isChosen
                    ? 'bg-rose-50/40 ring-rose-400/40 shadow-[0_12px_28px_-16px_rgba(190,24,93,0.3)]'
                    : 'bg-white ring-zinc-900/[0.06] hover:ring-zinc-900/[0.12] hover:shadow-[0_12px_24px_-16px_rgba(16,24,40,0.2)]'
                }`}
            >
              <input
                type={step.multi ? 'checkbox' : 'radio'}
                name={`exam-step-${step.field}`}
                checked={isChosen}
                onChange={() => onToggle(option)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center transition-all
                  ${step.multi ? 'rounded-md' : 'rounded-full'}
                  ${
                    isChosen
                      ? 'bg-rose-500 text-white shadow-[0_4px_10px_-4px_rgba(244,63,94,0.8)]'
                      : 'bg-zinc-50 ring-1 ring-zinc-900/[0.08]'
                  }`}
              >
                {isChosen && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="text-sm leading-relaxed text-zinc-700 min-w-0">{option}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

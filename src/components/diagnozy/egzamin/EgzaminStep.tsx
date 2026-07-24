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
      <p className="text-sm text-zinc-600 mb-1">{step.prompt}</p>
      <p className="text-xs text-zinc-400 mb-4" aria-live="polite">
        {step.multi
          ? `Możesz zaznaczyć wiele odpowiedzi. Wybrano: ${chosen.length}`
          : 'Zaznacz jedną odpowiedź.'}
      </p>
      <div className="flex flex-col gap-2.5">
        {step.options.map((option) => {
          const isChosen = chosen.includes(option)
          return (
            <label
              key={option}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all
                ${
                  isChosen
                    ? 'border-rose-300 bg-rose-50/70 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
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
                className={`mt-0.5 w-5 h-5 shrink-0 ${step.multi ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center transition-colors
                  ${isChosen ? 'bg-rose-500 border-rose-500 text-white' : 'border-zinc-300 bg-white'}`}
              >
                {isChosen && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="text-sm text-zinc-700 min-w-0">{option}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

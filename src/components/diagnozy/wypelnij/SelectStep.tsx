'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { WypelnijStepConfig } from '@/types/diagnozyTypes'

export default function SelectStep({
  step,
  selected,
  onToggle,
}: {
  step: WypelnijStepConfig
  selected: string[]
  onToggle: (text: string) => void
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div role="group" aria-label={step.title}>
      <p className="text-sm text-zinc-600 mb-4">{step.prompt}</p>
      {step.multi && (
        <p className="text-xs text-zinc-400 mb-3" aria-live="polite">
          Wybrano {selected.length} z {step.options.length}
        </p>
      )}
      <div className="flex flex-col gap-2.5">
        {step.options.map((option) => {
          const isSelected = selected.includes(option.text)
          return (
            <label
              key={option.text}
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all
                ${
                  isSelected
                    ? 'border-rose-300 bg-rose-50/70 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
                }`}
            >
              <input
                type={step.multi ? 'checkbox' : 'radio'}
                name={`step-${step.key}`}
                checked={isSelected}
                onChange={() => onToggle(option.text)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 w-5 h-5 shrink-0 ${step.multi ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-zinc-300 bg-white'}`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-zinc-700">{option.text}</span>
                {option.detail && (
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.span
                        initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                        className="block overflow-hidden"
                      >
                        <span className="block mt-2 pt-2 border-t border-rose-200/70 text-xs text-zinc-500">
                          <span className="font-semibold uppercase tracking-wide">
                            Uzasadnienie:{' '}
                          </span>
                          {option.detail}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

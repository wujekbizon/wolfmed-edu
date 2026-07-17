'use client'

import { Send, Stethoscope } from 'lucide-react'
import type { ScenarioPlayerProps } from '@/types/quizUiTypes'
import QuizOptionRow from './QuizOptionRow'

export default function ScenarioPlayer({
  quiz,
  selectedOption,
  isSubmitting,
  onSelect,
  onSubmit,
}: ScenarioPlayerProps) {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-zinc-900/95 to-black/90 rounded-2xl p-5 sm:p-7 shadow-xl border border-white/[0.08]">
        <p className="flex items-center gap-2 text-[#ffc5c5] text-xs font-bold uppercase tracking-wide mb-3">
          <Stethoscope className="w-4 h-4" />
          Scenariusz kliniczny
        </p>
        <p className="text-zinc-200 text-sm md:text-base leading-relaxed">
          {quiz.scenario}
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 sm:p-8">
        <h2 className="text-base md:text-lg font-bold text-zinc-800 leading-snug mb-5">
          {quiz.question}
        </h2>
        <div className="space-y-2.5">
          {(quiz.options ?? []).map((option, index) => (
            <QuizOptionRow
              key={index}
              index={index}
              text={option}
              selected={selectedOption === index}
              onSelect={() => onSelect(index)}
            />
          ))}
        </div>

        <div className="flex justify-end mt-6 pt-5 border-t border-zinc-100">
          <button
            type="button"
            onClick={onSubmit}
            disabled={selectedOption === null || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sprawdzanie…' : 'Zatwierdź decyzję'}
          </button>
        </div>
      </div>
    </div>
  )
}

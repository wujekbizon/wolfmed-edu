'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'
import type { KnowledgeQuizPlayerProps } from '@/types/quizUiTypes'
import QuizOptionRow from './QuizOptionRow'

export default function KnowledgeQuizPlayer({
  quiz,
  answers,
  isSubmitting,
  onSelect,
  onSubmit,
}: KnowledgeQuizPlayerProps) {
  const [index, setIndex] = useState(0)
  const questions = quiz.questions ?? []
  const question = questions[index]
  const isLast = index === questions.length - 1
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length
  const allAnswered = answeredCount === questions.length

  if (!question) return null

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
          Pytanie {index + 1} z {questions.length}
        </span>
        <span className="text-xs text-zinc-400">{answeredCount}/{questions.length} odpowiedzi</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#ff9898] to-fuchsia-400"
          initial={false}
          animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <h2 className="text-base md:text-lg font-bold text-zinc-800 leading-snug mb-5">
            {question.question}
          </h2>
          <div className="space-y-2.5">
            {question.options.map((option, optionIndex) => (
              <QuizOptionRow
                key={optionIndex}
                index={optionIndex}
                text={option}
                selected={answers[question.id] === optionIndex}
                onSelect={() => onSelect(question.id, optionIndex)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-8 pt-5 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none text-zinc-700 text-sm font-medium border border-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Wstecz
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered || isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sprawdzanie…' : 'Zakończ i sprawdź'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            Dalej
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

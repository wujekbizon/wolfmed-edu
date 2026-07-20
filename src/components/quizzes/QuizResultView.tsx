'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ListChecks, PartyPopper, RefreshCw } from 'lucide-react'
import { CHALLENGE_TYPE_LABELS, ChallengeType } from '@/types/challengeTypes'
import type { QuizResultProps } from '@/types/quizUiTypes'
import QuizReviewRow from './QuizReviewRow'

export default function QuizResultView({
  challengeType,
  procedureName,
  score,
  passed,
  review,
  isGenerating,
  onRetryNewQuiz,
  backHref,
}: QuizResultProps) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl p-6 sm:p-8 text-center border shadow-sm ${
          passed
            ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
            : 'bg-gradient-to-br from-zinc-50 to-white border-zinc-200'
        }`}
      >
        {passed && <PartyPopper className="w-8 h-8 text-emerald-500 mx-auto mb-2" />}
        <p className={`text-5xl font-bold tabular-nums ${passed ? 'text-emerald-600' : 'text-zinc-800'}`}>
          {score}%
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-700">
          {passed ? 'Zaliczone! Wyzwanie ukończone.' : 'Tym razem poniżej progu 70%.'}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {CHALLENGE_TYPE_LABELS[challengeType as ChallengeType]} · {procedureName}
          {!passed && ' — przejrzyj odpowiedzi poniżej i spróbuj z nowym quizem.'}
        </p>
      </motion.div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-800 mb-4">
          <ListChecks className="w-4 h-4 text-[#ff9898]" />
          Omówienie odpowiedzi
        </h3>
        <ul className="space-y-3">
          {review.map((item) => (
            <QuizReviewRow key={item.id} item={item} />
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={backHref}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold border border-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do wyzwań
        </Link>
        <button
          type="button"
          onClick={onRetryNewQuiz}
          disabled={isGenerating}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generowanie…' : 'Wygeneruj nowy quiz'}
        </button>
      </div>
    </div>
  )
}

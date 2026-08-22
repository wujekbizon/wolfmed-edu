'use client'

import { Lock, Play, RefreshCw, Sparkles } from 'lucide-react'
import { CHALLENGE_TYPE_LABELS, ChallengeType } from '@/types/challengeTypes'
import type { QuizIntroProps } from '@/types/quizUiTypes'
import QuizGeneratingState from './QuizGeneratingState'

export default function QuizIntroCard({
  challengeType,
  procedureName,
  isPremium,
  hasExistingQuiz,
  isGenerating,
  errorMessage,
  onGenerate,
  onPlayExisting,
}: QuizIntroProps) {
  const label = CHALLENGE_TYPE_LABELS[challengeType as ChallengeType]

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-zinc-900/95 to-black/90 px-6 py-6 sm:px-8">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-white/10 text-[#ffc5c5] border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          Generowane przez AI
        </span>
        <h2 className="text-white font-bold text-xl mt-3">{label}</h2>
        <p className="text-zinc-400 text-sm mt-1">{procedureName}</p>
      </div>

      {isGenerating ? (
        <QuizGeneratingState />
      ) : (
        <div className="p-6 sm:p-8">
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            AI ułoży dla Ciebie unikalny zestaw zadań na podstawie oficjalnego
            algorytmu tej procedury i materiałów kursu — za każdym razem inny,
            oceniany jak na egzaminie (próg 70%).
          </p>

          {errorMessage && (
            <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {isPremium ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {hasExistingQuiz && (
                <button
                  type="button"
                  onClick={onPlayExisting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Rozwiąż ostatni quiz
                </button>
              )}
              <button
                type="button"
                onClick={onGenerate}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                {hasExistingQuiz ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {hasExistingQuiz ? 'Wygeneruj nowy quiz' : 'Wygeneruj quiz (AI)'}
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
              <Lock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-500">
                Quizy AI są dostępne w <span className="font-semibold text-zinc-700">planie premium</span>.
                Odblokuj je, aby ćwiczyć na świeżych zestawach zadań bez limitu.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { ERROR_CATEGORY_LABELS, ERROR_CATEGORY_COLORS } from '@/types/challengeTypes'
import type { ErrorCategory } from '@/types/challengeTypes'
import type { QuizReviewItem } from '@/types/quizUiTypes'

export default function QuizReviewRow({ item }: { item: QuizReviewItem }) {
  const category = item.category as ErrorCategory | null | undefined
  const categoryColors = category ? ERROR_CATEGORY_COLORS[category] : null

  return (
    <li
      className={`rounded-xl border p-4 md:p-5 ${
        item.isCorrect ? 'border-emerald-100 bg-emerald-50/40' : 'border-red-100 bg-red-50/40'
      }`}
    >
      <div className="flex items-start gap-3">
        {item.isCorrect ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 leading-snug">{item.prompt}</p>

          <div className="mt-2 space-y-1 text-sm">
            {item.selectedLabel !== null && (
              <p className={item.isCorrect ? 'text-emerald-700' : 'text-red-600'}>
                <span className="text-zinc-400 text-xs mr-1.5">Twoja odpowiedź:</span>
                {item.selectedLabel}
              </p>
            )}
            {!item.isCorrect && (
              <p className="text-emerald-700">
                <span className="text-zinc-400 text-xs mr-1.5">Prawidłowo:</span>
                {item.correctLabel}
              </p>
            )}
          </div>

          {item.explanation && (
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{item.explanation}</p>
          )}

          {category && categoryColors && (
            <span
              className={`inline-flex items-center mt-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${categoryColors.bg} ${categoryColors.border} ${categoryColors.text}`}
            >
              {ERROR_CATEGORY_LABELS[category]}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}

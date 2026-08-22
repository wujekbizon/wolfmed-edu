'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { generateAITestsAction } from '@/actions/aiTests'
import { saveAIGeneratedTestsAction } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import AITestGenerateForm from './AITestGenerateForm'
import AIQuestionPreviewCard from './AIQuestionPreviewCard'
import type { PopulatedCategories } from '@/types/categoryType'
import type { GeneratedQuestion } from '@/types/aiTestTypes'

interface Preview {
  questionsJson: string
  categoryName: string
  linkedCategory: string
  questions: GeneratedQuestion[]
}

export default function AITestGenerator({ categories }: { categories: PopulatedCategories[] }) {
  const [genState, genAction] = useActionState(generateAITestsAction, EMPTY_FORM_STATE)
  const [saveState, saveAction] = useActionState(saveAIGeneratedTestsAction, EMPTY_FORM_STATE)
  const genFallback = useToastMessage(genState)
  const saveFallback = useToastMessage(saveState)

  const [preview, setPreview] = useState<Preview | null>(null)
  const genTs = useRef(genState.timestamp)
  const saveTs = useRef(saveState.timestamp)

  useEffect(() => {
    if (genState.status === 'SUCCESS' && genState.timestamp !== genTs.current) {
      genTs.current = genState.timestamp
      const v = genState.values ?? {}
      try {
        setPreview({
          questionsJson: String(v.questionsJson ?? ''),
          categoryName: String(v.categoryName ?? ''),
          linkedCategory: String(v.linkedCategory ?? ''),
          questions: JSON.parse(String(v.questionsJson ?? '[]')),
        })
      } catch {
        setPreview(null)
      }
    }
  }, [genState])

  useEffect(() => {
    if (saveState.status === 'SUCCESS' && saveState.timestamp !== saveTs.current) {
      saveTs.current = saveState.timestamp
      setPreview(null)
    }
  }, [saveState])

  if (!preview) {
    return (
      <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-md p-4 sm:p-6 space-y-4 hover:shadow-lg transition-all duration-300">
        <p className="text-sm text-zinc-600">
          Opisz temat lub problem medyczny — AI wygeneruje pytania w oparciu o materiały kursu.
        </p>
        <AITestGenerateForm categories={categories} action={genAction} state={genState} />
        {genFallback}
      </div>
    )
  }

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-md p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900">
          Podgląd — {preview.questions.length} pytań
        </h3>
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Odrzuć i generuj ponownie
        </button>
      </div>
      <div className="space-y-3">
        {preview.questions.map((q, i) => (
          <AIQuestionPreviewCard key={i} question={q} index={i} />
        ))}
      </div>
      <form action={saveAction} className="flex justify-end pt-2">
        <input type="hidden" name="questionsJson" value={preview.questionsJson} />
        <input type="hidden" name="linkedCategory" value={preview.linkedCategory} />
        <SubmitButton label="Zapisz wszystkie pytania" loading="Zapisywanie..." />
      </form>
      {saveFallback}
    </div>
  )
}

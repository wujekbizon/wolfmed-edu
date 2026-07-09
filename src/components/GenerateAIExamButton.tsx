'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Loader2, Wand2 } from 'lucide-react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { generatePracticalExamAction } from '@/actions/praktyczny'
import { useToastMessage } from '@/hooks/useToastMessage'
import { PRACTICAL_EXAM_AI_CARD } from '@/constants/practicalExamCards'

function GenerateButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500/90 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg border border-violet-400/40 transition-colors w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generowanie...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4" />
          {PRACTICAL_EXAM_AI_CARD.ctaLabel}
        </>
      )}
    </button>
  )
}

export default function GenerateAIExamButton() {
  const [state, action] = useActionState(generatePracticalExamAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const router = useRouter()

  useEffect(() => {
    if (state.status === 'SUCCESS' && 'examId' in state && state.examId) {
      router.push(`/panel/egzaminy/${state.examId}`)
    }
  }, [state, router])

  return (
    <form action={action}>
      <GenerateButton />
      {noScriptFallback}
    </form>
  )
}

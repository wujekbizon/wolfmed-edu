'use client'

import { useActionState } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'
import RagResponse from './RagResponse'
import RagLoadingState from './RagLoadingState'

export default function RagCell({ cell }: { cell: { id: string; content: string } }) {
  const [state, action, isPending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <div className="p-4 space-y-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="cellId" value={cell.id} />

        <div>
          <textarea
            name="question"
            defaultValue={cell.content}
            placeholder="Zadaj pytanie dotyczące materiałów medycznych..."
            rows={3}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none"
          />
          <FieldError formState={state} name="question" />
        </div>

        <SubmitButton
          label="Wyjaśnij"
          loading="Szukam odpowiedzi..."
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        />

        {noScriptFallback}
      </form>

      {/* Loading State */}
      {isPending && <RagLoadingState />}

      {/* Response Display */}
      {state.status === 'SUCCESS' && state.message && !isPending && (
        <RagResponse
          answer={state.message}
          sources={state.values?.sources as string[] | undefined}
        />
      )}
    </div>
  )
}

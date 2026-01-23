'use client'

import { useActionState } from 'react'
import { testRagQueryAction } from '@/actions/admin-rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'

interface TestQueryFormProps {
  storeName?: string | undefined
}

export default function TestQueryForm({ storeName }: TestQueryFormProps) {
  const [state, action] = useActionState(testRagQueryAction, EMPTY_FORM_STATE)
  const noScriptFallback = state.status === 'ERROR' ? useToastMessage(state) : null
  return (
    <form action={action} className="space-y-4">
      {storeName && (
        <input type="hidden" name="storeName" value={storeName} />
      )}

      <div>
        <label
          htmlFor="question"
          className="block text-sm font-medium text-zinc-700 mb-2"
        >
          Pytanie testowe
        </label>
        <textarea
          id="question"
          name="question"
          rows={3}
          placeholder="np. Co to jest komórka?"
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          defaultValue=""
        />
        <FieldError formState={state} name="question" />
        <p className="text-xs text-zinc-500 mt-1">
          Zadaj pytanie dotyczące materiałów medycznych
        </p>
      </div>

      <SubmitButton label="Testuj Query" loading="Testuje..." className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors" />

      {noScriptFallback}
    </form>
  )
}

'use client'

import { useActionState } from 'react'
import { testRagQueryAction } from '@/actions/admin-rag-actions'
import { SubmitButton } from '@/components/SubmitButton'
import { FieldError } from '@/components/FieldError'
import { EMPTY_FORM_STATE } from '@/types/actionTypes'

interface TestQueryFormProps {
  storeName?: string
}

export default function TestQueryForm({ storeName }: TestQueryFormProps) {
  const [formState, action] = useActionState(testRagQueryAction, EMPTY_FORM_STATE)

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
        <FieldError formState={formState} name="question" />
        <p className="text-xs text-zinc-500 mt-1">
          Zadaj pytanie dotyczące materiałów medycznych
        </p>
      </div>

      <SubmitButton className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
        Testuj Query
      </SubmitButton>

      {/* Success - Display Answer */}
      {formState.status === 'SUCCESS' && formState.data?.answer && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">
              Odpowiedź z RAG:
            </p>
          </div>

          <div className="bg-white p-4 rounded border border-green-300">
            <div className="prose prose-sm prose-zinc max-w-none">
              <p className="text-sm text-zinc-800 whitespace-pre-wrap">
                {formState.data.answer}
              </p>
            </div>
          </div>

          {formState.data.sources && formState.data.sources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-700 mb-1">
                Źródła:
              </p>
              <div className="flex flex-wrap gap-1">
                {formState.data.sources.map((source: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {formState.status === 'ERROR' && formState.message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{formState.message}</p>
        </div>
      )}
    </form>
  )
}

'use client'

import { useActionState } from 'react'
import { createFileSearchStoreAction } from '@/actions/admin-rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'


export default function CreateStoreSection() {
  const [state, action] = useActionState(createFileSearchStoreAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold text-zinc-900 mb-4">
        Utwórz File Search Store
      </h2>
      <p className="text-zinc-600 mb-6">
        Utwórz nowy Google File Search Store dla dokumentów medycznych
      </p>

      <form action={action} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-zinc-700 mb-2"
          >
            Nazwa Store
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            placeholder="np. wolfmed-medical-docs"
            defaultValue="wolfmed-medical-docs"
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <FieldError formState={state} name="displayName" />
        </div>
        <SubmitButton label='Utwórz Store' loading="Tworzenie..." className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"/>
        {noScriptFallback}
      </form>
    </div>
  )
}

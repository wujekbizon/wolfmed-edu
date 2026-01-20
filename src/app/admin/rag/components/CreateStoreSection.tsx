'use client'

import { useActionState } from 'react'
import { createFileSearchStoreAction } from '@/actions/admin-rag-actions'
import { SubmitButton } from '@/components/SubmitButton'
import { FieldError } from '@/components/FieldError'
import { EMPTY_FORM_STATE } from '@/types/actionTypes'

export default function CreateStoreSection() {
  const [formState, action] = useActionState(createFileSearchStoreAction, EMPTY_FORM_STATE)

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
          <FieldError formState={formState} name="displayName" />
        </div>

        <SubmitButton className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Utwórz Store
        </SubmitButton>

        {/* Success Message */}
        {formState.status === 'SUCCESS' && formState.data?.storeName && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              ✓ Store utworzony pomyślnie!
            </p>
            <div className="space-y-2 text-sm text-green-700">
              <p>Skopiuj poniższą wartość i dodaj ją do pliku .env:</p>
              <div className="bg-white p-3 rounded border border-green-300 font-mono text-xs break-all">
                GOOGLE_FILE_SEARCH_STORE_NAME={formState.data.storeName}
              </div>
              <p className="text-xs">
                Po dodaniu zmiennej środowiskowej, odśwież stronę aby kontynuować.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {formState.status === 'ERROR' && formState.message && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{formState.message}</p>
          </div>
        )}
      </form>
    </div>
  )
}

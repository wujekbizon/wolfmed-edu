"use client"

import { useActionState, useEffect, useRef } from 'react'
import { useCustomTestsStore } from '@/store/useCustomTestsStore'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from './SubmitButton'
import FieldError from './FieldError'
import { deleteUserCustomTestsByCategoryAction } from '@/actions/actions'

export default function DeleteCategoryModal() {
  const { isDeleteCategoryModalOpen, categoryToDelete, closeDeleteCategoryModal } = useCustomTestsStore()
  const [state, action] = useActionState(deleteUserCustomTestsByCategoryAction, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)

  // Modal persists at page level, so status stays 'SUCCESS' between deletes;
  // track timestamp to detect each fresh action result.
  const prevTimestamp = useRef(state.timestamp)
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.timestamp !== prevTimestamp.current) {
      prevTimestamp.current = state.timestamp
      closeDeleteCategoryModal()
    }
  }, [state.status, state.timestamp, closeDeleteCategoryModal])

  if (!isDeleteCategoryModalOpen || !categoryToDelete) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-zinc-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl text-center">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900 mb-4">
          Czy na pewno chcesz usunąć wszystkie testy z tej kategorii?
        </h2>
        <div className="mb-4 rounded-lg bg-zinc-50 border border-zinc-100 px-4 py-3 text-left text-sm text-zinc-600 space-y-1">
          <p>
            <span className="font-semibold text-zinc-800">Kategoria:</span> {categoryToDelete.name}
          </p>
          <p>
            <span className="font-semibold text-zinc-800">Liczba testów:</span> {categoryToDelete.count}
          </p>
        </div>
        <p className="text-xs font-medium text-red-600 mb-6">
          Tej operacji nie można cofnąć!
        </p>
        <form action={action}>
          <input type="hidden" name="category" value={categoryToDelete.name} />
          <FieldError name="category" formState={state} />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg border border-zinc-200 py-2.5 px-4 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 transition-colors"
              onClick={closeDeleteCategoryModal}
            >
              Wróć
            </button>
            <SubmitButton
              label="Usuń wszystkie"
              loading="Usuwam..."
              className="flex-1 !bg-gradient-to-r !from-red-600 !to-red-500 hover:!from-red-500 hover:!to-red-600 !text-white !border-transparent !text-sm"
            />
            {noScriptFallback}
          </div>
        </form>
      </div>
    </div>
  )
}

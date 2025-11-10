"use client"

import { useActionState, useEffect } from 'react'
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

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      closeDeleteCategoryModal()
    }
  }, [state.status, closeDeleteCategoryModal])

  if (!isDeleteCategoryModalOpen || !categoryToDelete) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white p-10 rounded-xl text-center max-w-md">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Czy na pewno chcesz usunąć wszystkie testy z tej kategorii?
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold">Kategoria:</span> {categoryToDelete.name}
        </p>
        <p className="text-sm text-gray-600 mb-6">
          <span className="font-semibold">Liczba testów:</span> {categoryToDelete.count}
        </p>
        <p className="text-xs text-red-600 mb-6">
          Tej operacji nie można cofnąć!
        </p>
        <form action={action}>
          <input type="hidden" name="category" value={categoryToDelete.name} />
          <FieldError name="category" formState={state} />
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              onClick={closeDeleteCategoryModal}
            >
              Wróć
            </button>
            <SubmitButton label="Usuń wszystkie" loading="Usuwam..." />
            {noScriptFallback}
          </div>
        </form>
      </div>
    </div>
  )
}

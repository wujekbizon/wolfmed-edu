'use client'

import { useActionState, useEffect } from 'react'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from './SubmitButton'
import FieldError from './FieldError'
import { deleteCustomCategoryAction } from '@/actions/actions'

export default function CategoryDeleteModal({ categoryId }: { categoryId: string | undefined }) {
  const { closeDeleteModal } = useQuestionSelectionStore()
  const [state, action] = useActionState(deleteCustomCategoryAction, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      closeDeleteModal()
    }
  }, [state.status, closeDeleteModal])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white p-10 rounded-xl text-center">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Czy napewno chcesz usunąć tę kategorię?</h2>
        <form action={action}>
          <input type="hidden" name="categoryId" value={categoryId} />
          <FieldError name="categoryId" formState={state} />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              onClick={closeDeleteModal}
            >
              Wróć
            </button>
            <SubmitButton label="Usuń" loading="Usuwam..." />
            {noScriptFallback}
          </div>
        </form>
      </div>
    </div>
  )
}

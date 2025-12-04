"use client"

import { useActionState, useEffect } from 'react'
import { useCustomTestsStore } from '@/store/useCustomTestsStore'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from './SubmitButton'
import FieldError from './FieldError'
import { deleteUserCustomTestAction } from '@/actions/actions'

export default function DeleteTestModal() {
  const { isDeleteTestModalOpen, testToDelete, closeDeleteTestModal } = useCustomTestsStore()
  const [state, action] = useActionState(deleteUserCustomTestAction, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      closeDeleteTestModal()
    }
  }, [state.status, closeDeleteTestModal])

  if (!isDeleteTestModalOpen || !testToDelete) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white p-10 rounded-xl text-center max-w-md">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Czy na pewno chcesz usunąć ten test?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {testToDelete.question}
        </p>
        <form action={action}>
          <input type="hidden" name="testId" value={testToDelete.id} />
          <FieldError name="testId" formState={state} />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              onClick={closeDeleteTestModal}
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

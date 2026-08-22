"use client"

import { useActionState, useEffect, useRef } from 'react'
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

  // The modal stays mounted at page level, so useActionState persists between
  // deletes. Keying off status alone would miss back-to-back successes (status
  // stays 'SUCCESS'); timestamp changes on every action result.
  const prevTimestamp = useRef(state.timestamp)
  useEffect(() => {
    if (state.status === 'SUCCESS' && state.timestamp !== prevTimestamp.current) {
      prevTimestamp.current = state.timestamp
      closeDeleteTestModal()
    }
  }, [state.status, state.timestamp, closeDeleteTestModal])

  if (!isDeleteTestModalOpen || !testToDelete) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-zinc-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl text-center">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900 mb-3">
          Czy na pewno chcesz usunąć ten test?
        </h2>
        <p className="text-sm text-zinc-600 mb-6 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2">
          {testToDelete.question}
        </p>
        <form action={action}>
          <input type="hidden" name="testId" value={testToDelete.id} />
          <FieldError name="testId" formState={state} />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg border border-zinc-200 py-2.5 px-4 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 transition-colors"
              onClick={closeDeleteTestModal}
            >
              Wróć
            </button>
            <SubmitButton
              label="Usuń"
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

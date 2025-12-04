'use client'

import { useActionState, useEffect } from 'react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from './SubmitButton'
import FieldError from './FieldError'
import { deleteMaterialAction } from '@/actions/materials'

interface Props {
  materialId: string
  materialTitle: string
}

export default function MaterialDeleteModal({ materialId, materialTitle }: Props) {
  const { closeDeleteModal } = useDashboardStore()
  const [state, action] = useActionState(deleteMaterialAction, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      closeDeleteModal()
    }
  }, [state.status, closeDeleteModal])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white p-10 rounded-xl text-center max-w-md">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Czy na pewno chcesz usunąć materiał &quot;{materialTitle}&quot;?
        </h2>
        <form action={action}>
          <input type="hidden" name="materialId" value={materialId} />
          <FieldError name="materialId" formState={state} />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
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

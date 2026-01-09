'use client'

import { useActionState, useEffect } from 'react'
import { useDashboardStore } from '@/store/useDashboardStore'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'
import FieldError from '@/components/FieldError'
import { deleteBlogPostAction } from '@/actions/blog'

export default function DeletePostModal({ postId }: { postId: string | undefined }) {
  const { closeDeleteModal } = useDashboardStore()
  const [state, action] = useActionState(deleteBlogPostAction, EMPTY_FORM_STATE)

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
          Czy na pewno chcesz usunąć ten post?
        </h2>
        <p className="text-sm text-zinc-600 mb-6">
          Ta operacja jest nieodwracalna. Post zostanie trwale usunięty.
        </p>
        <form action={action}>
          <input type="hidden" name="id" value={postId} />
          <FieldError name="id" formState={state} />
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="bg-zinc-300 py-2 px-4 rounded hover:bg-zinc-400 font-medium"
              onClick={closeDeleteModal}
            >
              Anuluj
            </button>
            <SubmitButton
              label="Usuń"
              loading="Usuwam..."
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
            />
          </div>
          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}

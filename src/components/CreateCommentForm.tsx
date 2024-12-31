'use client'

import { useActionState, useEffect } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { createCommentAction } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'

type Props = {
  postId: string
  onClose: () => void
}

export default function CreateCommentForm({ postId, onClose }: Props) {
  const [state, action] = useActionState(createCommentAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      onClose()
    }
  }, [state.status, onClose])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg p-4 xs:p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Dodaj komentarz</h2>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="postId" value={postId} />
          <div>
            <textarea
              name="content"
              rows={4}
              placeholder="Napisz komentarz..."
              defaultValue={state.values?.content || ''}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 resize-none"
              autoFocus
            />
            <FieldError name="content" formState={state} />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-300 transition-colors bg-zinc-800 rounded-lg hover:bg-zinc-800/80"
            >
              Anuluj
            </button>
            <SubmitButton label="Dodaj komentarz" loading="Dodawanie..." />
          </div>
          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}

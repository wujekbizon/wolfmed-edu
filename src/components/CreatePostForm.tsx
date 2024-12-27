'use client'

import { useActionState, useEffect } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { createPostAction } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/Input'
import Label from '@/components/Label'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'

type Props = {
  onClose: () => void
}

export default function CreatePostForm({ onClose }: Props) {
  const [state, action] = useActionState(createPostAction, EMPTY_FORM_STATE)
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
          <h2 className="text-2xl font-bold text-zinc-100">Nowy post</h2>
        </div>

        <form className="space-y-4" action={action}>
          <div>
            <Label htmlFor="title" label="Tytuł" className="text-zinc-400 text-sm" />
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Tytuł posta"
              defaultValue={state.values?.title || ''}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600"
            />
            <FieldError name="title" formState={state} />
          </div>

          <div>
            <Label htmlFor="content" label="Treść" className="text-zinc-400 text-sm" />
            <textarea
              id="content"
              name="content"
              rows={6}
              placeholder="O czym chcesz napisać?"
              defaultValue={state.values?.content || ''}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 resize-none placeholder:text-zinc-600"
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
            <SubmitButton label="Opublikuj" loading="Publikowanie..." />
          </div>
          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}

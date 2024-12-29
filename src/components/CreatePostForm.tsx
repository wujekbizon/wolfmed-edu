'use client'

import { useActionState, useEffect, useState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { createPostAction } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/Input'
import Label from '@/components/Label'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import Editor from './editor/Editor'
import { EditorState } from 'lexical'

type Props = {
  onClose: () => void
}

export default function CreatePostForm({ onClose }: Props) {
  const [state, action] = useActionState(createPostAction, EMPTY_FORM_STATE)
  const [editorContent, setEditorContent] = useState('')
  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      onClose()
    }
  }, [state.status, onClose])

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const textContent = JSON.stringify(editorState.toJSON())
      setEditorContent(textContent)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-hidden">
      <div className="bg-zinc-900 rounded-lg p-2 sm:p-4 xs:p-6 w-full sm:max-w-[90%] md:max-w-3xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Nowy post</h2>
        </div>

        <form action={action} className="space-y-4 flex-1 overflow-auto px-2 h-full">
          <div>
            <Label htmlFor="title" label="Tytuł" className="text-zinc-400 text-sm mb-1" />
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Tytuł posta"
              defaultValue={state.values?.title || ''}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
            <FieldError name="title" formState={state} />
          </div>

          <div className="flex-1 h-[75%]">
            <input type="hidden" name="content" value={editorContent} />
            <Editor onChange={handleEditorChange} placeholder="O czym chcesz napisać?" className="w-full h-full" />
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

'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useNoteEditor } from '@/hooks/useNoteEditor'
import { getLexicalContent } from '@/helpers/getLexicalContent'
import { useConfirmModalStore } from '@/store/useConfirmModalStore'
import SubmitButton from './SubmitButton'
import { EditorField } from './EditorField'
import { updateNoteContentAction } from '@/actions/notes'

interface EditNoteModalProps {
  noteId: string
  initialContent: unknown
  onClose: () => void
}

export default function EditNoteModal({ noteId, initialContent, onClose }: EditNoteModalProps) {
  const router = useRouter()
  const [state, action] = useActionState(updateNoteContentAction, EMPTY_FORM_STATE)
  const { contentRef, plainTextRef, excerptRef, handleEditorChange } = useNoteEditor()
  const { openConfirmModal } = useConfirmModalStore()
  const noScriptFallback = useToastMessage(state)
  const [editorKey, setEditorKey] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (initialContent && contentRef.current) {
      const jsonContent = typeof initialContent === 'string'
        ? initialContent
        : JSON.stringify(initialContent)
      const plainText = getLexicalContent(jsonContent)
      const excerpt = plainText.substring(0, 150)

      contentRef.current.value = jsonContent
      plainTextRef.current.value = plainText
      excerptRef.current.value = excerpt
    }
  }, [])

  const handleClose = () => {
    if (hasUnsavedChanges) {
      openConfirmModal({
        title: 'Niezapisane zmiany',
        message: 'Masz niezapisane zmiany. Czy na pewno chcesz zamknąć?',
        confirmLabel: 'Zamknij',
        cancelLabel: 'Anuluj',
        onConfirm: onClose
      })
    } else {
      onClose()
    }
  }

  const handleEditorChangeWrapper = (editorState: any) => {
    setHasUnsavedChanges(true)
    handleEditorChange(editorState)
  }

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      router.refresh()
      onClose()
    }
  }, [state.status, onClose, router])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h-screen"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-4xl w-full h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900">Edytuj notatkę</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={action} className="flex-1 flex flex-col overflow-hidden">
          <input type="hidden" name="noteId" value={noteId} />

          <div className="flex-1 overflow-y-auto p-6">
            <EditorField
              contentRef={contentRef}
              plainTextRef={plainTextRef}
              excerptRef={excerptRef}
              editorKey={editorKey}
              onChange={handleEditorChangeWrapper}
              initialContent={initialContent}
              formState={state}
            />
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-8 border-t border-zinc-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
            >
              Anuluj
            </button>
            <SubmitButton label="Zapisz" loading="Zapisywanie..." />
          </div>
          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}

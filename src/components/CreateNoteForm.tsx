'use client'

import { useState, useActionState, useEffect, useCallback } from "react"
import { createNoteAction } from "@/actions/notes"
import SubmitButton from "@/components/SubmitButton"
import { EMPTY_FORM_STATE } from "@/constants/formState"
import { useToastMessage } from "@/hooks/useToastMessage"
import { NoteMetaFields } from "./NoteMetaFields"
import { TagSelector } from "./TagSelector"
import { PinnedCheckbox } from "./PinnedCheckbox"
import { EditorField } from "./EditorField"
import { useNoteEditor } from "@/hooks/useNoteEditor"
import ResizableComponent from "./Resizable"

interface CreateNoteFormProps {
  initialContent?: string
}

export default function CreateNoteForm({ initialContent }: CreateNoteFormProps) {
  const [state, action] = useActionState(createNoteAction, EMPTY_FORM_STATE)
  const { contentRef, plainTextRef, excerptRef, handleEditorChange } = useNoteEditor()
  const [pinned, setPinned] = useState(false)
  const [tagCount, setTagCount] = useState<number | "">("")
  const [editorKey, setEditorKey] = useState(0)
  const noScriptFallback = useToastMessage(state)

  useEffect(() => {
    if (state.status !== "SUCCESS") return
    setPinned(false)
    setEditorKey(prev => prev + 1)
  }, [state.status])

  const handleTagCountChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setTagCount(Number(e.target.value) || ""),
    []
  )

  return (
    <form action={action} className="h-full flex flex-row gap-3">
      <ResizableComponent direction="horizontal">
        <div className="flex flex-col gap-2 w-full">
          {initialContent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700">Wygenerowana treść (AI)</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(initialContent)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Kopiuj
                </button>
              </div>
              <pre className="text-sm text-zinc-700 whitespace-pre-wrap font-sans">{initialContent}</pre>
            </div>
          )}
          <EditorField
            formState={state}
            editorKey={editorKey}
            contentRef={contentRef}
            plainTextRef={plainTextRef}
            excerptRef={excerptRef}
            onChange={handleEditorChange}
          />
        </div>
      </ResizableComponent>
      <div className="flex flex-col justify-between grow max-h-full overflow-y-auto scrollbar-webkit py-2 pl-2">
        <div>

        <div>
          <NoteMetaFields formState={state} />
        </div>
        <div className="flex flex-col gap-4 my-4">
          <TagSelector tagCount={tagCount} onTagCountChange={handleTagCountChange} />
        </div>
        </div>
        <div className="flex flex-col items-end justify-end gap-4">
          <PinnedCheckbox pinned={pinned} onChange={setPinned} />
          <SubmitButton label="Dodaj notatkę" loading="Tworzenie..." />
          {noScriptFallback}
        </div>
      </div>
    </form>
  )
}
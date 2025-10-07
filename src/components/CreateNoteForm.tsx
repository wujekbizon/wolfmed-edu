'use client'

import { useState, useActionState, useEffect, useCallback, useRef } from "react"
import { createNoteAction } from "@/actions/notes"
import SubmitButton from "@/components/SubmitButton"
import { EMPTY_FORM_STATE } from "@/constants/formState"
import { useToastMessage } from "@/hooks/useToastMessage"
import { NoteMetaFields } from "./NoteMetaFields"
import { TagSelector } from "./TagSelector"
import { PinnedCheckbox } from "./PinnedCheckbox"
import { EditorField } from "./EditorField"
import { useNoteEditor } from "@/hooks/useNoteEditor"

export default function CreateNoteForm() {
  const [state, action] = useActionState(createNoteAction, EMPTY_FORM_STATE)
  const { contentRef, plainTextRef, excerptRef, handleEditorChange } = useNoteEditor()
  const [pinned, setPinned] = useState(false)
  const [tagCount, setTagCount] = useState(1)
  const [editorKey, setEditorKey] = useState(0)
  const noScriptFallback = useToastMessage(state)
 
  useEffect(() => {
    if (state.status !== "SUCCESS") return
    setPinned(false)
    setEditorKey(prev => prev + 1)
  }, [state.status])

  const handleTagCountChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setTagCount(Number(e.target.value)),
    []
  )

  return (
    <form action={action} className="flex-1 flex flex-col gap-2">
      <NoteMetaFields formState={state} />
      <TagSelector tagCount={tagCount} onTagCountChange={handleTagCountChange} />
       <EditorField
        formState={state}
        editorKey={editorKey}
        contentRef={contentRef}
        plainTextRef={plainTextRef}
        excerptRef={excerptRef}
        onChange={handleEditorChange}
      />
      <PinnedCheckbox pinned={pinned} onChange={setPinned} />
      <div className="flex justify-end gap-4 mt-2">
        <SubmitButton label="Dodaj notatkę" loading="Tworzenie..." />
        {noScriptFallback}
      </div>
    </form>
  )
}
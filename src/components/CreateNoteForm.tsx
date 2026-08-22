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
import { useCellFullscreen } from "@/context/CellFullscreenContext"

interface CreateNoteFormProps {
  initialContent?: string | undefined
}

export default function CreateNoteForm({ initialContent }: CreateNoteFormProps) {
  const [state, action] = useActionState(createNoteAction, EMPTY_FORM_STATE)
  const { contentRef, plainTextRef, excerptRef, handleEditorChange } = useNoteEditor()
  const [pinned, setPinned] = useState(false)
  const [tagCount, setTagCount] = useState<number | "">("")
  const [editorKey, setEditorKey] = useState(0)
  const noScriptFallback = useToastMessage(state)
  const isFullscreen = useCellFullscreen()

  useEffect(() => {
    if (state.status === "SUCCESS") {
      setPinned(false)
      setTagCount("")
      setEditorKey(prev => prev + 1)
      return
    }

    if (state.status !== "ERROR") return

    setPinned(state.values?.pinned === "true")
    const submittedTagCount = [1, 2, 3].filter((index) =>
      Object.hasOwn(state.values ?? {}, `tag${index}`)
    ).length
    setTagCount(submittedTagCount || "")
  }, [state.status, state.timestamp, state.values])

  const handleTagCountChange = useCallback(
    (value: string) => setTagCount(Number(value) || ""),
    []
  )

  const editorField = (
    <EditorField
      formState={state}
      editorKey={editorKey}
      contentRef={contentRef}
      plainTextRef={plainTextRef}
      excerptRef={excerptRef}
      onChange={handleEditorChange}
      initialContent={initialContent}
    />
  )

  return (
    <form action={action} className="h-full min-h-0 flex flex-col md:flex-row gap-3 overflow-y-auto md:overflow-visible">
      {/* Stable element type in both modes — swapping it would remount the editor
          and lose whatever is being typed. Fullscreen styles the wrapper; otherwise
          `contents` removes it so the resizable box stays the form's flex child. */}
      <div className={isFullscreen ? "flex min-h-64 min-w-0 flex-1 flex-col" : "contents"}>
        <ResizableComponent direction="horizontal">{editorField}</ResizableComponent>
      </div>
      <div className="flex flex-col justify-between grow max-md:grow-0 h-full overflow-y-auto scrollbar-webkit py-2 pl-2">
        <div>

        <div>
          <NoteMetaFields formState={state} />
        </div>
        <div className="flex flex-col gap-4 my-4">
          <TagSelector
            tagCount={tagCount}
            onTagCountChange={handleTagCountChange}
            formState={state}
          />
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

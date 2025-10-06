'use client'

import { useState, useActionState } from "react"
import { createNoteAction } from "@/actions/notes"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import FieldError from "@/components/FieldError"
import SubmitButton from "@/components/SubmitButton"
import Editor from "./editor/Editor"
import Checkbox from "./Checkbox"
import { EMPTY_FORM_STATE } from "@/constants/formState"
import { useToastMessage } from "@/hooks/useToastMessage"
import { getLexicalContent } from "@/helpers/getLexicalContent"

export default function CreateNoteForm() {
  const [state, action] = useActionState(createNoteAction, EMPTY_FORM_STATE)
  const [editorContent, setEditorContent] = useState('')
  const [plainTextContent, setPlainTextContent] = useState('')
  const [excerptContent, setExcerptContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [tagCount, setTagCount] = useState(1)
  const noScriptFallback = useToastMessage(state)

  const handleEditorChange = (editorState: any) => {
    editorState.read(() => {
      const jsonContent = JSON.stringify(editorState.toJSON())
      setEditorContent(jsonContent)

      const plainText = getLexicalContent(jsonContent)
      setPlainTextContent(plainText)
      setExcerptContent(plainText.substring(0, 150))
    })
  }

  return (
    <form action={action} className="flex-1 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <Label htmlFor="title" label="Tytuł notatki" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <Input
          id="title"
          name="title"
          placeholder="Tytuł notatki"
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
        />
        <FieldError name="title" formState={state} />
      </div>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <Label htmlFor="category" label="Kategoria" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <Input
          id="category"
          name="category"
          placeholder="np. Anatomia"
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
        />
        <FieldError name="category" formState={state} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="tagCount" label="Liczba tagów" />
        <select
          id="tagCount"
          value={tagCount}
          onChange={(e) => setTagCount(Number(e.target.value))}
          className="w-24 rounded-lg border border-zinc-200 p-2 text-sm"
        >
          {[1, 2, 3].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-row gap-2 mt-2">
        {[...Array(tagCount)].map((_, i) => (
          <Input
            key={i}
            name={`tag${i + 1}`}
            placeholder={`Tag ${i + 1} - opcjonalnie`}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
          />
        ))}
      </div>
      <div>
        <input type="hidden" name="content" value={editorContent} />
        <input type="hidden" name="plainText" value={plainTextContent} />
        <input type="hidden" name="excerpt" value={excerptContent} />
        <div className="h-64">
          <Editor onChange={handleEditorChange} placeholder="Napisz swoją notatkę..." className="min-h-64" />
        </div>
        <FieldError name="content" formState={state} />
      </div>

      <Checkbox
        id="pinned"
        name="pinned"
        label="Przypięta notatka"
        checked={pinned}
        onChange={setPinned}
      />

      <div className="flex justify-end gap-4 mt-2">
        <SubmitButton label="Dodaj notatkę" loading="Tworzenie..." />
        {noScriptFallback}
      </div>
    </form>
  )
}
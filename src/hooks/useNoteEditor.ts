import { useCallback, useRef } from "react"
import type { EditorState } from "lexical"
import { getLexicalContent } from "@/helpers/getLexicalContent"

export function useNoteEditor() {
  const contentRef = useRef<HTMLInputElement>(null)
  const plainTextRef = useRef<HTMLInputElement>(null)
  const excerptRef = useRef<HTMLInputElement>(null)

  const handleEditorChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const jsonContent = JSON.stringify(editorState.toJSON())
      const plainText = getLexicalContent(jsonContent)
      const excerpt = plainText.substring(0, 150)

      if (!contentRef.current || !plainTextRef.current || !excerptRef.current) return

      contentRef.current.value = jsonContent
      plainTextRef.current.value = plainText
      excerptRef.current.value = excerpt
    })
  }, [])

  return { contentRef, plainTextRef, excerptRef, handleEditorChange }
}
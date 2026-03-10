import { useCallback, useRef } from "react"
import type { EditorState } from "lexical"
import { getLexicalContent } from "@/helpers/getLexicalContent"

/**
 * Bridges a Lexical editor instance with hidden HTML inputs so that note
 * content can be submitted as part of a standard HTML form.
 *
 * Attach the returned refs to three `<input type="hidden" />` elements and
 * pass `handleEditorChange` to the Lexical `<LexicalComposer>` via an
 * `OnChangePlugin`. On every editor update the hook serialises the editor
 * state into three values:
 *
 * - **content** – full Lexical JSON string, stored in the database
 * - **plainText** – stripped plain-text version, used for search indexing
 * - **excerpt** – first 150 characters of plain text, shown in list previews
 *
 * @returns Refs for the three hidden inputs and the Lexical change handler.
 */
export function useNoteEditor() {
  const contentRef = useRef<HTMLInputElement>(null)
  const plainTextRef = useRef<HTMLInputElement>(null)
  const excerptRef = useRef<HTMLInputElement>(null)

  /**
   * Reads the latest editor state and writes serialised values into the
   * hidden inputs. No-ops until all three refs are attached to the DOM.
   */
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
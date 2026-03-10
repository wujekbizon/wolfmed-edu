'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'

export type SelectionRect = {
  top: number
  left: number
  width: number
}

/**
 * Hook that tracks the user's text selection within a Lexical editor.
 *
 * Registers a Lexical update listener that reads the current selection on every
 * editor tick. A ref-based guard (`prevRectRef`) prevents redundant state updates
 * when the bounding rect hasn't changed, avoiding unnecessary re-renders of the
 * selection tooltip while the user holds a selection.
 *
 * Only active when `isStudyMode` is `true` — clears all selection state otherwise.
 *
 * @param isStudyMode - When `false`, selection tracking is disabled and state is cleared.
 *
 * @returns An object with:
 * - `selectedText` – the currently selected text, trimmed; empty string when no selection
 * - `selectionRect` – bounding rect (`top`, `left`, `width`) of the selection, or `null`
 * - `clearSelection` – clears the selection state imperatively (e.g. after a tooltip action)
 */
export function useTextSelection(isStudyMode: boolean) {
  const [editor] = useLexicalComposerContext()
  const [selectedText, setSelectedText] = useState('')
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)
  // Track previous rect values so we only setState when coordinates actually change,
  // preventing SelectionTooltip re-renders on every editor tick while selection is held.
  const prevRectRef = useRef<SelectionRect | null>(null)

  useEffect(() => {
    if (!isStudyMode) {
      setSelectedText('')
      setSelectionRect(null)
      prevRectRef.current = null
      return
    }

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          const text = selection.getTextContent().trim()
          if (text.length > 0) {
            setSelectedText(text)

            const nativeSelection = window.getSelection()
            if (nativeSelection && nativeSelection.rangeCount > 0) {
              const { top, left, width } = nativeSelection.getRangeAt(0).getBoundingClientRect()
              const prev = prevRectRef.current
              if (!prev || prev.top !== top || prev.left !== left || prev.width !== width) {
                const rect = { top, left, width }
                prevRectRef.current = rect
                setSelectionRect(rect)
              }
            }
          } else {
            setSelectedText('')
            setSelectionRect(null)
            prevRectRef.current = null
          }
        } else {
          setSelectedText('')
          setSelectionRect(null)
          prevRectRef.current = null
        }
      })
    })
  }, [editor, isStudyMode])

  const clearSelection = useCallback(() => {
    setSelectedText('')
    setSelectionRect(null)
    prevRectRef.current = null
  }, [])

  return { selectedText, selectionRect, clearSelection }
}

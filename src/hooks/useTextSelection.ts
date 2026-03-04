'use client'

import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'

export type SelectionRect = {
  top: number
  left: number
  width: number
}

export function useTextSelection(isStudyMode: boolean) {
  const [editor] = useLexicalComposerContext()
  const [selectedText, setSelectedText] = useState('')
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null)

  useEffect(() => {
    if (!isStudyMode) {
      setSelectedText('')
      setSelectionRect(null)
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
              const range = nativeSelection.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              setSelectionRect({ top: rect.top, left: rect.left, width: rect.width })
            }
          } else {
            setSelectedText('')
            setSelectionRect(null)
          }
        } else {
          setSelectedText('')
          setSelectionRect(null)
        }
      })
    })
  }, [editor, isStudyMode])

  const clearSelection = () => {
    setSelectedText('')
    setSelectionRect(null)
  }

  return { selectedText, selectionRect, clearSelection }
}

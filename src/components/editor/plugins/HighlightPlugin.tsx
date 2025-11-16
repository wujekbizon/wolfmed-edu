'use client'

import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createTextNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_NORMAL, createCommand } from 'lexical'
import { $createHighlightNode, HighlightColor, $isHighlightNode } from '../nodes/HighlightNode'

export const HIGHLIGHT_COMMAND = createCommand<HighlightColor>('HIGHLIGHT_COMMAND')
export const REMOVE_HIGHLIGHT_COMMAND = createCommand('REMOVE_HIGHLIGHT_COMMAND')

export default function HighlightPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // Register highlight command
    const unregisterHighlight = editor.registerCommand(
      HIGHLIGHT_COMMAND,
      (color: HighlightColor) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        // Get selected text
        const selectedText = selection.getTextContent()
        if (!selectedText) return false

        // Create highlight node with selected text
        const highlightNode = $createHighlightNode(selectedText, color)

        // Insert highlight node
        selection.insertNodes([highlightNode])

        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    // Register remove highlight command
    const unregisterRemoveHighlight = editor.registerCommand(
      REMOVE_HIGHLIGHT_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        // Remove highlight formatting
        selection.getNodes().forEach((node) => {
          if ($isHighlightNode(node)) {
            node.replace($createTextNode(node.getTextContent()))
          }
        })

        return true
      },
      COMMAND_PRIORITY_NORMAL,
    )

    return () => {
      unregisterHighlight()
      unregisterRemoveHighlight()
    }
  }, [editor])

  return null
}

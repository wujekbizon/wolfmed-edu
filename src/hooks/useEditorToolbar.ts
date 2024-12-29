import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'
import { $getNearestNodeOfType } from '@lexical/utils'
import { useState, useEffect } from 'react'
import { $createParagraphNode } from 'lexical'

/**
 * Custom hook to manage rich text editor toolbar functionality
 * Handles text formatting, heading styles, and tracks active formats
 *
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Heading styles (h1, h3, h5)
 * - Undo/Redo commands
 * - Active format tracking for UI state
 *
 * @returns {Object} Toolbar controls and state
 * @property {Record<string, boolean>} activeFormats - Currently active formatting options
 * @property {Function} formatText - Apply text formatting
 * @property {Function} formatHeading - Apply heading formatting
 * @property {Function} handleCommand - Handle undo/redo commands
 */
export function useEditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})

  // Register listener for editor updates to track active formats
  useEffect(() => {
    // Returns cleanup function from registerUpdateListener
    // This ensures proper cleanup when component unmounts
    const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        // Update active formats based on current selection
        setActiveFormats({
          bold: selection.hasFormat('bold'),
          italic: selection.hasFormat('italic'),
          underline: selection.hasFormat('underline'),
          strikethrough: selection.hasFormat('strikethrough'),
          h1: $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)?.getTag() === 'h1',
          h3: $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)?.getTag() === 'h3',
          h5: $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)?.getTag() === 'h5',
        })
      })
    })

    return unregisterListener
  }, [editor]) // Only re-run if editor instance changes

  /**
   * Apply text formatting to selected text
   * @param format - The format to apply (bold, italic, underline, strikethrough)
   */
  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  /**
   * Apply or remove heading style from current paragraph
   * If the same heading type is already applied, converts back to normal paragraph
   * @param tag - The heading level to apply (h1, h3, h5)
   */
  const formatHeading = (tag: 'h1' | 'h3' | 'h5') => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const headingNode = $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)
      if (headingNode && headingNode.getTag() === tag) {
        // Remove heading if same tag is already applied
        headingNode.replace($createParagraphNode())
      } else {
        // Apply new heading
        selection.insertNodes([$createHeadingNode(tag)])
      }
    })
  }

  /**
   * Handle editor commands (undo/redo)
   * @param command - The command to execute
   */
  const handleCommand = (command: typeof UNDO_COMMAND | typeof REDO_COMMAND) => {
    editor.dispatchCommand(command, undefined)
  }

  return {
    activeFormats,
    formatText,
    formatHeading,
    handleCommand,
  }
}

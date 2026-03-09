import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical'
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'
import { $getNearestNodeOfType } from '@lexical/utils'
import { useState, useEffect, useCallback } from 'react'

export function useEditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const headingNode = $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)
        const headingTag = headingNode?.getTag()

        setActiveFormats({
          bold: selection.hasFormat('bold'),
          italic: selection.hasFormat('italic'),
          underline: selection.hasFormat('underline'),
          strikethrough: selection.hasFormat('strikethrough'),
          h1: headingTag === 'h1',
          h3: headingTag === 'h3',
          h5: headingTag === 'h5',
        })
      })
    })

    return unregisterListener
  }, [editor])

  const formatText = useCallback(
    (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    },
    [editor]
  )

  const formatHeading = useCallback(
    (tag: 'h1' | 'h3' | 'h5') => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        const headingNode = $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)
        if (headingNode && headingNode.getTag() === tag) {
          headingNode.replace($createParagraphNode())
        } else {
          selection.insertNodes([$createHeadingNode(tag)])
        }
      })
    },
    [editor]
  )

  const handleCommand = useCallback(
    (command: typeof UNDO_COMMAND | typeof REDO_COMMAND) => {
      editor.dispatchCommand(command, undefined)
    },
    [editor]
  )

  return {
    activeFormats,
    formatText,
    formatHeading,
    handleCommand,
  }
}

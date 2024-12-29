'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'
import { $getNearestNodeOfType } from '@lexical/utils'
import { useState, useEffect } from 'react'
import { $createParagraphNode } from 'lexical'
import { TOOLBAR_BUTTONS } from '@/constants/editorToolbar'

export default function EditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({})

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return

        // Check text formats
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
  }, [editor])

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (tag: 'h1' | 'h3' | 'h5') => {
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
  }

  const buttonClass = (active: boolean) =>
    `p-2 rounded text-zinc-300 hover:text-zinc-100 ${active ? 'bg-zinc-700 text-zinc-100' : 'hover:bg-zinc-700'}`

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-700 bg-zinc-800/50">
      <div className="flex flex-wrap items-center gap-1">
        {TOOLBAR_BUTTONS.map((button) => {
          if ('type' in button && button.type === 'divider') {
            return <div key={button.id} className="block w-px h-6 bg-zinc-700 mx-1" />
          }

          const handleClick = () => {
            switch (button.action) {
              case 'command':
                if (button.command === 'UNDO_COMMAND') {
                  editor.dispatchCommand(UNDO_COMMAND, undefined)
                } else if (button.command === 'REDO_COMMAND') {
                  editor.dispatchCommand(REDO_COMMAND, undefined)
                }
                break
              case 'format':
                if (button.value) {
                  formatText(button.value as 'bold' | 'italic' | 'underline' | 'strikethrough')
                }
                break
              case 'heading':
                if (button.value) {
                  formatHeading(button.value as 'h1' | 'h3' | 'h5')
                }
                break
            }
          }

          const isActive = button.value ? activeFormats[button.value] ?? false : false

          return (
            <button
              type="button"
              key={button.id}
              title={button.title}
              onClick={handleClick}
              className={`${buttonClass(isActive)} p-1.5 sm:p-2`}
            >
              {button.Icon}
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { useEditorToolbar } from '@/hooks/useEditorToolbar'
import { TOOLBAR_BUTTONS } from '@/constants/editorToolbar'

export default function EditorToolbar() {
  const { activeFormats, formatText, formatHeading, handleCommand } = useEditorToolbar()

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
                  handleCommand(UNDO_COMMAND)
                } else if (button.command === 'REDO_COMMAND') {
                  handleCommand(REDO_COMMAND)
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

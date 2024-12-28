'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical'

export default function EditorToolbar() {
  const [editor] = useLexicalComposerContext()

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-zinc-700 bg-zinc-800/50">
      <button
        type="button"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-zinc-100"
        title="Cofnij"
      >
        {/* <BiUndo size={18} /> */} Undo
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-zinc-100"
        title="Ponów"
      >
        {/* <BiRedo size={18} /> */} Redo
      </button>
      <div className="w-px h-6 bg-zinc-700 mx-1" />
      <button
        type="button"
        onClick={() => formatText('bold')}
        className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-zinc-100"
        title="Pogrubienie"
      >
        {/* <BiBold size={18} /> */} Bold
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-zinc-100"
        title="Kursywa"
      >
        {/* <BiItalic size={18} /> */} Italic
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-zinc-100"
        title="Podkreślenie"
      >
        {/* <BiUnderline size={18} /> */} Underline
      </button>
      <button
        type="button"
        onClick={() => formatText('strikethrough')}
        className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-zinc-100"
        title="Przekreślenie"
      >
        {/* <BiStrikethrough size={18} /> */} Strike
      </button>
    </div>
  )
}

'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { EditorState } from 'lexical'
import EditorToolbar from './EditorToolbar'
import { editorConfig } from './editorConfig'

interface Props {
  onChange?: (editorState: EditorState) => void
  initialContent?: string
  placeholder?: string
  className?: string
}

export default function Editor({
  onChange,
  initialContent = '',
  placeholder = 'Zacznij pisać...',
  className = '',
}: Props) {
  const config = {
    ...editorConfig,
    editorState: initialContent ? JSON.parse(initialContent) : undefined,
  }

  return (
    <LexicalComposer initialConfig={config}>
      <div className={`bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 ${className}`}>
        <EditorToolbar />
        <div className="p-4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[150px] max-h-[400px] overflow-y-auto scrollbar-webkit outline-none text-zinc-200" />
            }
            placeholder={<div className="absolute top-0 left-0 text-zinc-500 pointer-events-none">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {onChange && <OnChangePlugin onChange={onChange} />}
        </div>
      </div>
    </LexicalComposer>
  )
}

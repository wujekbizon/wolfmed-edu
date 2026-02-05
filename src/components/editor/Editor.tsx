'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { EditorState } from 'lexical'
import EditorToolbar from './EditorToolbar'
import { editorConfig } from './editorConfig'

interface Props {
  onChange?: (editorState: EditorState) => void
  initialContent?: string
  placeholder?: string
  className?: string
}

function isLexicalJSON(content: string): boolean {
  if (!content) return false
  const trimmed = content.trim()
  if (!trimmed.startsWith('{')) return false
  try {
    const parsed = JSON.parse(trimmed)
    return parsed.root !== undefined
  } catch {
    return false
  }
}

export default function Editor({
  onChange,
  initialContent = '',
  placeholder = 'Zacznij pisać...',
  className = '',
}: Props) {
  const config = {
    ...editorConfig,
    editorState: initialContent
      ? (editor: any) => {
          if (isLexicalJSON(initialContent)) {
            const initialState = editor.parseEditorState(initialContent)
            editor.setEditorState(initialState)
          } else {
            editor.update(() => {
              $convertFromMarkdownString(initialContent, TRANSFORMERS)
            })
          }
        }
      : () => {},
  }

  return (
    <LexicalComposer initialConfig={config}>
      <div
        className={`bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 h-full ${className}`}
        role="textbox"
        aria-multiline="true"
        aria-label="Edytor tekstu"
      >
        <EditorToolbar />
        <div className="p-2 sm:p-4 flex-1 relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="h-full overflow-y-auto scrollbar-webkit outline-none text-zinc-200"
                aria-describedby="editor-placeholder"
              />
            }
            placeholder={
              <div
                id="editor-placeholder"
                className="absolute top-[16px] left-[16px] text-zinc-600 pointer-events-none"
              >
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {onChange && <OnChangePlugin onChange={onChange} />}
        </div>
      </div>
    </LexicalComposer>
  )
}

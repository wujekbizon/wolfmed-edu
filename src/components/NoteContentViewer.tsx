'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { editorConfig } from './editor/editorConfig'

interface Props {
  content: unknown
  plainTextFallback?: string | null
}

export default function NoteContentViewer({ content, plainTextFallback }: Props) {
  let parsedContent
  let hasError = false

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content)
    } catch {
      hasError = true
    }
  } else if (typeof content === 'object' && content !== null) {
    parsedContent = content
  } else {
    hasError = true
  }

  if (hasError && plainTextFallback) {
    return (
      <div className="prose prose-lg prose-zinc max-w-none">
        <p className="whitespace-pre-wrap text-zinc-700 leading-relaxed text-base sm:text-lg">
          {plainTextFallback}
        </p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 italic text-sm">
          Nie można wyświetlić zawartości notatki
        </p>
      </div>
    )
  }

  const viewerConfig = {
    ...editorConfig,
    editorState: JSON.stringify(parsedContent),
    editable: false,
  }

  return (
    <LexicalComposer initialConfig={viewerConfig}>
      <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
        <div className="p-4 sm:p-6">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none text-zinc-200 min-h-[200px]"
                aria-label="Podgląd notatki"
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
    </LexicalComposer>
  )
}

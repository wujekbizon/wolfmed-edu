'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { viewerConfig } from './editor/viewerConfig'
import { StudyViewerContent } from './StudyViewerContent'
import { LexicalEditor } from 'lexical'
import type { SerializedEditorState } from 'lexical'

interface StudyViewerProps {
    noteId: string
    content: unknown
    plainTextFallback?: string | null
    onEditClick: () => void
}

export default function StudyViewer({ noteId, content, plainTextFallback, onEditClick }: StudyViewerProps) {
    let parsedContent: SerializedEditorState | null = null
    let hasError = false

    if (typeof content === 'string') {
        try {
            parsedContent = JSON.parse(content)
        } catch {
            hasError = true
        }
    } else if (typeof content === 'object' && content !== null) {
        parsedContent = content as SerializedEditorState
    } else {
        hasError = true
    }

    if (hasError && plainTextFallback) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
                <div className="p-6 sm:p-8 md:p-10">
                    <div className="prose prose-lg prose-zinc max-w-none">
                        <p className="whitespace-pre-wrap text-zinc-700 leading-relaxed text-base sm:text-lg">
                            {plainTextFallback}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (hasError) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
                <div className="p-6 sm:p-8 md:p-10">
                    <div className="text-center py-12">
                        <p className="text-zinc-500 italic text-sm">
                            Nie można wyświetlić zawartości notatki
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const config = {
        ...viewerConfig,
        editorState: (editor: LexicalEditor) => {
            if (!parsedContent) return
            const serialized = typeof parsedContent === 'string'
                ? parsedContent
                : JSON.stringify(parsedContent)
            editor.setEditorState(editor.parseEditorState(serialized))
        },
    }

    return (
        <div className="relative">
            <LexicalComposer initialConfig={config}>
                <StudyViewerContent noteId={noteId} content={content} onEditClick={onEditClick} />
            </LexicalComposer>
        </div>
    )
}

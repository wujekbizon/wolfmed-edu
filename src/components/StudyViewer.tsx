'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { viewerConfig } from './editor/viewerConfig'
import StudyToolbar from './StudyToolbar'
import HighlightPlugin from './editor/plugins/HighlightPlugin'
import CommentPlugin from './editor/plugins/CommentPlugin'
import FlashcardPlugin from './editor/plugins/FlashcardPlugin'
import { LexicalEditor } from 'lexical'
import type { SerializedEditorState } from 'lexical'

interface StudyViewerProps {
    content: unknown
    plainTextFallback?: string | null
}

export default function StudyViewer({ content, plainTextFallback }: StudyViewerProps) {
    let parsedContent: SerializedEditorState | null = null
    let hasError = false
    if (typeof content === 'string') {
        try {
            parsedContent = JSON.parse(content)
        } catch {
            hasError = true
        }
    } else if (typeof content === 'object' && content !== null) {
        parsedContent = content as SerializedEditorState;
    } else {
        hasError = true
    }
    if (hasError && plainTextFallback) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
                <StudyToolbar />
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
                <StudyToolbar />
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

            const initialState = editor.parseEditorState(serialized)
            editor.setEditorState(initialState)
        },
        editable: true,
    }

    return (
        <div className="relative">
            <LexicalComposer initialConfig={config}>
                <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden animate-fadeInUp opacity-0" style={{ '--slidein-delay': '0.1s' } as React.CSSProperties}>
                    <StudyToolbar />
                    <div className="p-6 sm:p-8 md:p-10 selection:bg-[#ff9898]/20 selection:text-zinc-900">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="outline-none text-zinc-700 min-h-[200px] focus:ring-0 leading-relaxed"
                                    aria-label="Podgląd notatki w trybie nauki"
                                />
                            }
                            placeholder={null}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HighlightPlugin />
                        <CommentPlugin />
                        <FlashcardPlugin />
                        {/* <CollapsiblePlugin /> */}
                    </div>
                </div>
            </LexicalComposer>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { viewerConfig } from './editor/viewerConfig'
import StudyToolbar from './StudyToolbar'
import HighlightPlugin from './editor/plugins/HighlightPlugin'
import CommentPlugin from './editor/plugins/CommentPlugin'
import FlashcardPlugin from './editor/plugins/FlashcardPlugin'
import FlashcardReviewModal from './FlashcardReviewModal'
import CommentModal from './CommentModal'
import FlashcardCreateModal from './FlashcardCreateModal'
import { useFlashcards } from '@/hooks/useFlashcards'
import { LexicalEditor, $getSelection, $isRangeSelection } from 'lexical'
import type { SerializedEditorState } from 'lexical'

interface StudyViewerProps {
    noteId: string
    content: unknown
    plainTextFallback?: string | null
    onEditClick: () => void
}

function StudyViewerContent({ noteId, content, onEditClick }: { noteId: string; content: unknown; onEditClick: () => void }) {
    const [editor] = useLexicalComposerContext()
    const [showCommentModal, setShowCommentModal] = useState(false)
    const [showFlashcardModal, setShowFlashcardModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [isStudyMode, setIsStudyMode] = useState(false)
    const [selectedText, setSelectedText] = useState('')
    const { flashcards, refreshFlashcards } = useFlashcards(noteId)

    const handleFlashcardClick = () => {
        // Get selected text from editor
        editor.read(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                const text = selection.getTextContent()
                setSelectedText(text)
            } else {
                setSelectedText('')
            }
        })
        setShowFlashcardModal(true)
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden animate-fadeInUp opacity-0" style={{ '--slidein-delay': '0.1s' } as React.CSSProperties}>
                <StudyToolbar
                    noteId={noteId}
                    content={content}
                    onEditClick={onEditClick}
                    onCommentClick={() => setShowCommentModal(true)}
                    onFlashcardClick={handleFlashcardClick}
                    onReviewClick={() => setShowReviewModal(true)}
                    flashcardsCount={flashcards.length}
                    isStudyMode={isStudyMode}
                    onToggleStudyMode={() => setIsStudyMode(!isStudyMode)}
                />
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
                </div>
            </div>
            {showCommentModal && <CommentModal onClose={() => setShowCommentModal(false)} />}
            {showFlashcardModal && (
                <FlashcardCreateModal
                    noteId={noteId}
                    selectedText={selectedText}
                    onClose={() => {
                        setShowFlashcardModal(false)
                        setSelectedText('')
                    }}
                    onSuccess={refreshFlashcards}
                />
            )}
            {showReviewModal && <FlashcardReviewModal flashcards={flashcards} onClose={() => setShowReviewModal(false)} />}
        </>
    )
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
        parsedContent = content as SerializedEditorState;
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

            const initialState = editor.parseEditorState(serialized)
            editor.setEditorState(initialState)
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

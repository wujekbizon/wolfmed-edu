'use client'

import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { $getSelection, $isRangeSelection } from 'lexical'
import StudyToolbar from './StudyToolbar'
import HighlightPlugin from './editor/plugins/HighlightPlugin'
import CommentPlugin from './editor/plugins/CommentPlugin'
import FlashcardPlugin from './editor/plugins/FlashcardPlugin'
import FlashcardReviewModal from './FlashcardReviewModal'
import CommentModal from './CommentModal'
import FlashcardCreateModal from './FlashcardCreateModal'
import SelectionTooltip from './SelectionTooltip'
import { useFlashcards } from '@/hooks/useFlashcards'
import { useTextSelection } from '@/hooks/useTextSelection'

interface StudyViewerContentProps {
    noteId: string
    content: unknown
    onEditClick: () => void
}

export function StudyViewerContent({ noteId, content, onEditClick }: StudyViewerContentProps) {
    const [editor] = useLexicalComposerContext()
    const [showCommentModal, setShowCommentModal] = useState(false)
    const [showFlashcardModal, setShowFlashcardModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [isStudyMode, setIsStudyMode] = useState(false)
    const [flashcardFromTooltip, setFlashcardFromTooltip] = useState(false)
    const [selectedText, setSelectedText] = useState('')
    const { flashcards } = useFlashcards(noteId)
    const { selectedText: tooltipText, selectionRect, clearSelection } = useTextSelection(isStudyMode)

    const handleFlashcardClick = () => {
        editor.read(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                setSelectedText(selection.getTextContent())
            } else {
                setSelectedText('')
            }
        })
        setFlashcardFromTooltip(false)
        setShowFlashcardModal(true)
    }

    const handleTooltipFlashcardClick = () => {
        setSelectedText(tooltipText)
        setFlashcardFromTooltip(true)
        clearSelection()
        setShowFlashcardModal(true)
    }

    const handleFlashcardModalClose = () => {
        setShowFlashcardModal(false)
        setSelectedText('')
        setFlashcardFromTooltip(false)
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
            {isStudyMode && selectionRect && tooltipText && !showFlashcardModal && (
                <SelectionTooltip
                    selectionRect={selectionRect}
                    onCreateFlashcard={handleTooltipFlashcardClick}
                />
            )}
            {showCommentModal && <CommentModal onClose={() => setShowCommentModal(false)} />}
            {showFlashcardModal && (
                <FlashcardCreateModal
                    noteId={noteId}
                    selectedText={selectedText}
                    selectedAsAnswer={flashcardFromTooltip}
                    onClose={handleFlashcardModalClose}
                    onSuccess={() => {}}
                />
            )}
            {showReviewModal && <FlashcardReviewModal flashcards={flashcards} onClose={() => setShowReviewModal(false)} />}
        </>
    )
}

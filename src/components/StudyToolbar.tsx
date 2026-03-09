'use client'

import { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Highlighter, MessageSquare, BookmarkPlus, X, GraduationCap, BookOpen, Eye, Pencil } from 'lucide-react'
import { HIGHLIGHT_COMMAND } from './editor/plugins/HighlightPlugin'
import type { HighlightColor } from './editor/nodes/HighlightNode'
import { HIGHLIGHT_COLORS, STUDY_TOOLBAR_TEXT } from '@/constants/studyViewer'

interface StudyToolbarProps {
  noteId: string
  content: unknown
  onEditClick: () => void
  onCommentClick: () => void
  onFlashcardClick: () => void
  onReviewClick: () => void
  flashcardsCount: number
  isStudyMode: boolean
  onToggleStudyMode: () => void
}

export default function StudyToolbar({
  onEditClick,
  onCommentClick,
  onFlashcardClick,
  onReviewClick,
  flashcardsCount,
  isStudyMode,
  onToggleStudyMode,
}: StudyToolbarProps) {
  const [editor] = useLexicalComposerContext()
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    editor.setEditable(isStudyMode)
  }, [editor, isStudyMode])

  const handleHighlight = (color: HighlightColor) => {
    editor.dispatchCommand(HIGHLIGHT_COMMAND, color)
    setShowColorPicker(false)
  }

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-zinc-200/60 px-4 sm:px-5 py-2.5">
      <div className="flex items-center gap-2 flex-wrap">

        {/* Segmented Read | Study control */}
        <div className="relative inline-flex bg-zinc-100 rounded-lg p-[3px] shrink-0">
          {/* Sliding pill */}
          <span
            aria-hidden="true"
            className={`absolute inset-[3px] w-[calc(50%_-_3px)] rounded-md bg-white shadow-sm transition-transform duration-200 ease-in-out pointer-events-none ${
              isStudyMode ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
          <button
            type="button"
            onClick={() => isStudyMode && onToggleStudyMode()}
            className={`relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
              !isStudyMode ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{STUDY_TOOLBAR_TEXT.readOnlyMode}</span>
          </button>
          <button
            type="button"
            onClick={() => !isStudyMode && onToggleStudyMode()}
            className={`relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
              isStudyMode ? 'text-[#ff9898]' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{STUDY_TOOLBAR_TEXT.studyMode}</span>
          </button>
        </div>

        {/* Study tool group — animates in when study mode activates */}
        {isStudyMode && (
          <div className="flex items-center gap-0.5 bg-zinc-50 border border-zinc-200 rounded-lg p-0.5 animate-fadeInUp opacity-0">

            {/* Highlight + color picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title={STUDY_TOOLBAR_TEXT.highlightTitle}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-600 hover:bg-[#ff9898]/10 hover:text-[#ff9898] transition-all duration-150 text-xs font-medium"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{STUDY_TOOLBAR_TEXT.highlightButton}</span>
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1.5 bg-white rounded-lg shadow-xl border border-zinc-200 p-3 min-w-[190px] z-20">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-700">{STUDY_TOOLBAR_TEXT.chooseColor}</span>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {HIGHLIGHT_COLORS.map(({ color, label, className }) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleHighlight(color)}
                        className={`px-2.5 py-1.5 rounded-md border-2 text-xs font-medium transition-all duration-150 ${className}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-zinc-200 mx-0.5" />

            {/* Comment */}
            <button
              type="button"
              onClick={onCommentClick}
              title={STUDY_TOOLBAR_TEXT.commentTitle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-600 hover:bg-[#ff9898]/10 hover:text-[#ff9898] transition-all duration-150 text-xs font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{STUDY_TOOLBAR_TEXT.commentButton}</span>
            </button>

            <div className="w-px h-4 bg-zinc-200 mx-0.5" />

            {/* Flashcard */}
            <button
              type="button"
              onClick={onFlashcardClick}
              title={STUDY_TOOLBAR_TEXT.flashcardTitle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-600 hover:bg-[#ff9898]/10 hover:text-[#ff9898] transition-all duration-150 text-xs font-medium"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{STUDY_TOOLBAR_TEXT.flashcardButton}</span>
            </button>
          </div>
        )}

        {/* Review button — rose gradient with count badge */}
        {isStudyMode && flashcardsCount > 0 && (
          <button
            type="button"
            onClick={onReviewClick}
            title={STUDY_TOOLBAR_TEXT.reviewButton}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] hover:from-[#ff8585] hover:to-[#ffb3b3] text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 animate-fadeInUp opacity-0"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.reviewButtonShort}</span>
            <span className="inline-flex items-center justify-center bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
              {flashcardsCount}
            </span>
          </button>
        )}

        <div className="flex-1" />

        {/* Edit button — only in read mode */}
        {!isStudyMode && (
          <button
            type="button"
            onClick={onEditClick}
            title="Edytuj treść notatki"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-500 hover:text-[#ff9898] hover:bg-[#ff9898]/10 rounded-lg text-xs font-medium transition-all duration-150"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edytuj</span>
          </button>
        )}
      </div>
    </div>
  )
}

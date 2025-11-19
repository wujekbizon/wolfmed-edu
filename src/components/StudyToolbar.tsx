'use client'

import { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Highlighter, MessageSquare, BookmarkPlus, ChevronDown, X, GraduationCap, Eye, BookOpen, Pencil } from 'lucide-react'
import { HIGHLIGHT_COMMAND } from './editor/plugins/HighlightPlugin'
import type { HighlightColor } from './editor/nodes/HighlightNode'
import {
  HIGHLIGHT_COLORS,
  STUDY_TOOLBAR_TEXT,
} from '@/constants/studyViewer'

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
  noteId,
  content,
  onEditClick,
  onCommentClick,
  onFlashcardClick,
  onReviewClick,
  flashcardsCount,
  isStudyMode,
  onToggleStudyMode
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
    <>
      <div className="sticky top-0 z-10 bg-gradient-to-r from-white/95 to-rose-50/30 backdrop-blur-sm border-b border-zinc-200/60 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isStudyMode && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                title={STUDY_TOOLBAR_TEXT.highlightTitle}
              >
                <Highlighter className="w-4 h-4" />
                <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.highlightButton}</span>
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 p-3 min-w-[200px] z-20">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-200">
                    <span className="text-xs font-semibold text-zinc-700">{STUDY_TOOLBAR_TEXT.chooseColor}</span>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {HIGHLIGHT_COLORS.map(({ color, label, className }) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleHighlight(color)}
                        className={`px-3 py-2 rounded-md border-2 text-xs font-medium transition-all duration-200 ${className}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {isStudyMode && (
            <button
              type="button"
              onClick={onCommentClick}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title={STUDY_TOOLBAR_TEXT.commentTitle}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.commentButton}</span>
            </button>
          )}
          {isStudyMode && (
            <button
              type="button"
              onClick={onFlashcardClick}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title={STUDY_TOOLBAR_TEXT.flashcardTitle}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.flashcardButton}</span>
            </button>
          )}
          {isStudyMode && flashcardsCount > 0 && (
            <button
              type="button"
              onClick={onReviewClick}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border border-purple-600 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title={STUDY_TOOLBAR_TEXT.reviewButton}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.reviewButton} ({flashcardsCount})</span>
              <span className="sm:hidden">{flashcardsCount}</span>
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md opacity-50 cursor-not-allowed"
            title={STUDY_TOOLBAR_TEXT.sectionsTitle}
            disabled
          >
            <ChevronDown className="w-4 h-4" />
            <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.sectionsButton}</span>
          </button>

          {!isStudyMode && (
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title="Edytuj treść notatki"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edytuj</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleStudyMode}
            className={`ml-auto inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${
              isStudyMode
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-600'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
            title={isStudyMode ? STUDY_TOOLBAR_TEXT.disableStudyMode : STUDY_TOOLBAR_TEXT.enableStudyMode}
          >
            {isStudyMode ? <BookOpen className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isStudyMode ? STUDY_TOOLBAR_TEXT.disableStudyMode : STUDY_TOOLBAR_TEXT.enableStudyMode}
            </span>
          </button>

          <div className="text-xs text-zinc-500 hidden md:block">
            {isStudyMode ? STUDY_TOOLBAR_TEXT.studyMode : STUDY_TOOLBAR_TEXT.readOnlyMode}
          </div>
        </div>
      </div>
    </>
  )
}

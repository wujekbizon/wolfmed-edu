'use client'

import { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Highlighter, MessageSquare, BookmarkPlus, ChevronDown, X, GraduationCap, Eye, BookOpen } from 'lucide-react'
import { HIGHLIGHT_COMMAND } from './editor/plugins/HighlightPlugin'
import { ADD_COMMENT_COMMAND } from './editor/plugins/CommentPlugin'
import { CREATE_FLASHCARD_COMMAND } from './editor/plugins/FlashcardPlugin'
import type { HighlightColor } from './editor/nodes/HighlightNode'
import { useFlashcards } from '@/hooks/useFlashcards'
import FlashcardReviewModal from './FlashcardReviewModal'
import {
  HIGHLIGHT_COLORS,
  STUDY_TOOLBAR_TEXT,
  COMMENT_MODAL_TEXT,
  FLASHCARD_MODAL_TEXT,
} from '@/constants/studyViewer'

export default function StudyToolbar() {
  const [editor] = useLexicalComposerContext()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showFlashcardModal, setShowFlashcardModal] = useState(false)
  const [flashcardQuestion, setFlashcardQuestion] = useState('')
  const [flashcardAnswer, setFlashcardAnswer] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const { flashcards, refreshFlashcards } = useFlashcards()

  useEffect(() => {
    refreshFlashcards()
  }, [refreshFlashcards])

  useEffect(() => {
    editor.setEditable(isStudyMode)
  }, [editor, isStudyMode])

  const handleHighlight = (color: HighlightColor) => {
    editor.dispatchCommand(HIGHLIGHT_COMMAND, color)
    setShowColorPicker(false)
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      editor.dispatchCommand(ADD_COMMENT_COMMAND, { commentText: commentText.trim() })
      setCommentText('')
      setShowCommentModal(false)
    }
  }

  const handleCreateFlashcard = () => {
    if (flashcardQuestion.trim() && flashcardAnswer.trim()) {
      editor.dispatchCommand(CREATE_FLASHCARD_COMMAND, {
        questionText: flashcardQuestion.trim(),
        answerText: flashcardAnswer.trim(),
      })
      setFlashcardQuestion('')
      setFlashcardAnswer('')
      setShowFlashcardModal(false)
      refreshFlashcards()
    }
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
              onClick={() => setShowCommentModal(true)}
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
              onClick={() => setShowFlashcardModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title={STUDY_TOOLBAR_TEXT.flashcardTitle}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.flashcardButton}</span>
            </button>
          )}
          {isStudyMode && flashcards.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border border-purple-600 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title={STUDY_TOOLBAR_TEXT.reviewButton}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{STUDY_TOOLBAR_TEXT.reviewButton} ({flashcards.length})</span>
              <span className="sm:hidden">{flashcards.length}</span>
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

          <button
            type="button"
            onClick={() => setIsStudyMode(!isStudyMode)}
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
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCommentModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-md w-full animate-[scaleIn_0.2s_ease-out_forwards]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{COMMENT_MODAL_TEXT.title}</h3>
              </div>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              {COMMENT_MODAL_TEXT.description}
            </p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={COMMENT_MODAL_TEXT.placeholder}
              className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff9898]/30 focus:border-[#ff9898] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
              >
                {COMMENT_MODAL_TEXT.cancel}
              </button>
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {COMMENT_MODAL_TEXT.submit}
              </button>
            </div>
          </div>
        </div>
      )}
      {showFlashcardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFlashcardModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-md w-full animate-[scaleIn_0.2s_ease-out_forwards]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <BookmarkPlus className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{FLASHCARD_MODAL_TEXT.createTitle}</h3>
              </div>
              <button
                onClick={() => setShowFlashcardModal(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              {FLASHCARD_MODAL_TEXT.createDescription}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {FLASHCARD_MODAL_TEXT.questionLabel}
                </label>
                <input
                  type="text"
                  value={flashcardQuestion}
                  onChange={(e) => setFlashcardQuestion(e.target.value)}
                  placeholder={FLASHCARD_MODAL_TEXT.questionPlaceholder}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {FLASHCARD_MODAL_TEXT.answerLabel}
                </label>
                <textarea
                  value={flashcardAnswer}
                  onChange={(e) => setFlashcardAnswer(e.target.value)}
                  placeholder={FLASHCARD_MODAL_TEXT.answerPlaceholder}
                  className="w-full h-24 px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFlashcardModal(false)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
              >
                {FLASHCARD_MODAL_TEXT.cancel}
              </button>
              <button
                onClick={handleCreateFlashcard}
                disabled={!flashcardQuestion.trim() || !flashcardAnswer.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {FLASHCARD_MODAL_TEXT.submit}
              </button>
            </div>
          </div>
        </div>
      )}
      {showReviewModal && (
        <FlashcardReviewModal
          flashcards={flashcards}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  )
}

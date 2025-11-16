'use client'

import { useState, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Highlighter, MessageSquare, BookmarkPlus, ChevronDown, X, GraduationCap } from 'lucide-react'
import { HIGHLIGHT_COMMAND } from './editor/plugins/HighlightPlugin'
import { ADD_COMMENT_COMMAND } from './editor/plugins/CommentPlugin'
import { CREATE_FLASHCARD_COMMAND, useFlashcards } from './editor/plugins/FlashcardPlugin'
import { HighlightColor } from './editor/nodes/HighlightNode'
import FlashcardReviewModal from './FlashcardReviewModal'

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; className: string }[] = [
  { color: 'yellow', label: 'Yellow', className: 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400' },
  { color: 'green', label: 'Green', className: 'bg-green-200 hover:bg-green-300 border-green-400' },
  { color: 'blue', label: 'Blue', className: 'bg-blue-200 hover:bg-blue-300 border-blue-400' },
  { color: 'pink', label: 'Pink', className: 'bg-pink-200 hover:bg-pink-300 border-pink-400' },
  { color: 'purple', label: 'Purple', className: 'bg-purple-200 hover:bg-purple-300 border-purple-400' },
]

export default function StudyToolbar() {
  const [editor] = useLexicalComposerContext()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showFlashcardModal, setShowFlashcardModal] = useState(false)
  const [flashcardQuestion, setFlashcardQuestion] = useState('')
  const [flashcardAnswer, setFlashcardAnswer] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const { flashcards, refreshFlashcards } = useFlashcards()

  useEffect(() => {
    refreshFlashcards()
  }, [refreshFlashcards])

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
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title="Highlight text"
            >
              <Highlighter className="w-4 h-4" />
              <span className="hidden sm:inline">Highlight</span>
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 p-3 min-w-[200px] z-20">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-200">
                  <span className="text-xs font-semibold text-zinc-700">Choose Color</span>
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
          <button
            type="button"
            onClick={() => setShowCommentModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            title="Add comment"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFlashcardModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            title="Create flashcard"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Flashcard</span>
          </button>
          {flashcards.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border border-purple-600 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              title="Review flashcards"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Review Cards ({flashcards.length})</span>
              <span className="sm:hidden">{flashcards.length}</span>
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gradient-to-r hover:from-[#ff9898]/10 hover:to-[#ffc5c5]/10 text-zinc-700 hover:text-[#ff9898] border border-zinc-200 hover:border-[#ff9898]/30 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md opacity-50 cursor-not-allowed"
            title="Toggle collapsible sections (Coming soon)"
            disabled
          >
            <ChevronDown className="w-4 h-4" />
            <span className="hidden sm:inline">Sections</span>
          </button>

          <div className="ml-auto text-xs text-zinc-500 hidden md:block">
            Study Mode
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
                <h3 className="text-lg font-semibold text-zinc-900">Add Comment</h3>
              </div>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Select text first, then add your note or annotation.
            </p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your comment here..."
              className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff9898]/30 focus:border-[#ff9898] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
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
                <h3 className="text-lg font-semibold text-zinc-900">Create Flashcard</h3>
              </div>
              <button
                onClick={() => setShowFlashcardModal(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Create a flashcard to help you study and memorize this content.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={flashcardQuestion}
                  onChange={(e) => setFlashcardQuestion(e.target.value)}
                  placeholder="What is the question?"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={flashcardAnswer}
                  onChange={(e) => setFlashcardAnswer(e.target.value)}
                  placeholder="What is the answer?"
                  className="w-full h-24 px-4 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFlashcardModal(false)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFlashcard}
                disabled={!flashcardQuestion.trim() || !flashcardAnswer.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Flashcard
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

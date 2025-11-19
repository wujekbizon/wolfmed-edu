'use client'

import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { BookmarkPlus, X } from 'lucide-react'
import { CREATE_FLASHCARD_COMMAND } from './editor/plugins/FlashcardPlugin'
import { FLASHCARD_MODAL_TEXT } from '@/constants/studyViewer'

interface FlashcardCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FlashcardCreateModal({ onClose, onSuccess }: FlashcardCreateModalProps) {
  const [editor] = useLexicalComposerContext()
  const [flashcardQuestion, setFlashcardQuestion] = useState('')
  const [flashcardAnswer, setFlashcardAnswer] = useState('')

  const handleCreateFlashcard = () => {
    if (flashcardQuestion.trim() && flashcardAnswer.trim()) {
      editor.dispatchCommand(CREATE_FLASHCARD_COMMAND, {
        questionText: flashcardQuestion.trim(),
        answerText: flashcardAnswer.trim(),
      })
      setFlashcardQuestion('')
      setFlashcardAnswer('')
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-md w-full animate-[scaleIn_0.2s_ease-out_forwards]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <BookmarkPlus className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">{FLASHCARD_MODAL_TEXT.createTitle}</h3>
          </div>
          <button
            onClick={onClose}
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
            onClick={onClose}
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
  )
}

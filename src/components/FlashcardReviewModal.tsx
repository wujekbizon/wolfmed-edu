'use client'

import { useState } from 'react'
import { X, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { FlashcardData } from './editor/plugins/FlashcardPlugin'
import { FLASHCARD_REVIEW_TEXT } from '@/constants/studyViewer'

interface FlashcardReviewModalProps {
  flashcards: FlashcardData[]
  onClose: () => void
}

export default function FlashcardReviewModal({ flashcards, onClose }: FlashcardReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cards, setCards] = useState(flashcards)

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{FLASHCARD_REVIEW_TEXT.noCardsTitle}</h3>
            <p className="text-zinc-600 mb-6">{FLASHCARD_REVIEW_TEXT.noCardsDescription}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg font-medium hover:shadow-md transition-all duration-200"
            >
              {FLASHCARD_REVIEW_TEXT.close}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">{FLASHCARD_REVIEW_TEXT.title}</h3>
            <p className="text-sm text-zinc-500">{FLASHCARD_REVIEW_TEXT.cardProgress(currentIndex + 1, cards.length)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 text-zinc-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title={FLASHCARD_REVIEW_TEXT.shuffleTitle}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          className="relative h-64 mb-6 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-xs text-purple-600 font-semibold mb-4">{FLASHCARD_REVIEW_TEXT.questionLabel}</p>
              <p className="text-2xl font-bold text-zinc-900 text-center">
                {currentCard?.questionText}
              </p>
              <p className="text-xs text-zinc-400 mt-6">{FLASHCARD_REVIEW_TEXT.clickToReveal}</p>
            </div>
            <div
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <p className="text-xs text-green-600 font-semibold mb-4">{FLASHCARD_REVIEW_TEXT.answerLabel}</p>
              <p className="text-xl text-zinc-800 text-center leading-relaxed">
                {currentCard?.answerText}
              </p>
              <p className="text-xs text-zinc-400 mt-6">{FLASHCARD_REVIEW_TEXT.clickToSeeQuestion}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            {FLASHCARD_REVIEW_TEXT.previous}
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {FLASHCARD_REVIEW_TEXT.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useFlashcardReviewStore } from '@/store/useFlashcardReviewStore'
import FlashcardReviewModal from './FlashcardReviewModal'

/**
 * Renders the review modal at panel level.
 *
 * The panel layout is `position: relative`, so a fixed-position modal rendered
 * inside a nested component resolves against the wrong containing block. The
 * `sessionId` key resets shuffle and card position for each new review.
 */
export default function FlashcardReviewModalHost() {
  const { isOpen, cards, sessionId, closeReview } = useFlashcardReviewStore()

  if (!isOpen) return null

  return <FlashcardReviewModal key={sessionId} flashcards={cards} onClose={closeReview} />
}

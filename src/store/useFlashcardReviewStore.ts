import { create } from 'zustand'
import type { Flashcard } from '@/types/flashcardTypes'

interface FlashcardReviewState {
  isOpen: boolean
  cards: Flashcard[]
  sessionId: number
  openReview: (cards: Flashcard[]) => void
  closeReview: () => void
}

export const useFlashcardReviewStore = create<FlashcardReviewState>((set) => ({
  isOpen: false,
  cards: [],
  sessionId: 0,
  openReview: (cards) => set({ isOpen: true, cards, sessionId: Date.now() }),
  closeReview: () => set({ isOpen: false, cards: [] }),
}))

import { useFlashcardStore, type Flashcard } from '@/store/flashcardStore'

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

export function useFlashcards(noteId: string) {
  const getFlashcardsByNoteId = useFlashcardStore((state) => state.getFlashcardsByNoteId)
  const removeFlashcard = useFlashcardStore((state) => state.removeFlashcard)

  // Get flashcards for the current note
  const flashcards: FlashcardData[] = getFlashcardsByNoteId(noteId).map((card: Flashcard) => ({
    cardId: card.id,
    questionText: card.questionText,
    answerText: card.answerText,
  }))

  // Keep the same interface for compatibility
  const refreshFlashcards = () => {
    // No-op since Zustand auto-updates
  }

  return { flashcards, refreshFlashcards, removeFlashcard }
}

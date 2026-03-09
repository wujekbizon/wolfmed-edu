import { useMemo } from 'react'
import { useFlashcardStore } from "@/store/useFlashcardStore"

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

export function useFlashcards(noteId: string) {
  const allFlashcards = useFlashcardStore((state) => state.flashcards)
  const removeFlashcard = useFlashcardStore((state) => state.removeFlashcard)

  const flashcards = useMemo(
    () =>
      allFlashcards
        .filter((card) => card.noteId === noteId)
        .map((card) => ({
          cardId: card.id,
          questionText: card.questionText,
          answerText: card.answerText,
        })),
    [allFlashcards, noteId]
  )

  return { flashcards, removeFlashcard }
}

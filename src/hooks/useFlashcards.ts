import { useMemo } from 'react'
import { useFlashcardStore } from "@/store/useFlashcardStore"

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

/**
 * Returns the flashcards belonging to a specific note and a handler to remove them.
 * Derives the filtered list in a single reduce pass to avoid an intermediate array.
 *
 * @param noteId ID of the note whose flashcards should be returned
 * @returns Flashcards for the given note and a removeFlashcard action
 */
export function useFlashcards(noteId: string) {
  const allFlashcards = useFlashcardStore((s) => s.flashcards)
  const removeFlashcard = useFlashcardStore((s) => s.removeFlashcard)

  const flashcards = useMemo(
    () =>
      allFlashcards.reduce<FlashcardData[]>((acc, card) => {
        if (card.noteId === noteId) {
          acc.push({ cardId: card.id, questionText: card.questionText, answerText: card.answerText })
        }
        return acc
      }, []),
    [allFlashcards, noteId],
  )

  return { flashcards, removeFlashcard }
}

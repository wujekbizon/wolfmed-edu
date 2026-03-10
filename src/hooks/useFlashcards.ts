import { useMemo } from 'react'
import { useFlashcardStore } from "@/store/useFlashcardStore"

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

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

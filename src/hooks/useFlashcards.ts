import { useFlashcardStore } from "@/store/useFlashcardStore"

export type FlashcardData = {
  cardId: string
  questionText: string
  answerText: string
}

export function useFlashcards(noteId: string) {
  const flashcards = useFlashcardStore((state) =>
    state.flashcards
      .filter((card) => card.noteId === noteId)
      .map((card) => ({
        cardId: card.id,
        questionText: card.questionText,
        answerText: card.answerText,
      }))
  )
  const removeFlashcard = useFlashcardStore((state) => state.removeFlashcard)

  return { flashcards, removeFlashcard }
}

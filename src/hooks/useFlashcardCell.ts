import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import { parseFlashcardContent } from '@/helpers/flashcardCellHelpers'

export function useFlashcardCell(cellId: string, initialContent: string) {
  const allFlashcards = useFlashcardStore((s) => s.flashcards)
  const updateFlashcard = useFlashcardStore((s) => s.updateFlashcard)
  const removeFlashcard = useFlashcardStore((s) => s.removeFlashcard)
  const addFlashcardsFromCell = useFlashcardStore((s) => s.addFlashcardsFromCell)

  const cards = useMemo(
    () => allFlashcards.filter((f) => f.noteId === cellId),
    [allFlashcards, cellId],
  )

  const initializedForRef = useRef<string | null>(null)

  useEffect(() => {
    if (initializedForRef.current === cellId) return
    initializedForRef.current = cellId

    const existing = useFlashcardStore.getState().flashcards.filter((f) => f.noteId === cellId)
    if (existing.length === 0) {
      const { flashcards, topic } = parseFlashcardContent(initialContent)
      if (flashcards.length > 0) {
        useFlashcardStore.getState().addFlashcardsFromCell(cellId, flashcards, topic)
      }
    }
  }, [cellId, initialContent])

  const topic = cards[0]?.topic ?? parseFlashcardContent(initialContent).topic

  const addCard = useCallback(
    (questionText: string, answerText: string) =>
      addFlashcardsFromCell(cellId, [{ questionText, answerText }], topic),
    [addFlashcardsFromCell, cellId, topic],
  )

  return { cards, topic, updateFlashcard, removeFlashcard, addCard }
}

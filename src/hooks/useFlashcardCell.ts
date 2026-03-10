import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import { parseFlashcardContent } from '@/helpers/flashcardCellHelpers'

/**
 * Manages flashcards tied to a single Lexical cell node.
 * Parses `initialContent` once on first mount (guarded by a ref) and seeds the
 * store only when no cards for the cell already exist, preventing duplicate imports
 * on re-renders or hot reloads.
 *
 * @param cellId     Unique identifier of the editor cell (used as noteId in the store)
 * @param initialContent Raw cell content to parse for embedded flashcard definitions
 * @returns Cards for the cell, their shared topic, and CRUD action handlers
 */
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

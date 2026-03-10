import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'

function parseContent(content: string): {
  flashcards: Array<{ questionText: string; answerText: string }>
  topic: string
} {
  try {
    const parsed = JSON.parse(content)
    const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : []
    return { flashcards, topic: parsed.topic ?? 'Fiszki' }
  } catch {
    return { flashcards: [], topic: 'Fiszki' }
  }
}

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
      const { flashcards, topic } = parseContent(initialContent)
      if (flashcards.length > 0) {
        useFlashcardStore.getState().addFlashcardsFromCell(cellId, flashcards, topic)
      }
    }
  }, [cellId, initialContent])

  const topic = cards[0]?.topic ?? parseContent(initialContent).topic

  const addCard = useCallback(
    (questionText: string, answerText: string) =>
      addFlashcardsFromCell(cellId, [{ questionText, answerText }], topic),
    [addFlashcardsFromCell, cellId, topic],
  )

  return { cards, topic, updateFlashcard, removeFlashcard, addCard }
}

import { useEffect, useRef } from 'react'
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
  const cards = useFlashcardStore((s) => s.flashcards.filter((f) => f.noteId === cellId))
  const { addFlashcardsFromCell, updateFlashcard, removeFlashcard } = useFlashcardStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const existing = useFlashcardStore.getState().flashcards.filter((f) => f.noteId === cellId)
    if (existing.length === 0) {
      const { flashcards, topic } = parseContent(initialContent)
      if (flashcards.length > 0) {
        addFlashcardsFromCell(cellId, flashcards, topic)
      }
    }
  }, [cellId])

  const topic = cards[0]?.topic ?? parseContent(initialContent).topic

  const addCard = (questionText: string, answerText: string) =>
    addFlashcardsFromCell(cellId, [{ questionText, answerText }], topic)

  return { cards, topic, updateFlashcard, removeFlashcard, addCard }
}

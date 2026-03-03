import { useMemo } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import type { FlashcardData } from '@/hooks/useFlashcards'

export type FlashcardGroup = {
  id: string
  name: string
  source: 'note' | 'cell'
  cards: FlashcardData[]
}

export function useFlashcardGroups(notes: { id: string; title: string }[]): {
  groups: FlashcardGroup[]
  hasAny: boolean
} {
  const flashcards = useFlashcardStore((s) => s.flashcards)

  const groups = useMemo<FlashcardGroup[]>(() => {
    const map = new Map<string, FlashcardGroup>()

    for (const card of flashcards) {
      const source = card.source ?? 'note'
      const groupKey = source === 'cell'
        ? `topic:${card.topic ?? 'AI Fiszki'}`
        : card.noteId

      if (!map.has(groupKey)) {
        const name = source === 'cell'
          ? (card.topic ?? 'AI Fiszki')
          : (notes.find((n) => n.id === card.noteId)?.title ?? 'Notatka')
        map.set(groupKey, { id: groupKey, name, source, cards: [] })
      }
      map.get(groupKey)!.cards.push({
        cardId: card.id,
        questionText: card.questionText,
        answerText: card.answerText,
      })
    }

    return Array.from(map.values())
  }, [flashcards, notes])

  return { groups, hasAny: flashcards.length > 0 }
}

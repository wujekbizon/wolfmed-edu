import { useMemo } from 'react'
import { useFlashcardStore } from '@/store/useFlashcardStore'
import type { FlashcardData } from '@/hooks/useFlashcards'

export type FlashcardGroup = {
  id: string
  name: string
  source: 'note' | 'cell'
  cards: FlashcardData[]
}

/**
 * Groups all store flashcards by their origin — either a named note or an AI-generated topic.
 * Builds a noteId→title map once per render to keep per-card lookups O(1).
 *
 * @param notes List of notes used to resolve group names for note-sourced flashcards
 * @returns Grouped flashcard data and a boolean indicating whether any cards exist
 */
export function useFlashcardGroups(notes: { id: string; title: string }[]): {
  groups: FlashcardGroup[]
  hasAny: boolean
} {
  const flashcards = useFlashcardStore((s) => s.flashcards)

  const groups = useMemo<FlashcardGroup[]>(() => {
    const notesById = new Map(notes.map((n) => [n.id, n.title]))
    const map = new Map<string, FlashcardGroup>()

    for (const card of flashcards) {
      const source = card.source ?? 'note'
      const groupKey = source === 'cell'
        ? `topic:${card.topic ?? 'AI Fiszki'}`
        : card.noteId

      if (!map.has(groupKey)) {
        const name = source === 'cell'
          ? (card.topic ?? 'AI Fiszki')
          : (notesById.get(card.noteId) ?? 'Notatka')
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
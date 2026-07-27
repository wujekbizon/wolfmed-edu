import { useQuery } from '@tanstack/react-query'
import { fetchNoteFlashcardDeckAction } from '@/actions/flashcardFetch'
import { flashcardNoteDeckKey, FLASHCARD_STALE_TIME } from '@/constants/flashcards'
import type { FlashcardDeck } from '@/types/flashcardTypes'

export function useNoteFlashcardDeck(noteId: string, initialDeck?: FlashcardDeck | null) {
  const { data: deck } = useQuery({
    queryKey: flashcardNoteDeckKey(noteId),
    queryFn: () => fetchNoteFlashcardDeckAction(noteId),
    initialData: initialDeck,
    staleTime: FLASHCARD_STALE_TIME,
  })

  return { deck: deck ?? null, cards: deck?.cards ?? [] }
}

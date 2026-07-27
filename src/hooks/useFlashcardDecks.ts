import { useQuery } from '@tanstack/react-query'
import { fetchFlashcardDecksAction } from '@/actions/flashcardFetch'
import { flashcardDecksKey, FLASHCARD_STALE_TIME } from '@/constants/flashcards'
import type { FlashcardDeck } from '@/types/flashcardTypes'

export function useFlashcardDecks(initialDecks: FlashcardDeck[]) {
  const { data } = useQuery({
    queryKey: flashcardDecksKey(),
    queryFn: () => fetchFlashcardDecksAction(),
    initialData: initialDecks,
    staleTime: FLASHCARD_STALE_TIME,
  })

  return data ?? initialDecks
}

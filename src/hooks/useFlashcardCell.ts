import { useQuery } from '@tanstack/react-query'
import { fetchFlashcardDeckAction } from '@/actions/flashcardFetch'
import { flashcardDeckKey, FLASHCARD_STALE_TIME } from '@/constants/flashcards'
import { parseFlashcardCellContent } from '@/helpers/parseFlashcardCellContent'

/**
 * Resolves the deck a flashcard cell points at.
 *
 * The cell stores only a deck id — the cards themselves live in the database, so every
 * device renders the same set and edits made on one show up on the others.
 */
export function useFlashcardCell(cellContent: string) {
  const deckId = parseFlashcardCellContent(cellContent)

  const { data: deck, isLoading, isSuccess } = useQuery({
    queryKey: flashcardDeckKey(deckId ?? ''),
    queryFn: () => fetchFlashcardDeckAction(deckId!),
    enabled: Boolean(deckId),
    staleTime: FLASHCARD_STALE_TIME,
  })

  return {
    deckId,
    deck: deck ?? null,
    cards: deck?.cards ?? [],
    topic: deck?.name ?? 'Fiszki',
    isLoading: Boolean(deckId) && isLoading,
    isMissing: isSuccess && deck === null,
  }
}

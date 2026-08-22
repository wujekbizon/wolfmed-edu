export const FLASHCARD_STALE_TIME = 5 * 60 * 1000

export const flashcardDecksKey = () => ['flashcardDecks'] as const

export const flashcardDeckKey = (deckId: string) => ['flashcardDeck', deckId] as const

export const flashcardNoteDeckKey = (noteId: string) => ['flashcardNoteDeck', noteId] as const

export const FLASHCARD_FILTERS = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'note', label: 'Notatki' },
  { value: 'ai', label: 'AI' },
] as const

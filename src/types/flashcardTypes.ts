export type FlashcardSource = 'ai' | 'manual' | 'note'

export type Flashcard = {
  id: string
  deckId: string
  questionText: string
  answerText: string
  position: number
}

export type FlashcardDeck = {
  id: string
  name: string
  sourceType: FlashcardSource
  sourceRef: string | null
  cards: Flashcard[]
}

export type FlashcardCellContent = {
  deckId: string
}

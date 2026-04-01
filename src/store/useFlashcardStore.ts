import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export type Flashcard = {
  id: string
  noteId: string
  questionText: string
  answerText: string
  createdAt: number
  source?: 'note' | 'cell'
  topic?: string
}

type FlashcardStore = {
  flashcards: Flashcard[]
  addFlashcard: (noteId: string, questionText: string, answerText: string) => void
  addFlashcardsFromCell: (cellId: string, cards: Array<{ questionText: string; answerText: string }>, topic: string) => void
  updateFlashcard: (id: string, questionText: string, answerText: string) => void
  removeFlashcard: (id: string) => void
  getFlashcardsByNoteId: (noteId: string) => Flashcard[]
  clearFlashcardsByNoteId: (noteId: string) => void
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      flashcards: [],

      addFlashcard: (noteId, questionText, answerText) => {
        const newFlashcard: Flashcard = {
          id: nanoid(),
          noteId,
          questionText,
          answerText,
          createdAt: Date.now(),
          source: 'note',
        }
        set((state) => ({ flashcards: [...state.flashcards, newFlashcard] }))
      },

      addFlashcardsFromCell: (cellId, cards, topic) => {
        const newCards: Flashcard[] = cards.map((card) => ({
          id: nanoid(),
          noteId: cellId,
          questionText: card.questionText,
          answerText: card.answerText,
          createdAt: Date.now(),
          source: 'cell' as const,
          topic,
        }))
        set((state) => ({ flashcards: [...state.flashcards, ...newCards] }))
      },

      updateFlashcard: (id, questionText, answerText) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? { ...card, questionText, answerText } : card
          ),
        }))
      },

      removeFlashcard: (id) => {
        set((state) => ({ flashcards: state.flashcards.filter((card) => card.id !== id) }))
      },

      getFlashcardsByNoteId: (noteId) => {
        return get().flashcards.filter((card) => card.noteId === noteId)
      },

      clearFlashcardsByNoteId: (noteId) => {
        set((state) => ({ flashcards: state.flashcards.filter((card) => card.noteId !== noteId) }))
      },
    }),
    {
      name: 'wolfmed-flashcards-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
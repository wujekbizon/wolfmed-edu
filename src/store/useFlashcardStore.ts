import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Flashcard = {
  id: string
  noteId: string
  questionText: string
  answerText: string
  createdAt: number
}

type FlashcardStore = {
  flashcards: Flashcard[]
  addFlashcard: (noteId: string, questionText: string, answerText: string) => void
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
          id: `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          noteId,
          questionText,
          answerText,
          createdAt: Date.now(),
        }
        set((state) => ({
          flashcards: [...state.flashcards, newFlashcard],
        }))
      },

      removeFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter((card) => card.id !== id),
        }))
      },

      getFlashcardsByNoteId: (noteId) => {
        return get().flashcards.filter((card) => card.noteId === noteId)
      },

      clearFlashcardsByNoteId: (noteId) => {
        set((state) => ({
          flashcards: state.flashcards.filter((card) => card.noteId !== noteId),
        }))
      },
    }),
    {
      name: 'wolfmed-flashcards-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

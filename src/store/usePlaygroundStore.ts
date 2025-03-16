import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TeachingPlayground, type Lecture, type User} from '@teaching-playground/core'

interface PlaygroundState {
  playground: TeachingPlayground | null
  selectedLecture: Lecture | null
  isCreateModalOpen: boolean
  error: string | null
  // Actions
  initializePlayground: (user: User) => void
  setSelectedLecture: (lecture: Lecture | null) => void
  setCreateModalOpen: (isOpen: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      playground: null,
      selectedLecture: null,
      isCreateModalOpen: false,
      error: null,

      initializePlayground: (user: User) => {
        const tp = new TeachingPlayground({
          roomConfig: {},
          commsConfig: {},
          eventConfig: {},
          dataConfig: {},
        })
        tp.setCurrentUser(user)
        set({ playground: tp })
      },

      setSelectedLecture: (lecture) => set({ selectedLecture: lecture }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          playground: null,
          selectedLecture: null,
          isCreateModalOpen: false,
          error: null,
        }),
    }),
    {
      name: 'playground-storage',
      partialize: (state) => ({
        // Only persist these fields
        selectedLecture: state.selectedLecture,
        isCreateModalOpen: state.isCreateModalOpen,
      }),
    }
  )
)

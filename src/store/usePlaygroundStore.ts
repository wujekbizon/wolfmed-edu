import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TeachingPlayground, type Lecture, type User} from '@teaching-playground/core'

interface PlaygroundState {
  playground: TeachingPlayground | null
  selectedLecture: Lecture | null
  isCreateModalOpen: boolean
  error: string | null
  username: string | null
  isAuthenticated: boolean
  user: User | null
  // Actions
  setPlayground: (playground: TeachingPlayground) => void
  setSelectedLecture: (lecture: Lecture | null) => void
  setCreateModalOpen: (isOpen: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  setUsername: (username: string) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setUser: (user: User | null) => void
  login: (username: string) => void
  logout: () => void
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      playground: null,
      selectedLecture: null,
      isCreateModalOpen: false,
      error: null,
      username: null,
      isAuthenticated: false,
      user: null,

      setPlayground: (playground: TeachingPlayground) => set({ playground }),
      setSelectedLecture: (lecture) => set({ selectedLecture: lecture }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setError: (error) => set({ error }),
      setUser: (user) => set({ user }),
      reset: () =>
        set({
          playground: null,
          selectedLecture: null,
          isCreateModalOpen: false,
          error: null,
          username: null,
          isAuthenticated: false,
          user: null,
        }),
      setUsername: (username: string) => set({ username }),
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      login: (username: string) => set({ username, isAuthenticated: true }),
      logout: () => set({ username: null, isAuthenticated: false, user: null }),
    }),
    {
      name: 'playground-storage',
      partialize: (state) => ({
        // Only persist these fields
        selectedLecture: state.selectedLecture,
        isCreateModalOpen: state.isCreateModalOpen,
        user: state.user,
      }),
    }
  )
)

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ForumSearchState {
  searchTerm: string
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  currentPage: number
  perPage: number
  setCurrentPage: (page: number) => void
  setPerPage: (perPage: number) => void
}

export const useForumSearchStore = create<ForumSearchState>()(
  persist(
    (set) => ({
      searchTerm: '',
      currentPage: 1,
      perPage: 10,
      setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
      clearSearchTerm: () => set({ searchTerm: '', currentPage: 1 }),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      setPerPage: (perPage: number) => set({ perPage }),
    }),
    {
      name: 'forumSearch-storage', // Name of the storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)

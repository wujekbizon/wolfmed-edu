import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type SortOption = 'newest' | 'oldest' | 'most_comments' | 'recent_activity'

interface ForumSearchState {
  searchTerm: string
  sortOption: SortOption
  setSearchTerm: (term: string) => void
  setSortOption: (sort: SortOption) => void
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
      sortOption: 'newest',
      currentPage: 1,
      perPage: 10,
      setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
      setSortOption: (sort: SortOption) => set({ sortOption: sort }),
      clearSearchTerm: () => set({ searchTerm: '', currentPage: 1 }),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      setPerPage: (perPage: number) => set({ perPage }),
    }),
    {
      name: 'forumSearch-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

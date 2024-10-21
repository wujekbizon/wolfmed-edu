import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface BlogSearchState {
  searchTerm: string
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  isExpanded: boolean
  toggleExpand: () => void
  currentPage: number
  perPage: number
  setCurrentPage: (page: number) => void
  setPerPage: (perPage: number) => void
}

export const useBlogSearchStore = create<BlogSearchState>()(
  persist(
    (set) => ({
      searchTerm: '',
      currentPage: 1,
      perPage: 6,
      setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
      clearSearchTerm: () => set({ searchTerm: '', currentPage: 1 }),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      setPerPage: (perPage: number) => set({ perPage }),
      isExpanded: false,
      toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
    }),
    {
      name: 'blogSearch-storage', // Name of the storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)

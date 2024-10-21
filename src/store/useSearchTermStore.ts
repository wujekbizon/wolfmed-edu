import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SearchTermState {
  searchTerm: string
  isExpanded: boolean
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  toggleExpand: () => void
  currentPage: number
  perPage: number
  setCurrentPage: (page: number) => void
  setPerPage: (perPage: number) => void
}

export const useSearchTermStore = create<SearchTermState>()(
  persist(
    (set) => ({
      searchTerm: '',
      isExpanded: false,
      currentPage: 1,
      perPage: 10,
      setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
      clearSearchTerm: () => set({ searchTerm: '', currentPage: 1 }),
      toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      setPerPage: (perPage: number) => set({ perPage }),
    }),
    {
      name: 'searchTerm-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

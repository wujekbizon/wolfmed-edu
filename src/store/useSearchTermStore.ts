import { create } from 'zustand'

interface SearchTermState {
  searchTerm: string
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  currentPage: number
  perPage: number
  setCurrentPage: (page: number) => void
  setPerPage: (perPage: number) => void
  resetPagination: () => void
}

export const useSearchTermStore = create<SearchTermState>()((set) => ({
  searchTerm: '',
  currentPage: 1,
  perPage: 20,
  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
  clearSearchTerm: () => set({ searchTerm: '', currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPerPage: (perPage) => set({ perPage }),
  resetPagination: () => set({ currentPage: 1 }),
}))

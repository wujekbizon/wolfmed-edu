import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ProblematicQuestionsState {
  searchTerm: string
  isExpanded: boolean
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  toggleExpand: () => void
  currentPage: number
  perPage: number
  setCurrentPage: (page: number) => void
}

export const useProblematicQuestionsStore = create<ProblematicQuestionsState>()(
  persist(
    (set) => ({
      searchTerm: '',
      isExpanded: false,
      currentPage: 1,
      perPage: 5,
      setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
      clearSearchTerm: () => set({ searchTerm: '', currentPage: 1 }),
      toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setCurrentPage: (page: number) => set({ currentPage: page }),
    }),
    {
      name: 'problematic-questions-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

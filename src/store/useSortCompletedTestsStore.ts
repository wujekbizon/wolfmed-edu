import { create } from 'zustand'

export type SortOption = 'dateAsc' | 'dateDesc' | 'scoreAsc' | 'scoreDesc'

interface SortStore {
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
}

export const useSortCompletedTestsStore = create<SortStore>((set) => ({
  sortOption: 'dateDesc',
  setSortOption: (option: SortOption) => set({ sortOption: option }),
}))

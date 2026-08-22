import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { limitPageBookmarks } from '@/helpers/limitPageBookmarks'

interface SearchTermState {
  searchTerm: string
  isExpanded: boolean
  perPage: number
  activeCategory: string | null
  pageByCategory: Record<string, number>
  openCategory: (category: string) => void
  setSearchTerm: (term: string) => void
  clearSearchTerm: () => void
  toggleExpand: () => void
  setCurrentPage: (page: number) => void
  setPerPage: (perPage: number) => void
}

// Re-inserting the key moves it to the end of the map, which is what lets the
// cap in limitPageBookmarks drop the least recently opened categories.
const rememberPage = (state: SearchTermState, page: number): Partial<SearchTermState> => {
  if (!state.activeCategory) return {}
  const { [state.activeCategory]: _previous, ...rest } = state.pageByCategory
  return { pageByCategory: limitPageBookmarks({ ...rest, [state.activeCategory]: page }) }
}

export const useSearchTermStore = create<SearchTermState>()(
  persist(
    (set) => ({
      searchTerm: '',
      isExpanded: false,
      perPage: 10,
      activeCategory: null,
      pageByCategory: {},
      openCategory: (category) =>
        set((state) =>
          state.activeCategory === category ? {} : { activeCategory: category, searchTerm: '' }
        ),
      setSearchTerm: (term) => set((state) => ({ searchTerm: term, ...rememberPage(state, 1) })),
      clearSearchTerm: () => set((state) => ({ searchTerm: '', ...rememberPage(state, 1) })),
      toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setCurrentPage: (page) => set((state) => rememberPage(state, page)),
      setPerPage: (perPage) => set({ perPage }),
    }),
    {
      name: 'searchTerm-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      // Bookmarks and display preferences outlive a session; the search term is
      // a filter and must not, or a stale one silently empties the list on the
      // next visit.
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        perPage: state.perPage,
        pageByCategory: state.pageByCategory,
      }),
      migrate: (persisted) => {
        const previous = (persisted ?? {}) as Partial<SearchTermState>
        return {
          isExpanded: previous.isExpanded ?? false,
          perPage: previous.perPage ?? 10,
          pageByCategory: previous.pageByCategory ?? {},
        }
      },
    }
  )
)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TopPanelState {
  isTopPanelOpen: boolean
  activeFeature: 'pinned' | null
  expandedNoteId: string | null
  setTopPanelOpen: (open: boolean) => void
  toggleTopPanel: () => void
  setActiveFeature: (feature: 'pinned' | null) => void
  setExpandedNote: (id: string | null) => void
  close: () => void
}

export const useTopPanelStore = create<TopPanelState>()(
  persist(
    (set) => ({
      isTopPanelOpen: true,
      activeFeature: null,
      expandedNoteId: null,
      setTopPanelOpen: (open) => set({ isTopPanelOpen: open }),
      toggleTopPanel: () => set((state) => ({ isTopPanelOpen: !state.isTopPanelOpen })),
      setActiveFeature: (feature) => set({ activeFeature: feature }),
      setExpandedNote: (id) => set({ expandedNoteId: id }),
      close: () => set({ activeFeature: null, expandedNoteId: null }),
    }),
    {
      name: 'top-panel-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

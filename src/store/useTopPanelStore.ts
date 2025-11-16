import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TopPanelState {
  activeFeature: 'pinned' | null
  expandedNoteId: string | null
  setActiveFeature: (feature: 'pinned' | null) => void
  setExpandedNote: (id: string | null) => void
  close: () => void
}

export const useTopPanelStore = create<TopPanelState>()(
  persist(
    (set) => ({
      activeFeature: null,
      expandedNoteId: null,
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

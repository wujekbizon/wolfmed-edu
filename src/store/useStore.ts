import { create } from 'zustand'

interface StateType {
  isMenuOpen: boolean
  isSidePanelOpen: boolean
  toggleMenu: () => void
  toggleSidePanel: () => void
}

export const useStore = create<StateType>((set) => ({
  isSidePanelOpen: false,
  isMenuOpen: false,
  toggleMenu: () => set((state: StateType) => ({ isMenuOpen: !state.isMenuOpen })),
  toggleSidePanel: () => set((state: StateType) => ({ isSidePanelOpen: !state.isSidePanelOpen })),
}))

import { create } from 'zustand'

interface StateType {
  isMenuOpen: boolean
  toggleMenu: () => void
}

export const useStore = create<StateType>((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state: StateType) => ({ isMenuOpen: !state.isMenuOpen })),
}))

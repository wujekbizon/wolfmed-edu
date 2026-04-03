import { create } from 'zustand'

interface SettingsModalState {
  isOpen: boolean
  openSettingsModal: () => void
  closeSettingsModal: () => void
}

export const useSettingsModalStore = create<SettingsModalState>((set) => ({
  isOpen: false,
  openSettingsModal: () => set({ isOpen: true }),
  closeSettingsModal: () => set({ isOpen: false }),
}))

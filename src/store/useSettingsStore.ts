import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsState {
  showMobileAI: boolean
  setShowMobileAI: (value: boolean) => void
  slashCommandsEnabled: boolean
  setSlashCommandsEnabled: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showMobileAI: true,
      setShowMobileAI: (value) => set({ showMobileAI: value }),
      slashCommandsEnabled: true,
      setSlashCommandsEnabled: (value) => set({ slashCommandsEnabled: value }),
    }),
    {
      name: 'wolfmed-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

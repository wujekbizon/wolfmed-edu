import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SettingsState } from '@/types/settingsTypes'

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      practiceCompanionHidden: {},
      setPracticeCompanionHidden: (userId, hidden) => set((state) => ({
        practiceCompanionHidden: { ...state.practiceCompanionHidden, [userId]: hidden },
      })),
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

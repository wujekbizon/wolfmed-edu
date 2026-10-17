import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsState {
  practiceDismissedSuggestions: Record<string, string[]>
  dismissPracticeSuggestion: (userId: string, key: string) => void
  practiceCompanionHidden: Record<string, boolean>
  setPracticeCompanionHidden: (userId: string, hidden: boolean) => void
  showMobileAI: boolean
  setShowMobileAI: (value: boolean) => void
  slashCommandsEnabled: boolean
  setSlashCommandsEnabled: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      practiceDismissedSuggestions: {},
      dismissPracticeSuggestion: (userId, key) => set((state) => ({
        practiceDismissedSuggestions: {
          ...state.practiceDismissedSuggestions,
          [userId]: [...(state.practiceDismissedSuggestions[userId] ?? []).filter((entry) => entry !== key), key].slice(-80),
        },
      })),
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

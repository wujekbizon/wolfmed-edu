export interface SettingsState {
  practiceCompanionHidden: Record<string, boolean>
  setPracticeCompanionHidden: (userId: string, hidden: boolean) => void
  showMobileAI: boolean
  setShowMobileAI: (value: boolean) => void
  slashCommandsEnabled: boolean
  setSlashCommandsEnabled: (value: boolean) => void
}

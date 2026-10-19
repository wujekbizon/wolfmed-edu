import type { ReactNode } from 'react'

export type NaukaTab = 'categories' | 'workspace' | 'library'
export type NaukaLibraryTab = 'notes' | 'flashcards' | 'materials' | 'lectures'
export type NaukaNavigationState = { active: NaukaTab; workspaceOpened: boolean }
export type NaukaWolfekNavigationProps = { onNavigate: (tab: NaukaTab) => void }
export type NaukaWelcomeProps = NaukaWolfekNavigationProps & { onMinimize: () => void }
export type NaukaWolfekQuestion = {
  id: NaukaTab
  prompt: string
  text: string
  actionLabel: string
}
export type NaukaWolfekQuestionsProps = {
  activeId: string | undefined
  onSelect: (id: string) => void
}
export type NaukaWolfekAnswerProps = NaukaWolfekNavigationProps & {
  question: NaukaWolfekQuestion
}
export type NaukaWolfekLauncherProps = { onOpen: () => void }
export type NaukaLibrarySections = {
  notes: ReactNode
  lectures: ReactNode
  flashcards: ReactNode
  materials: ReactNode
  isPremium: boolean
}

export type NaukaLibraryProps = NaukaLibrarySections & { active: string }

export type NaukaLayoutProps = {
  categories: ReactNode
  workspace: ReactNode
  library: NaukaLibrarySections
}

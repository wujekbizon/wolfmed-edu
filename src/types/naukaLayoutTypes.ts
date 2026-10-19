import type { ReactNode } from 'react'

export type NaukaTab = 'categories' | 'workspace' | 'library'
export type NaukaLibraryProps = {
  notes: ReactNode
  lectures: ReactNode
  flashcards: ReactNode
  materials: ReactNode
  isPremium: boolean
}

export type NaukaLayoutProps = {
  categories: ReactNode
  workspace: ReactNode
  library: ReactNode
}

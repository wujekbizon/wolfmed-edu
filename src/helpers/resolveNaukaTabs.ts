import type { NaukaLibraryTab, NaukaTab } from '@/types/naukaLayoutTypes'

export function resolveNaukaTabs(tab: string | null, library: string | null, isPremium: boolean) {
  const active: NaukaTab = tab === 'workspace' || tab === 'library' ? tab : 'categories'
  const libraryTab: NaukaLibraryTab = library === 'flashcards' || library === 'materials' || (library === 'lectures' && isPremium)
    ? library
    : 'notes'
  return { active, libraryTab }
}

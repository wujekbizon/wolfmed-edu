import { normalizeMemoryTerms } from './normalizeMemoryTerms'
import { getMemoryQueryWords } from './getMemoryQueryWords'

export function isMemoryOverviewQuery(query: string): boolean {
  const words = normalizeMemoryTerms(query)
  return words.some((word) => ['ogolnie', 'ogolny', 'calosciowo', 'wszystkie'].includes(word)) ||
    getMemoryQueryWords(query).length === 0
}

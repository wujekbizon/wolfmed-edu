import { compareDiagnozySection } from '@/helpers/compareDiagnozySection'
import type {
  DiagnozaListItem,
  DiagnozyBrowseCriteria,
} from '@/types/diagnozyTypes'

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics so 'lek' matches 'lęk'
}

function matchesSearch(item: DiagnozaListItem, query: string): boolean {
  const haystack = normalize(
    [
      item.section,
      item.title,
      item.definicjaSnippet,
      item.chapterTitle,
    ].join(' ')
  )
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

// Pure browse pipeline: filter by search/chapter/completion, then sort. Kept
// side-effect free so it is unit-testable and shared by server + client.
export function filterAndSortDiagnozy(
  items: DiagnozaListItem[],
  completedSlugs: string[],
  criteria: DiagnozyBrowseCriteria
): DiagnozaListItem[] {
  const done = new Set(completedSlugs)

  const filtered = items.filter((item) => {
    if (criteria.chapter && item.chapterNumber !== criteria.chapter) return false
    if (criteria.status === 'done' && !done.has(item.slug)) return false
    if (criteria.status === 'todo' && done.has(item.slug)) return false
    if (criteria.search.trim() && !matchesSearch(item, criteria.search)) return false
    return true
  })

  const bySection = (a: DiagnozaListItem, b: DiagnozaListItem) =>
    compareDiagnozySection(a.section, b.section)

  switch (criteria.sort) {
    case 'section-asc':
      return filtered.sort(bySection)
    case 'section-desc':
      return filtered.sort((a, b) => bySection(b, a))
    case 'title-asc':
      return filtered.sort((a, b) => a.title.localeCompare(b.title, 'pl'))
    case 'title-desc':
      return filtered.sort((a, b) => b.title.localeCompare(a.title, 'pl'))
    case 'todo-first':
      return filtered.sort((a, b) => {
        const aDone = done.has(a.slug) ? 1 : 0
        const bDone = done.has(b.slug) ? 1 : 0
        return aDone - bDone || bySection(a, b)
      })
    default:
      return filtered
  }
}

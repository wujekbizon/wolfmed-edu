import { compareDiagnozySection } from '@/helpers/compareDiagnozySection'
import { matchesSearchTerms } from '@/helpers/matchesSearchTerms'
import type {
  DiagnozaListItem,
  DiagnozyBrowseCriteria,
} from '@/types/diagnozyTypes'

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
    if (!matchesSearchTerms([
      item.section,
      item.title,
      item.definicjaSnippet,
      item.chapterTitle,
    ], criteria.search)) return false
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

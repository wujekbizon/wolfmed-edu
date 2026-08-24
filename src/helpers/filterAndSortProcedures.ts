import { matchesSearchTerms } from '@/helpers/matchesSearchTerms'
import type {
  ProcedureBrowseCriteria,
  ProcedureBrowseItem,
} from '@/types/procedureBrowseTypes'

export function filterAndSortProcedures<T extends ProcedureBrowseItem>(
  procedures: T[],
  criteria: ProcedureBrowseCriteria
): T[] {
  const filtered = procedures.filter((procedure) =>
    matchesSearchTerms(procedure.searchValues, criteria.search)
  )

  switch (criteria.sort) {
    case 'name-asc':
      return filtered.sort((a, b) => a.name.localeCompare(b.name, 'pl'))
    case 'name-desc':
      return filtered.sort((a, b) => b.name.localeCompare(a.name, 'pl'))
    default:
      return filtered
  }
}

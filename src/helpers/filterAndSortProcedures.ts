import { matchesSearchTerms } from '@/helpers/matchesSearchTerms'
import { getProcedureSearchValues } from '@/helpers/getProcedureSearchValues'
import type {
  ProcedureBrowseCriteria,
  ProcedureBrowseItem,
} from '@/types/procedureBrowseTypes'

export function filterAndSortProcedures<T extends ProcedureBrowseItem>(
  procedures: T[],
  criteria: ProcedureBrowseCriteria
): T[] {
  const filtered = procedures.filter((procedure) =>
    matchesSearchTerms(getProcedureSearchValues(procedure), criteria.search)
  )

  switch (criteria.sort) {
    case 'name-asc':
      return filtered.sort((a, b) => a.data.name.localeCompare(b.data.name, 'pl'))
    case 'name-desc':
      return filtered.sort((a, b) => b.data.name.localeCompare(a.data.name, 'pl'))
    default:
      return filtered
  }
}

import { normalizeSearchText } from '@/helpers/normalizeSearchText'

export function matchesSearchTerms(
  values: Array<string | null | undefined>,
  query: string
): boolean {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean)
  const searchable = normalizeSearchText(values.filter(Boolean).join(' '))

  return terms.every((term) => searchable.includes(term))
}

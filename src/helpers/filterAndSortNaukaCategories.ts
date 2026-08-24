import { CUSTOM_CATEGORIES_FILTER } from '@/constants/naukaCategoriesBrowse'
import { matchesSearchTerms } from '@/helpers/matchesSearchTerms'
import type {
  NaukaCategoryBrowseCriteria,
  PopulatedCategories,
} from '@/types/categoryType'

export function filterAndSortNaukaCategories(
  categories: PopulatedCategories[],
  criteria: NaukaCategoryBrowseCriteria
): PopulatedCategories[] {
  const filtered = categories.filter((item) => {
    if (criteria.course === CUSTOM_CATEGORIES_FILTER && item.data) return false
    if (criteria.course && criteria.course !== CUSTOM_CATEGORIES_FILTER) {
      if (item.data?.course !== criteria.course) return false
    }

    return matchesSearchTerms([
      item.category,
      item.value,
      item.data?.title,
      item.data?.description,
      item.data?.course,
      ...(item.data?.keywords ?? []),
    ], criteria.search)
  })

  switch (criteria.sort) {
    case 'name-asc':
      return filtered.sort((a, b) => a.category.localeCompare(b.category, 'pl'))
    case 'name-desc':
      return filtered.sort((a, b) => b.category.localeCompare(a.category, 'pl'))
    case 'questions-desc':
      return filtered.sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'pl'))
    case 'questions-asc':
      return filtered.sort((a, b) => a.count - b.count || a.category.localeCompare(b.category, 'pl'))
    default:
      return filtered
  }
}

import { CATEGORY_METADATA, DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { formatCategoryName } from '@/helpers/formatCategoryName'
import type { PopulatedCategories, TestCategorySummary } from '@/types/categoryType'

export function populateTestCategories(rows: TestCategorySummary[]): PopulatedCategories[] {
  const seen = new Set<string>()
  const ordered = [...rows].sort((left, right) =>
    Number(Boolean(CATEGORY_METADATA[right.category])) - Number(Boolean(CATEGORY_METADATA[left.category])))
  return ordered.filter((row) => {
    const normalized = row.category.toLowerCase()
    if (seen.has(normalized)) return false
    seen.add(normalized)
    return true
  }).map((row) => ({
    category: formatCategoryName(row.category),
    value: row.category,
    count: row.count,
    data: CATEGORY_METADATA[row.category]
      || { ...DEFAULT_CATEGORY_METADATA, category: row.category, course: row.course || '' },
  }))
}

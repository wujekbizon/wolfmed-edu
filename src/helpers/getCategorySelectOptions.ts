import type { PopulatedCategories } from '@/types/categoryType'
import type { SelectOption } from '@/types/uiTypes'

// PopulatedCategories carries both a slug (`value`) and a display name
// (`category`); which one is shown depends on the picker.
export function getCategorySelectOptions(
  categories: PopulatedCategories[],
  label: 'value' | 'category' = 'category'
): SelectOption[] {
  return categories.map((item) => ({ value: item.value, label: item[label] }))
}

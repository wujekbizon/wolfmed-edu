import 'server-only'
import { DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'
import type {
  NaukaCategoryBrowseItem,
  PopulatedCategories,
} from '@/types/categoryType'

export function toNaukaCategoryBrowseItems(
  categories: PopulatedCategories[]
): NaukaCategoryBrowseItem[] {
  return categories.map((item) => {
    const metadata = item.data ?? DEFAULT_CATEGORY_METADATA

    return {
      category: item.category,
      value: item.value,
      count: item.count,
      course: metadata.course,
      title: metadata.title ?? '',
      description: metadata.description,
      image: metadata.image,
      keywords: metadata.keywords ?? [],
      isCustom: !item.data,
    }
  })
}

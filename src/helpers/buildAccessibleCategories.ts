import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { hasAccessToTier } from '@/helpers/accessTiers'
import type { PopulatedCategories } from '@/types/categoryType'

export async function buildAccessibleCategories(
  categories: PopulatedCategories[]
): Promise<PopulatedCategories[]> {
  const withAccess = await Promise.all(
    categories.map(async (cat) => {
      const metadata = CATEGORY_METADATA[cat.value]
      if (!metadata?.course) return { ...cat, hasAccess: true }

      const courseAccess = await checkCourseAccessAction(metadata.course)
      if (!courseAccess.hasAccess) return { ...cat, hasAccess: false }

      return {
        ...cat,
        hasAccess: hasAccessToTier(courseAccess.accessTier || 'free', metadata.requiredTier),
      }
    })
  )

  return withAccess.filter((cat) => cat.hasAccess)
}

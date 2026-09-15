import 'server-only'

import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { hasAccessToTier } from '@/helpers/accessTiers'
import { getUserEnrollments } from '@/server/queries'
import type { AccessTier } from '@/types/categoryType'
import type { EnrollmentGrant } from '@/types/entitlementTypes'

export type CategoryAccess = {
  hasCourse: boolean
  hasAccess: boolean
  userTier: AccessTier
  requiredTier: AccessTier
}

export async function getCategoryAccess(
  userId: string,
  category: string
): Promise<CategoryAccess> {
  const metadata = CATEGORY_METADATA[category]
  const requiredTier = metadata?.requiredTier ?? 'free'

  if (!metadata?.course) {
    return { hasCourse: true, hasAccess: true, userTier: 'free', requiredTier }
  }

  const enrollment = (await getUserEnrollments(userId)).find(
    (item: EnrollmentGrant) => item.courseSlug === metadata.course
  )
  const userTier = (enrollment?.accessTier ?? 'free') as AccessTier

  return {
    hasCourse: Boolean(enrollment),
    hasAccess: Boolean(enrollment) && hasAccessToTier(userTier, requiredTier),
    userTier,
    requiredTier,
  }
}

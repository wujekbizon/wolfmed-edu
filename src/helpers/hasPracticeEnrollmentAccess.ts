import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { hasAccessToTier } from '@/helpers/accessTiers'
import type { EnrollmentGrant } from '@/types/paymentTypes'

export function hasPracticeEnrollmentAccess(
  category: string,
  enrollments: Pick<EnrollmentGrant, 'courseSlug' | 'accessTier'>[]
) {
  if (category.startsWith('moje-testy__')) {
    return enrollments.some((enrollment) =>
      ['opiekun-medyczny', 'pielegniarstwo', 'angielski-medyczny'].includes(enrollment.courseSlug)
      && hasAccessToTier(enrollment.accessTier, 'premium'))
  }
  const metadata = CATEGORY_METADATA[category]
  return Boolean(metadata?.course && enrollments.some((enrollment) =>
    enrollment.courseSlug === metadata.course
    && hasAccessToTier(enrollment.accessTier, metadata.requiredTier)))
}

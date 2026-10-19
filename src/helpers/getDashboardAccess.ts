import { hasAccessToTier } from '@/helpers/accessTiers'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { DashboardEnrollments } from '@/types/dashboardDiscoveryTypes'

export function getDashboardAccess(enrollments: Pick<DashboardEnrollments[number], 'isActive' | 'courseSlug' | 'accessTier'>[]) {
  const activeEnrollments = enrollments.filter((enrollment) => enrollment.isActive)
  const accessibleCourses = new Set(activeEnrollments
    .filter((enrollment) => hasAccessToTier(enrollment.accessTier, 'basic'))
    .map((enrollment) => enrollment.courseSlug))
  const hasPremium = activeEnrollments.some((enrollment) => hasAccessToTier(enrollment.accessTier, 'premium'))
  const upgradeCourse = activeEnrollments.find((enrollment) =>
    enrollment.courseSlug !== 'angielski-medyczny' && accessibleCourses.has(enrollment.courseSlug)
  )
  const upgradeHref = upgradeCourse ? `/kierunki/${upgradeCourse.courseSlug}#${PRICING_ANCHOR}` : '/kierunki'

  return { accessibleCourses, hasPremium, upgradeHref }
}

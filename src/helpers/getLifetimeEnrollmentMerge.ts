import { TIER_HIERARCHY } from '@/helpers/accessTiers'
import type { AccessTier } from '@/types/categoryType'
import type {
  LifetimeEnrollmentCandidate,
  LifetimeEnrollmentMerge,
} from '@/types/paymentTypes'

export function getLifetimeEnrollmentMerge(
  enrollments: LifetimeEnrollmentCandidate[],
  purchasedTier: AccessTier
): LifetimeEnrollmentMerge {
  const ranked = [...enrollments].sort((left, right) => (
    (TIER_HIERARCHY[right.accessTier as AccessTier] ?? 0) -
    (TIER_HIERARCHY[left.accessTier as AccessTier] ?? 0)
  ))
  const canonical = ranked[0]
  const currentLevel = canonical
    ? TIER_HIERARCHY[canonical.accessTier as AccessTier] ?? 0
    : -1

  return {
    canonicalId: canonical?.id ?? null,
    staleIds: ranked.slice(1).map((enrollment) => enrollment.id),
    shouldApplyPurchase: TIER_HIERARCHY[purchasedTier] >= currentLevel,
  }
}

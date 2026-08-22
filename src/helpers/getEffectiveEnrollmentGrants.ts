import { TIER_HIERARCHY } from '@/helpers/accessTiers'
import type { AccessTier } from '@/types/categoryType'
import type { EnrollmentGrant } from '@/types/paymentTypes'

export function getEffectiveEnrollmentGrants<T extends EnrollmentGrant>(
  grants: T[],
  now = new Date()
): T[] {
  const effective = new Map<string, T>()

  for (const grant of grants) {
    const startsAt = grant.startsAt ?? grant.enrolledAt
    const startsInFuture = grant.sourceType !== 'subscription' && startsAt > now
    if (
      !grant.isActive ||
      grant.revokedAt ||
      startsInFuture ||
      (grant.expiresAt && grant.expiresAt <= now)
    ) continue

    const current = effective.get(grant.courseSlug)
    const level = TIER_HIERARCHY[grant.accessTier as AccessTier] ?? 0
    const currentLevel = current
      ? TIER_HIERARCHY[current.accessTier as AccessTier] ?? 0
      : -1

    if (!current || level > currentLevel) effective.set(grant.courseSlug, grant)
  }

  return [...effective.values()]
}

import { LIFETIME_UPGRADE_OFFER_BY_COURSE, PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { hasAccessToTier } from '@/helpers/accessTiers'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import type {
  LifetimeUpgradeGrant,
  LifetimeUpgradeOfferKey,
  PaymentOffer,
} from '@/types/paymentTypes'

export function getEligibleLifetimeUpgradeOfferKey(
  grants: LifetimeUpgradeGrant[],
  courseSlug: PaymentOffer['courseSlug'],
  now = new Date()
): LifetimeUpgradeOfferKey | null {
  const effective = getEffectiveEnrollmentGrants(grants, now)
    .find((grant) => grant.courseSlug === courseSlug)
  if (effective && hasAccessToTier(effective.accessTier, 'premium')) return null

  const eligible = grants.some((grant) => {
    const startsAt = grant.startsAt ?? grant.enrolledAt
    return (
      grant.courseSlug === courseSlug &&
      grant.accessTier === 'basic' &&
      grant.isActive &&
      !grant.revokedAt &&
      startsAt <= now &&
      (!grant.expiresAt || grant.expiresAt > now) &&
      (grant.sourceType === 'legacy_lifetime' ||
        grant.sourceType === 'lifetime_purchase')
    )
  })

  const offerKey = LIFETIME_UPGRADE_OFFER_BY_COURSE[courseSlug]
  return eligible && PAYMENT_OFFERS[offerKey].available ? offerKey : null
}

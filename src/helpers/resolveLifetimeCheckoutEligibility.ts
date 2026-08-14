import { hasAccessToTier } from '@/helpers/accessTiers'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { getEligibleLifetimeUpgradeOfferKey } from '@/helpers/getEligibleLifetimeUpgradeOfferKey'
import type {
  LifetimeCheckoutEligibility,
  LifetimeUpgradeGrant,
  PaymentOffer,
} from '@/types/paymentTypes'

export function resolveLifetimeCheckoutEligibility(
  grants: LifetimeUpgradeGrant[],
  offer: PaymentOffer
): LifetimeCheckoutEligibility {
  const now = new Date()
  const activeSubscription = getEffectiveEnrollmentGrants(
    grants.filter((grant) => grant.sourceType === 'subscription'),
    now
  ).some((grant) => grant.courseSlug === offer.courseSlug)
  if (activeSubscription) return 'NOT_ELIGIBLE'

  const owned = getEffectiveEnrollmentGrants(grants, now)
    .find((grant) => grant.courseSlug === offer.courseSlug)
  if (owned && hasAccessToTier(owned.accessTier, offer.accessTier)) {
    return 'ALREADY_OWNED'
  }

  const upgradeOfferKey = getEligibleLifetimeUpgradeOfferKey(
    grants,
    offer.courseSlug,
    now
  )
  if (offer.entitlementSourceType === 'lifetime_upgrade') {
    return upgradeOfferKey === offer.key ? 'ALLOWED' : 'NOT_ELIGIBLE'
  }
  if (offer.accessTier === 'premium' && upgradeOfferKey) {
    return 'UPGRADE_REQUIRED'
  }

  return 'ALLOWED'
}

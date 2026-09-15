import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { hasAccessToTier } from '@/helpers/accessTiers'
import type {
  LifetimeUpgradeGrant,
  PaymentOffer,
  SubscriptionCheckoutEligibility,
} from '@/types/paymentTypes'

export function resolveSubscriptionCheckoutEligibility(
  grants: LifetimeUpgradeGrant[],
  offer: PaymentOffer
): SubscriptionCheckoutEligibility {
  const enrollment = getEffectiveEnrollmentGrants(grants)
    .find((grant) => grant.courseSlug === offer.courseSlug)

  if (!enrollment) return 'ALLOWED'
  return hasAccessToTier(enrollment.accessTier, offer.accessTier)
    ? 'ALREADY_OWNED'
    : 'ALLOWED'
}

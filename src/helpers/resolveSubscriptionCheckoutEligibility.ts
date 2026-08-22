import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import type {
  LifetimeUpgradeGrant,
  PaymentOffer,
  SubscriptionCheckoutEligibility,
} from '@/types/paymentTypes'

export function resolveSubscriptionCheckoutEligibility(
  grants: LifetimeUpgradeGrant[],
  offer: PaymentOffer
): SubscriptionCheckoutEligibility {
  const ownsCourse = getEffectiveEnrollmentGrants(grants)
    .some((grant) => grant.courseSlug === offer.courseSlug)

  return ownsCourse ? 'ALREADY_OWNED' : 'ALLOWED'
}

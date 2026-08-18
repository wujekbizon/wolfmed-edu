import { resolveLifetimeCheckoutEligibility } from '@/helpers/resolveLifetimeCheckoutEligibility'
import { resolveSubscriptionCheckoutEligibility } from '@/helpers/resolveSubscriptionCheckoutEligibility'
import type {
  LifetimeUpgradeGrant,
  PaymentOffer,
  PricingOfferStatus,
  SubscriptionPlanChange,
} from '@/types/paymentTypes'

export function getPricingOfferStatus(
  grants: LifetimeUpgradeGrant[],
  offer: PaymentOffer,
  activeSubscription: LifetimeUpgradeGrant | undefined,
  portalConfigured: boolean,
  planChange: SubscriptionPlanChange | null = null
): PricingOfferStatus {
  if (activeSubscription) {
    if (offer.purchaseModel === 'lifetime') return 'active_subscription'
    if (offer.accessTier === activeSubscription.accessTier) {
      return 'current_subscription'
    }
    if (activeSubscription.accessTier === 'premium') {
      if (planChange?.targetOfferKey === offer.key) return 'scheduled_downgrade'
      return 'downgrade_available'
    }
    return portalConfigured ? 'portal_upgrade' : 'portal_upgrade_unavailable'
  }

  const eligibility = offer.purchaseModel === 'subscription'
    ? resolveSubscriptionCheckoutEligibility(grants, offer)
    : resolveLifetimeCheckoutEligibility(grants, offer)
  if (eligibility === 'ALLOWED') return 'available'
  if (eligibility === 'ALREADY_OWNED') {
    return offer.purchaseModel === 'subscription'
      ? 'lifetime_access'
      : 'owned_lifetime'
  }
  if (eligibility === 'UPGRADE_REQUIRED') return 'unavailable'
  return 'existing_access'
}

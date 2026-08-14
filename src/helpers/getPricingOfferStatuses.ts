import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { getPricingOfferStatus } from '@/helpers/getPricingOfferStatus'
import type {
  LifetimeUpgradeGrant,
  PaymentOffer,
  PricingOfferStatusMap,
} from '@/types/paymentTypes'

export function getPricingOfferStatuses(
  grants: LifetimeUpgradeGrant[],
  courseSlug: PaymentOffer['courseSlug'],
  portalConfigured: boolean
): PricingOfferStatusMap {
  const activeSubscription = getEffectiveEnrollmentGrants(
    grants.filter((grant) => grant.sourceType === 'subscription')
  ).find((grant) => grant.courseSlug === courseSlug)

  return Object.fromEntries(
    Object.values(PAYMENT_OFFERS)
      .filter((offer) => offer.courseSlug === courseSlug)
      .map((offer) => [
        offer.key,
        getPricingOfferStatus(grants, offer, activeSubscription, portalConfigured),
      ])
  ) as PricingOfferStatusMap
}

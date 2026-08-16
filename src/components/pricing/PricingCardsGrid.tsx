'use client'

import { useState } from 'react'
import CoursePricingCard from '@/components/CoursePricingCard'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { MONTHLY_OFFER_BY_COURSE_TIER } from '@/constants/monthlyOfferByCourseTier'
import { formatPlnAmount } from '@/helpers/formatPlnAmount'
import PurchaseModelSelector from '@/components/pricing/PurchaseModelSelector'
import PricingAvailabilityNotice from '@/components/pricing/PricingAvailabilityNotice'
import type { PathData } from '@/types/careerPathsTypes'
import type {
  CheckoutPurchaseModel,
  LifetimeUpgradeOfferKey,
  PricingOfferStatusMap,
  SubscriptionPlanChange,
} from '@/types/paymentTypes'

type Pricing = NonNullable<PathData['pricing']>

export default function PricingCardsGrid({
  pricing,
  offerStatuses,
  eligibleLifetimeUpgradeOfferKey,
  subscriptionPlanChange,
}: {
  pricing: Pricing
  offerStatuses: PricingOfferStatusMap
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null
  subscriptionPlanChange: SubscriptionPlanChange | null
}) {
  const [purchaseModel, setPurchaseModel] = useState<CheckoutPurchaseModel>('subscription')
  const upgradeOffer = eligibleLifetimeUpgradeOfferKey
    ? PAYMENT_OFFERS[eligibleLifetimeUpgradeOfferKey]
    : null

  return (
    <>
      <PurchaseModelSelector value={purchaseModel} onChange={setPurchaseModel} />
      <PricingAvailabilityNotice
        purchaseModel={purchaseModel}
        offerStatuses={offerStatuses}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
      {Object.entries(pricing)
        .filter(([key]) => key !== 'courseSlug')
        .map(([tierName, tierData]) => {
          const tier = tierData as Pricing['basic']
          const isPremium = tierName.toLowerCase().includes('premium')
          const accessTier = isPremium ? 'premium' : 'basic'
          const monthlyOffer = PAYMENT_OFFERS[
            MONTHLY_OFFER_BY_COURSE_TIER[pricing.courseSlug][accessTier]
          ]
          const usesUpgradeOffer = purchaseModel === 'lifetime' &&
            isPremium && upgradeOffer?.courseSlug === pricing.courseSlug
          const selectedOffer = purchaseModel === 'subscription'
            ? monthlyOffer
            : usesUpgradeOffer ? upgradeOffer : PAYMENT_OFFERS[tier.offerKey]
          const offerStatus = offerStatuses[selectedOffer.key] ?? 'unavailable'

          return (
            <CoursePricingCard
              key={`${tierName}-${selectedOffer.key}-${offerStatus}`}
              tierName={tierName}
              price={`${formatPlnAmount(selectedOffer.amount)}${
                purchaseModel === 'subscription' ? ' / mies.' : ''
              }`}
              {...(usesUpgradeOffer ? { originalPrice: tier.price } : {})}
              offerKey={selectedOffer.key}
              features={tier.features}
              isPremium={isPremium}
              offerStatus={offerStatus}
              subscriptionPlanChange={subscriptionPlanChange}
              {...(usesUpgradeOffer
                ? { badge: 'Dopłata do Premium', purchaseLabel: 'Ulepsz do Premium' }
                : tier.badge ? { badge: tier.badge } : {})}
            />
          )
        })}
      </div>
    </>
  )
}

import CoursePricingCard from '@/components/CoursePricingCard'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { formatPlnAmount } from '@/helpers/formatPlnAmount'
import type { PathData } from '@/types/careerPathsTypes'
import type { LifetimeUpgradeOfferKey } from '@/types/paymentTypes'

type Pricing = NonNullable<PathData['pricing']>

export default function PricingCardsGrid({
  pricing,
  ownedCourses,
  eligibleLifetimeUpgradeOfferKey,
}: {
  pricing: Pricing
  ownedCourses: string[]
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null
}) {
  const upgradeOffer = eligibleLifetimeUpgradeOfferKey
    ? PAYMENT_OFFERS[eligibleLifetimeUpgradeOfferKey]
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
      {Object.entries(pricing)
        .filter(([key]) => key !== 'courseSlug')
        .map(([tierName, tierData]) => {
          const tier = tierData as Pricing['basic']
          const isPremium = tierName.toLowerCase().includes('premium')
          const usesUpgradeOffer = isPremium && upgradeOffer?.courseSlug === pricing.courseSlug

          return (
            <CoursePricingCard
              key={tierName}
              tierName={tierName}
              price={usesUpgradeOffer ? formatPlnAmount(upgradeOffer.amount) : tier.price}
              {...(usesUpgradeOffer ? { originalPrice: tier.price } : {})}
              offerKey={usesUpgradeOffer ? upgradeOffer.key : tier.offerKey}
              features={tier.features}
              isPremium={isPremium}
              {...(usesUpgradeOffer
                ? { badge: 'Dopłata do Premium', purchaseLabel: 'Ulepsz do Premium' }
                : tier.badge ? { badge: tier.badge } : {})}
              alreadyOwned={
                ownedCourses.includes(
                  `${pricing.courseSlug}-${isPremium ? 'premium' : 'basic'}`
                ) ||
                (!isPremium && ownedCourses.includes(`${pricing.courseSlug}-premium`))
              }
            />
          )
        })}
    </div>
  )
}

import CoursePricingCard from '@/components/CoursePricingCard'
import type { PathData } from '@/types/careerPathsTypes'

type Pricing = NonNullable<PathData['pricing']>

export default function PricingCardsGrid({
  pricing,
  ownedCourses,
}: {
  pricing: Pricing
  ownedCourses: string[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
      {Object.entries(pricing)
        .filter(([key]) => key !== 'courseSlug')
        .map(([tierName, tierData]) => {
          const tier = tierData as Pricing['basic']
          const isPremium = tierName.toLowerCase().includes('premium')

          return (
            <CoursePricingCard
              key={tierName}
              tierName={tierName}
              price={tier.price}
              priceId={tier.priceId}
              courseSlug={pricing.courseSlug}
              accessTier={tier.accessTier}
              features={tier.features}
              isPremium={isPremium}
              {...(tier.badge ? { badge: tier.badge } : {})}
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

import HeroButton from '@/components/HeroButton'
import CourseCheckoutButton from '@/components/path/CourseCheckoutButton'
import { MONTHLY_OFFER_BY_COURSE_TIER } from '@/constants/monthlyOfferByCourseTier'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { CourseHeroActionProps } from '@/types/paymentTypes'

export default function CourseHeroAction({
  courseSlug,
  offerStatuses,
  eligibleLifetimeUpgradeOfferKey,
}: CourseHeroActionProps) {
  const monthlyOffers = MONTHLY_OFFER_BY_COURSE_TIER[courseSlug]
  const basicStatus = offerStatuses[monthlyOffers.basic]
  const premiumStatus = offerStatuses[monthlyOffers.premium]
  if (premiumStatus === 'portal_upgrade') {
    return (
      <CourseCheckoutButton
        offerKey={monthlyOffers.premium}
        offerStatus="portal_upgrade"
        label="Odblokuj AI w Premium"
      />
    )
  }

  const hasActiveSubscription = basicStatus === 'current_subscription' ||
    premiumStatus === 'current_subscription'
  if (eligibleLifetimeUpgradeOfferKey && !hasActiveSubscription) {
    return (
      <CourseCheckoutButton
        offerKey={eligibleLifetimeUpgradeOfferKey}
        label="Odblokuj AI w Premium"
      />
    )
  }

  const hasAccess = hasActiveSubscription ||
    basicStatus === 'lifetime_access'

  return (
    <HeroButton
      link={hasAccess ? '/panel/nauka' : `#${PRICING_ANCHOR}`}
      className="w-full max-w-xs"
    >
      {hasAccess ? 'Przejdź do nauki' : 'Wybierz plan'}
    </HeroButton>
  )
}

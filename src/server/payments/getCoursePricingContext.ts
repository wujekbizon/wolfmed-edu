import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE } from '@/constants/stripePortalConfigurations'
import { getEligibleLifetimeUpgradeOfferKey } from '@/helpers/getEligibleLifetimeUpgradeOfferKey'
import { getPricingOfferStatuses } from '@/helpers/getPricingOfferStatuses'
import { getSubscriptionPlanChange } from '@/server/payments/getSubscriptionPlanChange'
import { getUserEnrollmentGrants } from '@/server/queries'
import type { PaymentOffer } from '@/types/paymentTypes'

export async function getCoursePricingContext(
  courseSlug: PaymentOffer['courseSlug']
) {
  const { userId } = await auth()
  const [grants, planChange] = userId
    ? await Promise.all([
        getUserEnrollmentGrants(userId),
        getSubscriptionPlanChange(userId, courseSlug),
      ])
    : [[], null]
  const portalConfigured = Boolean(process.env[
    STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE[courseSlug]
  ])

  return {
    eligibleLifetimeUpgradeOfferKey: getEligibleLifetimeUpgradeOfferKey(grants, courseSlug),
    pricingOfferStatuses: getPricingOfferStatuses(
      grants,
      courseSlug,
      portalConfigured,
      planChange
    ),
    subscriptionPlanChange: planChange,
  }
}

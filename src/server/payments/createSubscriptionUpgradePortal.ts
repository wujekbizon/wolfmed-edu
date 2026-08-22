import 'server-only'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import { STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE } from '@/constants/stripePortalConfigurations'
import { isPortalSubscriptionUpgradeConfigured } from '@/helpers/isPortalSubscriptionUpgradeConfigured'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import { isSubscriptionUpgrade } from '@/helpers/isSubscriptionUpgrade'
import stripe from '@/lib/stripeClient'
import { getActiveCourseSubscription } from '@/server/payments/getActiveCourseSubscription'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { releaseCompletedSubscriptionDowngrade } from '@/server/payments/releaseCompletedSubscriptionDowngrade'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'
import type { PaymentOfferKey } from '@/types/paymentTypes'

export async function createSubscriptionUpgradePortal(
  userId: string,
  targetOfferKey: PaymentOfferKey
): Promise<string | null> {
  const targetOffer = PAYMENT_OFFERS[targetOfferKey]
  if (targetOffer.purchaseModel !== 'subscription' || targetOffer.accessTier !== 'premium') {
    return null
  }

  const local = await getActiveCourseSubscription(userId, targetOffer.courseSlug)
  if (!local) return null

  let snapshot = await getSubscriptionSnapshot(local.subscriptionId)
  const [currentOffer, verifiedTarget] = await Promise.all([
    getVerifiedSubscriptionOffer(snapshot.priceId),
    getVerifiedStripeOffer(targetOfferKey),
  ])
  if (
    !isSubscriptionAccessActive(snapshot) ||
    snapshot.customerId !== local.customerId ||
    !isSubscriptionUpgrade(currentOffer, verifiedTarget)
  ) return null
  if (snapshot.scheduleId) {
    const released = await releaseCompletedSubscriptionDowngrade(snapshot, currentOffer)
    if (!released) return null
    snapshot = await getSubscriptionSnapshot(snapshot.id)
    if (
      snapshot.scheduleId ||
      snapshot.priceId !== currentOffer.priceId ||
      !isSubscriptionAccessActive(snapshot)
    ) return null
  }

  const configurationEnv = STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE[targetOffer.courseSlug]
  const configuration = process.env[configurationEnv]
  if (!configuration) throw new Error(`Missing Stripe Portal configuration: ${configurationEnv}`)
  const portalConfiguration = await stripe.billingPortal.configurations.retrieve(configuration, {
    expand: ['features.subscription_update.products'],
  })
  if (!isPortalSubscriptionUpgradeConfigured(
    portalConfiguration,
    currentOffer.productId,
    currentOffer.priceId,
    verifiedTarget.productId,
    verifiedTarget.priceId
  )) return null

  const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/kierunki/${targetOffer.courseSlug}#${PRICING_ANCHOR}`
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?subscription_id=${encodeURIComponent(snapshot.id)}`
  const session = await stripe.billingPortal.sessions.create({
    configuration,
    customer: snapshot.customerId,
    locale: 'pl',
    return_url: courseUrl,
    flow_data: {
      type: 'subscription_update_confirm',
      subscription_update_confirm: {
        subscription: snapshot.id,
        items: [{ id: snapshot.itemId, price: verifiedTarget.priceId, quantity: 1 }],
      },
      after_completion: {
        type: 'redirect',
        redirect: { return_url: successUrl },
      },
    },
  })
  return session.url
}

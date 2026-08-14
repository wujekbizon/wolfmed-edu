import 'server-only'
import { and, desc, eq, notInArray } from 'drizzle-orm'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import { STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE } from '@/constants/stripePortalConfigurations'
import { TERMINAL_SUBSCRIPTION_STATUSES } from '@/constants/subscriptionStatus'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
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

  const [localSubscription] = await db.select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.courseSlug, targetOffer.courseSlug),
      notInArray(subscriptions.status, [...TERMINAL_SUBSCRIPTION_STATUSES])
    ))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)
  if (!localSubscription) return null

  const snapshot = await getSubscriptionSnapshot(localSubscription.subscriptionId)
  const currentOffer = await getVerifiedSubscriptionOffer(snapshot.priceId)
  if (
    !isSubscriptionAccessActive(snapshot) ||
    snapshot.customerId !== localSubscription.customerId ||
    currentOffer.courseSlug !== targetOffer.courseSlug ||
    currentOffer.accessTier !== 'basic'
  ) return null

  const configurationEnv = STRIPE_PORTAL_CONFIGURATION_ENV_BY_COURSE[
    targetOffer.courseSlug
  ]
  const configuration = process.env[configurationEnv]
  if (!configuration) throw new Error(`Missing Stripe Portal configuration: ${configurationEnv}`)

  const verifiedTarget = await getVerifiedStripeOffer(targetOfferKey)
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

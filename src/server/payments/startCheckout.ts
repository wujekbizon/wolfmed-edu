import 'server-only'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { resolveLifetimeCheckoutEligibility } from '@/helpers/resolveLifetimeCheckoutEligibility'
import { resolveSubscriptionCheckoutEligibility } from '@/helpers/resolveSubscriptionCheckoutEligibility'
import stripe from '@/lib/stripeClient'
import { getUserEnrollmentGrants } from '@/server/queries'
import { getOrCreateStripeCustomer } from '@/server/stripe'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'
import { hasOpenSubscriptionForCourse } from '@/server/payments/hasOpenSubscriptionForCourse'
import { createStripeCheckoutSession } from '@/server/payments/createStripeCheckoutSession'
import type { CheckoutStartResult, PaymentOfferKey } from '@/types/paymentTypes'
import {
  attachCheckoutSession,
  getOrCreateCheckoutOrder,
  markCheckoutOrderStatus,
} from '@/server/payments/checkoutOrders'

export async function startCheckout(
  userId: string,
  offerKey: PaymentOfferKey
): Promise<CheckoutStartResult> {
  const catalogOffer = PAYMENT_OFFERS[offerKey]
  const hasOpenSubscription = await hasOpenSubscriptionForCourse(
    userId,
    catalogOffer.courseSlug
  )
  if (hasOpenSubscription) {
    return {
      status: catalogOffer.purchaseModel === 'subscription'
        ? 'ALREADY_OWNED'
        : 'MODEL_CONFLICT',
    }
  }
  const enrollmentGrants = await getUserEnrollmentGrants(userId)
  const eligibility = catalogOffer.purchaseModel === 'subscription'
    ? resolveSubscriptionCheckoutEligibility(enrollmentGrants, catalogOffer)
    : resolveLifetimeCheckoutEligibility(enrollmentGrants, catalogOffer)
  if (eligibility !== 'ALLOWED') return { status: eligibility }
  const offer = await getVerifiedStripeOffer(offerKey)

  const order = await getOrCreateCheckoutOrder(userId, offer)
  if (order.offerKey !== offer.key) return { status: 'ACTIVE_CONFLICT' }
  if (order.status === 'PAID' || order.status === 'COMPLETED') {
    return { status: 'COMPLETED' }
  }

  if (order.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
    if (existing.status === 'open' && existing.url) {
      return { status: 'READY', url: existing.url }
    }
    if (existing.status === 'complete') {
      await markCheckoutOrderStatus(order.id, 'COMPLETED')
      return { status: 'COMPLETED' }
    }
    await markCheckoutOrderStatus(order.id, 'EXPIRED', true)
    return startCheckout(userId, offerKey)
  }

  const customer = await getOrCreateStripeCustomer(userId)
  if (customer.replaced) {
    await markCheckoutOrderStatus(order.id, 'FAILED', true)
    return startCheckout(userId, offerKey)
  }
  const customerId = customer.customerId
  const session = await createStripeCheckoutSession(order.id, userId, customerId, offer)

  if (!session.url) throw new Error('Stripe Checkout Session has no URL')
  await attachCheckoutSession(
    order.id,
    session.id,
    customerId,
    new Date(session.expires_at * 1000)
  )
  return { status: 'READY', url: session.url }
}

import 'server-only'
import { hasAccessToTier } from '@/helpers/accessTiers'
import stripe from '@/lib/stripeClient'
import { getUserEnrollments } from '@/server/queries'
import { getOrCreateStripeCustomer } from '@/server/stripe'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'
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
  const offer = await getVerifiedStripeOffer(offerKey)
  const enrollments = await getUserEnrollments(userId)
  const owned = enrollments.find((item) => item.courseSlug === offer.courseSlug)

  if (owned && hasAccessToTier(owned.accessTier, offer.accessTier)) {
    return { status: 'ALREADY_OWNED' }
  }

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

  const customerId = await getOrCreateStripeCustomer(userId)
  const cancelUrl = new URL('/canceled', process.env.NEXT_PUBLIC_APP_URL)
  cancelUrl.searchParams.set('course', offer.courseSlug)
  cancelUrl.searchParams.set('order', order.id)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_update: { address: 'auto', name: 'auto' },
    billing_address_collection: 'required',
    name_collection: { individual: { enabled: true, optional: false } },
    tax_id_collection: { enabled: true, required: 'never' },
    invoice_creation: { enabled: true },
    locale: 'pl',
    line_items: [{ price: offer.priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl.toString(),
    client_reference_id: userId,
    metadata: {
      orderId: order.id,
      offerKey: offer.key,
      courseSlug: offer.courseSlug,
      accessTier: offer.accessTier,
    },
    payment_intent_data: { metadata: { orderId: order.id, offerKey: offer.key } },
  }, { idempotencyKey: `checkout:${order.id}` })

  if (!session.url) throw new Error('Stripe Checkout Session has no URL')
  await attachCheckoutSession(
    order.id,
    session.id,
    customerId,
    new Date(session.expires_at * 1000)
  )
  return { status: 'READY', url: session.url }
}

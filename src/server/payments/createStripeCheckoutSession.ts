import 'server-only'
import type Stripe from 'stripe'
import stripe from '@/lib/stripeClient'
import type { VerifiedPaymentOffer } from '@/types/paymentTypes'

export async function createStripeCheckoutSession(
  orderId: string,
  userId: string,
  customerId: string,
  offer: VerifiedPaymentOffer
) {
  const cancelUrl = new URL('/canceled', process.env.NEXT_PUBLIC_APP_URL)
  cancelUrl.searchParams.set('course', offer.courseSlug)
  cancelUrl.searchParams.set('order', orderId)
  const sharedParams = {
    customer: customerId,
    customer_update: { address: 'auto', name: 'auto' },
    billing_address_collection: 'required',
    name_collection: { individual: { enabled: true, optional: false } },
    tax_id_collection: { enabled: true, required: 'never' },
    locale: 'pl',
    line_items: [{ price: offer.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl.toString(),
    client_reference_id: userId,
    metadata: { orderId },
  } satisfies Stripe.Checkout.SessionCreateParams

  return offer.purchaseModel === 'subscription'
    ? stripe.checkout.sessions.create({
        ...sharedParams,
        mode: 'subscription',
        subscription_data: { metadata: { orderId } },
      }, { idempotencyKey: `checkout:${orderId}` })
    : stripe.checkout.sessions.create({
        ...sharedParams,
        mode: 'payment',
        invoice_creation: { enabled: true },
        payment_intent_data: { metadata: { orderId } },
      }, { idempotencyKey: `checkout:${orderId}` })
}

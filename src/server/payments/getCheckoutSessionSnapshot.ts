import type Stripe from 'stripe'
import type { CheckoutSessionSnapshot } from '@/types/paymentTypes'

export function getCheckoutSessionSnapshot(
  session: Stripe.Checkout.Session
): CheckoutSessionSnapshot {
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? null
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? null
  const invoiceId = typeof session.invoice === 'string'
    ? session.invoice
    : session.invoice?.id ?? null
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id ?? null

  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    clientReferenceId: session.client_reference_id,
    customerId,
    paymentIntentId,
    subscriptionId,
    invoiceId,
    createdAt: new Date(session.created * 1000),
    expiresAt: new Date(session.expires_at * 1000),
    lineItems: (session.line_items?.data ?? []).map((item) => ({
      priceId: typeof item.price === 'string' ? item.price : item.price?.id ?? null,
      quantity: item.quantity,
    })),
  }
}

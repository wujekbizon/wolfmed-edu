import 'server-only'
import type Stripe from 'stripe'
import { getCheckoutFulfillmentContext } from '@/server/payments/getCheckoutFulfillmentContext'
import { syncCheckoutSession } from '@/server/payments/syncCheckoutSession'
import type { StripeCheckoutEventType } from '@/types/paymentTypes'

export async function processStripeCheckoutEvent(event: Stripe.Event): Promise<void> {
  const eventType = event.type as StripeCheckoutEventType
  const session = event.data.object as Stripe.Checkout.Session
  const context = await getCheckoutFulfillmentContext(session.id)
  await syncCheckoutSession(event.id, eventType, context)
}

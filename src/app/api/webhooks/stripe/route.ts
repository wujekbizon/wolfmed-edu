import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import stripe from '@/lib/stripeClient'
import { processStripeCheckoutEvent } from '@/server/payments/processStripeCheckoutEvent'
import { processStripePaymentLifecycleEvent } from '@/server/payments/processStripePaymentLifecycleEvent'
import { processStripeSubscriptionEvent } from '@/server/payments/processStripeSubscriptionEvent'
import type {
  StripeCheckoutEventType,
  StripePaymentLifecycleEventType,
  StripeSubscriptionEventType,
} from '@/types/paymentTypes'

const checkoutEvents = new Set<StripeCheckoutEventType>([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
])

const paymentLifecycleEvents = new Set<StripePaymentLifecycleEventType>([
  'charge.refunded',
  'refund.created',
  'refund.updated',
  'refund.failed',
  'charge.dispute.created',
  'charge.dispute.closed',
])

const subscriptionEvents = new Set<StripeSubscriptionEventType>([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
])

export async function POST(req: Request) {
  const signature = (await headers()).get('stripe-signature')
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook configuration' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid signature'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    if (checkoutEvents.has(event.type as StripeCheckoutEventType)) {
      await processStripeCheckoutEvent(event)
    } else if (paymentLifecycleEvents.has(event.type as StripePaymentLifecycleEventType)) {
      await processStripePaymentLifecycleEvent(event)
    } else if (subscriptionEvents.has(event.type as StripeSubscriptionEventType)) {
      await processStripeSubscriptionEvent(event)
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Stripe webhook ${event.id} failed:`, error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

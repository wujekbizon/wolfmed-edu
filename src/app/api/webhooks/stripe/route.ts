import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripeClient'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  let subscription: Stripe.Subscription
  let status: string

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      subscription = event.data.object as Stripe.Subscription
      status = subscription.status
      console.log(`Subscription created. Status: ${status}`)
      // TODO: Implement handleSubscriptionCreated(subscription)
      break
    case 'customer.subscription.updated':
      subscription = event.data.object as Stripe.Subscription
      status = subscription.status
      console.log(`Subscription updated. Status: ${status}`)
      // TODO: Implement handleSubscriptionUpdated(subscription)
      break
    case 'customer.subscription.deleted':
      subscription = event.data.object as Stripe.Subscription
      status = subscription.status
      console.log(`Subscription deleted. Status: ${status}`)
      // TODO: Implement handleSubscriptionDeleted(subscription)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

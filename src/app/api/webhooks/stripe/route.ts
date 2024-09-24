import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripeClient'
import Stripe from 'stripe'
import { updateTestLimit } from '@/server/db'
import { auth } from '@clerk/nextjs/server'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  const { userId } = auth()

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

      console.log(`UserId: ${userId}`)
      console.log(subscription)

      //await updateTestLimit(subscription.customer as string, 1000, subscription.id)
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

      //await updateTestLimit(subscription.customer as string, 10, subscription.id)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

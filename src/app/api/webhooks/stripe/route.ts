import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripeClient'
import Stripe from 'stripe'
import { insertSubscription, updateTestLimit } from '@/server/db'
import { getUserIdWithRetry } from '@/helpers/getUserIdWithRetry'

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
    case 'checkout.session.completed':
      const {
        client_reference_id,
        id,
        amount_total,
        currency,
        customer,
        customer_details,
        invoice,
        payment_status,
        subscription: subscription_id,
        created,
      } = event.data.object as Stripe.Checkout.Session

      const newSubscription = {
        userId: client_reference_id!,
        sessionId: id,
        amountTotal: amount_total!,
        currency: currency! as 'pln' | 'usd' | 'eur',
        customerId: customer?.toString()!,
        customerEmail: customer_details?.email!,
        invoiceId: invoice?.toString()!,
        paymentStatus: payment_status,
        subscriptionId: subscription_id?.toString()!,
        createdAt: created,
      }

      // Insert subscription into database
      await insertSubscription({ ...newSubscription })
      break
    case 'customer.subscription.created':
      subscription = event.data.object as Stripe.Subscription
      const createdEventId = event.request?.idempotency_key!
      const createdCustomerId = subscription.customer.toString()
      status = subscription.status
      console.log(`Subscription created. Status: ${status}`)

      try {
        const userId = await getUserIdWithRetry(createdCustomerId)
        if (!userId) {
          console.error('User ID not found for customer:', createdCustomerId)
          return NextResponse.json({ error: 'User ID not found' }, { status: 404 })
        }
        await updateTestLimit(userId, 1000, createdEventId)
      } catch (error) {
        console.error('Error processing subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }

      break
    case 'customer.subscription.updated':
      subscription = event.data.object as Stripe.Subscription
      status = subscription.status
      console.log(`Subscription updated. Status: ${status}`)
      // TODO: Implement handleSubscriptionUpdated(subscription)
      break
    case 'customer.subscription.deleted':
      subscription = event.data.object as Stripe.Subscription
      const deletedEventId = event.request?.idempotency_key!
      const deletedCustomerId = subscription.customer.toString()
      status = subscription.status
      console.log(`Subscription deleted. Status: ${status}`)
      try {
        const userId = await getUserIdWithRetry(deletedCustomerId)
        if (!userId) {
          console.error('User ID not found for customer:', deletedCustomerId)
          return NextResponse.json({ error: 'User ID not found' }, { status: 404 })
        }

        await updateTestLimit(userId, 10, subscription.id)
      } catch (error) {
        console.error('Error processing subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

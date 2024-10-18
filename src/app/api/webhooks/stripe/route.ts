import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripeClient'
import Stripe from 'stripe'
import { insertPayment, insertSubscription, updateUserSupporterStatus } from '@/server/db'
import { getUserIdWithRetry } from '@/helpers/getUserIdWithRetry'
import { getUserIdByCustomer, getUserIdByCustomerEmail } from '@/server/queries'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const sig = headerPayload.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  let subscription: Stripe.Subscription
  let charge: Stripe.Charge
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
        mode,
      } = event.data.object as Stripe.Checkout.Session

      if (mode === 'subscription') {
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
      }

      if (mode === 'payment') {
        const newPayment = {
          userId: client_reference_id!,
          amountTotal: amount_total!,
          currency: currency! as 'pln' | 'usd' | 'eur',
          customerEmail: customer_details?.email!,
          createdAt: created,
          paymentStatus: payment_status,
        }

        // Insert payment into database
        await insertPayment(newPayment)
      }
      break
    case 'charge.succeeded':
      charge = event.data.object as Stripe.Charge

      // email is requred when user making payment in Stripe
      const chargedCustomerEmail = event.data.object.billing_details.email!
      const chargedEventId = event.data.object.payment_intent as string
      status = charge.status
      console.log(`One time payment. Status: ${status}`)

      try {
        const userId = await getUserIdWithRetry(getUserIdByCustomerEmail, chargedCustomerEmail)
        if (!userId) {
          console.error('User ID not found for customer:', chargedCustomerEmail)
          return NextResponse.json({ error: 'User ID not found' }, { status: 404 })
        }

        await updateUserSupporterStatus(userId, chargedEventId)
      } catch (error) {
        console.error('Error processing subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }

      break
    case 'customer.subscription.created':
      subscription = event.data.object as Stripe.Subscription
      const createdEventId = event.request?.idempotency_key!
      const createdCustomerId = subscription.customer.toString()
      status = subscription.status
      console.log(`Subscription created. Status: ${status}`)

      try {
        const userId = await getUserIdWithRetry(getUserIdByCustomer, createdCustomerId)
        if (!userId) {
          console.error('User ID not found for customer:', createdCustomerId)
          return NextResponse.json({ error: 'User ID not found' }, { status: 404 })
        }
        // await updateTestLimit(userId, 1000, createdEventId)
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
        const userId = await getUserIdWithRetry(getUserIdByCustomer, deletedCustomerId)
        if (!userId) {
          console.error('User ID not found for customer:', deletedCustomerId)
          return NextResponse.json({ error: 'User ID not found' }, { status: 404 })
        }

        // await updateTestLimit(userId, 10, deletedEventId)
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

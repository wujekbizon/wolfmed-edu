import type Stripe from 'stripe'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'

export function getStripeEventSubscriptionId(event: Stripe.Event): string | null {
  if (event.type.startsWith('customer.subscription.')) {
    return (event.data.object as Stripe.Subscription).id
  }

  const invoice = event.data.object as Stripe.Invoice
  return getStripeObjectId(
    invoice.parent?.subscription_details?.subscription ?? null
  )
}

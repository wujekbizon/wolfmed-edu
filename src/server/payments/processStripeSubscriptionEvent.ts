import 'server-only'
import type Stripe from 'stripe'
import { getStripeEventSubscriptionId } from '@/helpers/getStripeEventSubscriptionId'
import { syncStripeSubscriptionById } from '@/server/payments/syncStripeSubscriptionById'

export async function processStripeSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const subscriptionId = getStripeEventSubscriptionId(event)
  if (!subscriptionId) return

  await syncStripeSubscriptionById(event.id, event.type, subscriptionId)
}

import 'server-only'
import type Stripe from 'stripe'
import { getStripeEventSubscriptionId } from '@/helpers/getStripeEventSubscriptionId'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { releaseCompletedSubscriptionDowngrade } from '@/server/payments/releaseCompletedSubscriptionDowngrade'
import { syncStripeSubscriptionById } from '@/server/payments/syncStripeSubscriptionById'

export async function processStripeSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const subscriptionId = getStripeEventSubscriptionId(event)
  if (!subscriptionId) return

  await syncStripeSubscriptionById(event.id, event.type, subscriptionId)
  if (event.type !== 'invoice.paid') return

  const snapshot = await getSubscriptionSnapshot(subscriptionId)
  const currentOffer = await getVerifiedSubscriptionOffer(snapshot.priceId)
  await releaseCompletedSubscriptionDowngrade(snapshot, currentOffer)
}

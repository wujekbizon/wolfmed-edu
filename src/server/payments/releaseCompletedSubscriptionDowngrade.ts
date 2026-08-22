import 'server-only'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import stripe from '@/lib/stripeClient'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { syncStripeSubscriptionById } from '@/server/payments/syncStripeSubscriptionById'
import type { SubscriptionSnapshot, VerifiedPaymentOffer } from '@/types/paymentTypes'

export async function releaseCompletedSubscriptionDowngrade(
  snapshot: SubscriptionSnapshot,
  currentOffer: VerifiedPaymentOffer
): Promise<boolean> {
  if (
    !snapshot.scheduleId ||
    snapshot.scheduledChange ||
    currentOffer.purchaseModel !== 'subscription' ||
    currentOffer.accessTier !== 'basic'
  ) return false

  const schedule = await stripe.subscriptionSchedules.retrieve(snapshot.scheduleId)
  if (
    schedule.status !== 'active' ||
    getStripeObjectId(schedule.subscription) !== snapshot.id ||
    schedule.metadata?.wolfmed_change !== 'downgrade' ||
    schedule.metadata?.wolfmed_target_offer !== currentOffer.key
  ) return false

  const released = await stripe.subscriptionSchedules.release(
    schedule.id,
    {},
    { idempotencyKey: `downgrade:${schedule.id}:completed:release` }
  )
  const confirmed = await getSubscriptionSnapshot(snapshot.id)
  if (confirmed.scheduleId || confirmed.priceId !== currentOffer.priceId) {
    throw new Error(`Subscription ${snapshot.id} completed schedule was not released`)
  }

  await syncStripeSubscriptionById(
    `app:schedule-complete:${released.id}:${released.released_at ?? 'now'}`,
    'app.subscription_schedule.completed',
    snapshot.id
  )
  return true
}

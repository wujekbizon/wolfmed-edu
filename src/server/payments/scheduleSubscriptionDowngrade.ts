import 'server-only'
import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { getScheduledSubscriptionChange } from '@/helpers/getScheduledSubscriptionChange'
import { getSubscriptionDowngradePhases } from '@/helpers/getSubscriptionDowngradePhases'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import { isSubscriptionDowngrade } from '@/helpers/isSubscriptionDowngrade'
import stripe from '@/lib/stripeClient'
import { getActiveCourseSubscription } from '@/server/payments/getActiveCourseSubscription'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedScheduledSubscriptionChange } from '@/server/payments/getVerifiedScheduledSubscriptionChange'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncStripeSubscriptionById } from '@/server/payments/syncStripeSubscriptionById'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'
import type { PaymentOfferKey } from '@/types/paymentTypes'

export async function scheduleSubscriptionDowngrade(
  userId: string,
  targetOfferKey: PaymentOfferKey
): Promise<string | null> {
  const target = PAYMENT_OFFERS[targetOfferKey]
  if (target.purchaseModel !== 'subscription' || target.accessTier !== 'basic') return null

  const local = await getActiveCourseSubscription(userId, target.courseSlug)
  if (!local) return null

  const snapshot = await getSubscriptionSnapshot(local.subscriptionId)
  const currentOffer = await getVerifiedSubscriptionOffer(snapshot.priceId)
  if (snapshot.scheduleId) {
    const scheduled = await getVerifiedScheduledSubscriptionChange(snapshot, currentOffer)
    if (scheduled?.offer.key !== targetOfferKey) return null
    await syncStripeSubscriptionById(
      `app:schedule-existing:${scheduled.scheduleId}:${scheduled.priceId}`,
      'app.subscription_schedule.existing',
      snapshot.id
    )
    return snapshot.id
  }

  const verifiedTarget = await getVerifiedStripeOffer(targetOfferKey)
  if (
    !isSubscriptionAccessActive(snapshot) ||
    snapshot.customerId !== local.customerId ||
    !isSubscriptionDowngrade(currentOffer, verifiedTarget)
  ) return null

  const periodEnd = Math.floor(snapshot.currentPeriodEnd.getTime() / 1000)
  const attemptKey = `downgrade:${snapshot.id}:${verifiedTarget.priceId}:${periodEnd}:${randomUUID()}`
  const schedule = await stripe.subscriptionSchedules.create(
    { from_subscription: snapshot.id },
    { idempotencyKey: `${attemptKey}:create` }
  )
  let updated: Stripe.SubscriptionSchedule
  try {
    const phases = getSubscriptionDowngradePhases(
      schedule,
      currentOffer.priceId,
      verifiedTarget.priceId,
      snapshot.currentPeriodEnd
    )
    if (!phases) throw new Error(`Subscription ${snapshot.id} produced an invalid schedule`)
    updated = await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'release',
      metadata: {
        wolfmed_change: 'downgrade',
        wolfmed_target_offer: verifiedTarget.key,
      },
      phases,
      proration_behavior: 'none',
    }, { idempotencyKey: `${attemptKey}:update` })
    const change = getScheduledSubscriptionChange(
      updated,
      currentOffer.priceId,
      snapshot.currentPeriodEnd
    )
    if (change?.priceId !== verifiedTarget.priceId) {
      throw new Error(`Subscription ${snapshot.id} downgrade was not scheduled`)
    }
    const confirmed = await getSubscriptionSnapshot(snapshot.id)
    if (
      confirmed.scheduleId !== updated.id ||
      confirmed.scheduledChange?.scheduleId !== updated.id ||
      confirmed.scheduledChange.priceId !== verifiedTarget.priceId
    ) {
      throw new Error(`Subscription ${snapshot.id} downgrade was not attached`)
    }
  } catch (error) {
    try {
      await stripe.subscriptionSchedules.release(
        schedule.id,
        {},
        { idempotencyKey: `${attemptKey}:rollback` }
      )
    } catch (releaseError) {
      console.error(`Failed to release incomplete schedule ${schedule.id}:`, releaseError)
    }
    throw error
  }

  await syncStripeSubscriptionById(
    `app:schedule-create:${updated.id}:${verifiedTarget.priceId}:${periodEnd}`,
    'app.subscription_schedule.created',
    snapshot.id
  )
  return snapshot.id
}

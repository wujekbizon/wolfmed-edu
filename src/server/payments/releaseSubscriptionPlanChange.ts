import 'server-only'
import { and, desc, eq, notInArray } from 'drizzle-orm'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { TERMINAL_SUBSCRIPTION_STATUSES } from '@/constants/subscriptionStatus'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import { getSubscriptionSnapshot } from '@/server/payments/getSubscriptionSnapshot'
import { getVerifiedScheduledSubscriptionChange } from '@/server/payments/getVerifiedScheduledSubscriptionChange'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import { syncStripeSubscriptionById } from '@/server/payments/syncStripeSubscriptionById'
import type { PaymentOfferKey } from '@/types/paymentTypes'

export async function releaseSubscriptionPlanChange(
  userId: string,
  targetOfferKey: PaymentOfferKey
): Promise<boolean> {
  const target = PAYMENT_OFFERS[targetOfferKey]
  if (target.purchaseModel !== 'subscription' || target.accessTier !== 'basic') return false

  const [local] = await db.select().from(subscriptions).where(and(
    eq(subscriptions.userId, userId),
    eq(subscriptions.courseSlug, target.courseSlug),
    notInArray(subscriptions.status, [...TERMINAL_SUBSCRIPTION_STATUSES])
  )).orderBy(desc(subscriptions.createdAt)).limit(1)
  if (!local) return false

  const snapshot = await getSubscriptionSnapshot(local.subscriptionId)
  const currentOffer = await getVerifiedSubscriptionOffer(snapshot.priceId)
  const scheduled = await getVerifiedScheduledSubscriptionChange(snapshot, currentOffer)
  if (!scheduled || scheduled.offer.key !== targetOfferKey) return false

  const released = await stripe.subscriptionSchedules.release(scheduled.scheduleId)
  const eventId = `app:schedule-release:${released.id}:${released.released_at ?? 'now'}`
  await syncStripeSubscriptionById(eventId, 'subscription_schedule.released', snapshot.id)
  return true
}

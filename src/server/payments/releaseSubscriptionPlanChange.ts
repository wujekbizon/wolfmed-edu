import 'server-only'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import stripe from '@/lib/stripeClient'
import { getActiveCourseSubscription } from '@/server/payments/getActiveCourseSubscription'
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

  const local = await getActiveCourseSubscription(userId, target.courseSlug)
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

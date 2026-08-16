import 'server-only'
import { and, desc, eq, isNotNull, notInArray } from 'drizzle-orm'
import { TERMINAL_SUBSCRIPTION_STATUSES } from '@/constants/subscriptionStatus'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import type { PaymentOffer, SubscriptionPlanChange } from '@/types/paymentTypes'

export async function getSubscriptionPlanChange(
  userId: string,
  courseSlug: PaymentOffer['courseSlug']
): Promise<SubscriptionPlanChange | null> {
  const [change] = await db.select({
    targetOfferKey: subscriptions.pendingOfferKey,
    targetAccessTier: subscriptions.pendingAccessTier,
    effectiveAt: subscriptions.pendingChangeAt,
  }).from(subscriptions).where(and(
    eq(subscriptions.userId, userId),
    eq(subscriptions.courseSlug, courseSlug),
    isNotNull(subscriptions.pendingChangeAt),
    notInArray(subscriptions.status, [...TERMINAL_SUBSCRIPTION_STATUSES])
  )).orderBy(desc(subscriptions.updatedAt)).limit(1)

  if (!change?.targetOfferKey || !change.targetAccessTier || !change.effectiveAt) return null
  return { courseSlug, ...change } as SubscriptionPlanChange
}

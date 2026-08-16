import 'server-only'
import { and, eq, notInArray } from 'drizzle-orm'
import { TERMINAL_SUBSCRIPTION_STATUSES } from '@/constants/subscriptionStatus'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import type { PaymentOffer } from '@/types/paymentTypes'

export async function hasOpenSubscriptionForCourse(
  userId: string,
  courseSlug: PaymentOffer['courseSlug']
): Promise<boolean> {
  const [subscription] = await db.select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.courseSlug, courseSlug),
      notInArray(subscriptions.status, [...TERMINAL_SUBSCRIPTION_STATUSES])
    ))
    .limit(1)
  return Boolean(subscription)
}

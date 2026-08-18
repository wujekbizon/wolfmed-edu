import 'server-only'
import { and, desc, eq, notInArray } from 'drizzle-orm'
import { TERMINAL_SUBSCRIPTION_STATUSES } from '@/constants/subscriptionStatus'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import type { PaymentOffer } from '@/types/paymentTypes'

export async function getActiveCourseSubscription(
  userId: string,
  courseSlug: PaymentOffer['courseSlug']
) {
  const [subscription] = await db.select().from(subscriptions).where(and(
    eq(subscriptions.userId, userId),
    eq(subscriptions.courseSlug, courseSlug),
    notInArray(subscriptions.status, [...TERMINAL_SUBSCRIPTION_STATUSES])
  )).orderBy(desc(subscriptions.createdAt)).limit(1)
  return subscription ?? null
}

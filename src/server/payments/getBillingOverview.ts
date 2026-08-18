import 'server-only'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { db } from '@/server/db/index'
import { courseEnrollments, subscriptions } from '@/server/db/schema'
import type { BillingOverview } from '@/types/billingTypes'

export async function getBillingOverview(userId: string): Promise<BillingOverview> {
  const [subscriptionRows, lifetimeRows] = await Promise.all([
    db.select({
      courseSlug: subscriptions.courseSlug,
      accessTier: subscriptions.accessTier,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      pendingOfferKey: subscriptions.pendingOfferKey,
      pendingAccessTier: subscriptions.pendingAccessTier,
      pendingChangeAt: subscriptions.pendingChangeAt,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      cancelAt: subscriptions.cancelAt,
    }).from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.updatedAt)),
    db.select().from(courseEnrollments).where(and(
      eq(courseEnrollments.userId, userId),
      inArray(courseEnrollments.sourceType, [
        'legacy_lifetime',
        'lifetime_purchase',
        'lifetime_upgrade',
        'manual',
      ])
    )),
  ])
  const currentSubscriptions = subscriptionRows.filter((row, index, rows) => (
    row.courseSlug &&
    row.accessTier &&
    rows.findIndex((candidate) => candidate.courseSlug === row.courseSlug) === index
  )) as BillingOverview['subscriptions']
  const lifetime = getEffectiveEnrollmentGrants(
    lifetimeRows
  ).map((row) => ({
    courseSlug: row.courseSlug as BillingOverview['lifetime'][number]['courseSlug'],
    accessTier: row.accessTier as BillingOverview['lifetime'][number]['accessTier'],
  }))

  return { subscriptions: currentSubscriptions, lifetime }
}

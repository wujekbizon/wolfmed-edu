import 'server-only'
import { and, eq, gte, inArray, isNull, lte, or } from 'drizzle-orm'
import { courseEnrollments } from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'
import type { CheckoutFulfillmentContext } from '@/types/paymentTypes'

export async function syncLifetimeEnrollment(
  tx: PaymentTransaction,
  context: CheckoutFulfillmentContext
): Promise<void> {
  if (context.entitlementSourceType === 'lifetime_upgrade') {
    const now = new Date()
    const [baseGrant] = await tx.select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, context.userId),
        eq(courseEnrollments.courseSlug, context.courseSlug),
        eq(courseEnrollments.accessTier, 'basic'),
        eq(courseEnrollments.isActive, true),
        inArray(courseEnrollments.sourceType, ['legacy_lifetime', 'lifetime_purchase']),
        isNull(courseEnrollments.revokedAt),
        or(isNull(courseEnrollments.startsAt), lte(courseEnrollments.startsAt, now)),
        or(isNull(courseEnrollments.expiresAt), gte(courseEnrollments.expiresAt, now))
      ))
      .limit(1)

    if (!baseGrant) throw new Error('Lifetime upgrade requires an active Basic grant')
  }

  await tx.insert(courseEnrollments).values({
    userId: context.userId,
    courseSlug: context.courseSlug,
    accessTier: context.accessTier,
    sourceType: context.entitlementSourceType,
    sourceId: context.snapshot.id,
    isActive: true,
    startsAt: context.snapshot.createdAt,
  }).onConflictDoNothing({
    target: [courseEnrollments.sourceType, courseEnrollments.sourceId],
  })
}

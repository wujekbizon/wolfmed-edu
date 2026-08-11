import 'server-only'
import { and, eq, inArray } from 'drizzle-orm'
import { getLifetimeEnrollmentMerge } from '@/helpers/getLifetimeEnrollmentMerge'
import { courseEnrollments } from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'
import type { CheckoutFulfillmentContext } from '@/types/paymentTypes'

export async function syncLifetimeEnrollment(
  tx: PaymentTransaction,
  context: CheckoutFulfillmentContext
): Promise<void> {
  const existing = await tx.select({
    id: courseEnrollments.id,
    accessTier: courseEnrollments.accessTier,
  }).from(courseEnrollments).where(and(
    eq(courseEnrollments.userId, context.userId),
    eq(courseEnrollments.courseSlug, context.courseSlug),
    eq(courseEnrollments.sourceType, 'lifetime_purchase')
  ))
  const merge = getLifetimeEnrollmentMerge(existing, context.accessTier)

  if (!merge.canonicalId) {
    await tx.insert(courseEnrollments).values({
      userId: context.userId,
      courseSlug: context.courseSlug,
      accessTier: context.accessTier,
      sourceType: 'lifetime_purchase',
      sourceId: context.snapshot.id,
      isActive: true,
      startsAt: context.snapshot.createdAt,
    })
    return
  }

  if (merge.shouldApplyPurchase) {
    await tx.update(courseEnrollments).set({
      accessTier: context.accessTier,
      sourceId: context.snapshot.id,
      isActive: true,
      revokedAt: null,
    }).where(eq(courseEnrollments.id, merge.canonicalId))
  }
  if (merge.staleIds.length) {
    await tx.delete(courseEnrollments)
      .where(inArray(courseEnrollments.id, merge.staleIds))
  }
}

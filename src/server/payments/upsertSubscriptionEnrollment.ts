import 'server-only'
import { courseEnrollments } from '@/server/db/schema'
import { canGrantPaymentAccess } from '@/helpers/canGrantPaymentAccess'
import { syncEnglishBonusEnrollment } from '@/server/payments/syncEnglishBonusEnrollment'
import type { PaymentTransaction } from '@/types/dbTypes'
import type {
  SubscriptionCheckoutOrder,
  SubscriptionSnapshot,
  VerifiedPaymentOffer,
} from '@/types/paymentTypes'

export async function upsertSubscriptionEnrollment(
  tx: PaymentTransaction,
  snapshot: SubscriptionSnapshot,
  order: SubscriptionCheckoutOrder,
  offer: VerifiedPaymentOffer,
  active: boolean,
  now: Date
): Promise<void> {
  if (!canGrantPaymentAccess(order.userId, order.ownerDeletedAt)) return

  const access = {
    accessTier: offer.accessTier,
    isActive: active,
    startsAt: snapshot.currentPeriodStart,
    expiresAt: snapshot.currentPeriodEnd,
    revokedAt: active ? null : now,
  }
  await tx.insert(courseEnrollments).values({
    ...access,
    userId: order.userId,
    courseSlug: offer.courseSlug,
    sourceType: 'subscription',
    sourceId: snapshot.id,
  }).onConflictDoUpdate({
    target: [courseEnrollments.sourceType, courseEnrollments.sourceId],
    set: access,
  })
  if (!active && snapshot.status !== 'canceled' && offer.accessTier !== 'basic') return

  await syncEnglishBonusEnrollment(tx, {
    ...access,
    userId: order.userId,
    courseSlug: offer.courseSlug,
    sourceType: 'subscription',
    sourceId: snapshot.id,
    enrolledAt: now,
  }, now)
}

import 'server-only'
import { and, eq, sql } from 'drizzle-orm'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { isPaymentLifecycleSnapshotValid } from '@/helpers/isPaymentLifecycleSnapshotValid'
import { shouldRevokePaymentEntitlement } from '@/helpers/shouldRevokePaymentEntitlement'
import { db } from '@/server/db/index'
import {
  courseEnrollments,
  payments,
  processedEvents,
} from '@/server/db/schema'
import type {
  PaymentLifecycleSnapshot,
  StripePaymentLifecycleEventType,
} from '@/types/paymentTypes'

export async function syncPaymentLifecycle(
  eventId: string,
  eventType: StripePaymentLifecycleEventType,
  snapshot: PaymentLifecycleSnapshot
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(
      ${`payment:${snapshot.paymentIntentId}`}, 0
    ))`)

    const [payment] = await tx.select().from(payments)
      .where(eq(payments.paymentIntentId, snapshot.paymentIntentId)).limit(1)
    if (!payment) throw new Error(`Payment ${snapshot.paymentIntentId} was not found`)
    if (!isPaymentLifecycleSnapshotValid(payment, snapshot)) {
      throw new Error(`Payment ${snapshot.paymentIntentId} failed lifecycle validation`)
    }
    if (!payment.offerKey || !payment.sessionId || !payment.courseSlug) {
      throw new Error(`Payment ${payment.id} has no source-aware entitlement`)
    }

    const [event] = await tx.insert(processedEvents).values({
      eventId,
      userId: payment.userId,
      eventType,
      stripeObjectId: snapshot.eventObjectId,
      orderId: payment.orderId,
      paymentId: payment.id,
    }).onConflictDoNothing({ target: processedEvents.eventId }).returning({
      id: processedEvents.id,
    })
    if (!event) return

    const disputeStatus = snapshot.disputeStatus ?? payment.disputeStatus
    const revoke = shouldRevokePaymentEntitlement(
      snapshot.refundStatus,
      disputeStatus
    )
    await tx.update(payments).set({
      chargeId: snapshot.chargeId,
      amountRefunded: snapshot.amountRefunded,
      refundStatus: snapshot.refundStatus,
      disputeStatus,
      updatedAt: new Date(),
    }).where(eq(payments.id, payment.id))

    const offer = PAYMENT_OFFERS[payment.offerKey]
    await tx.update(courseEnrollments).set({
      isActive: !revoke,
      revokedAt: revoke ? new Date() : null,
    }).where(and(
      eq(courseEnrollments.sourceType, offer.entitlementSourceType),
      eq(courseEnrollments.sourceId, payment.sessionId)
    ))
  })
}

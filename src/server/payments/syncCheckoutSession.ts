import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { resolveCheckoutPaymentState } from '@/helpers/resolveCheckoutPaymentState'
import { canGrantPaymentAccess } from '@/helpers/canGrantPaymentAccess'
import { getAccountDeletionCleanupAfter } from '@/helpers/getAccountDeletionCleanupAfter'
import { getPaymentRetentionDeadline } from '@/helpers/getPaymentRetentionDeadline'
import { db } from '@/server/db/index'
import { syncLifetimeEnrollment } from '@/server/payments/syncLifetimeEnrollment'
import {
  checkoutOrders,
  payments,
  processedEvents,
  userLimits,
} from '@/server/db/schema'
import type {
  CheckoutFulfillmentContext,
  StripeCheckoutEventType,
} from '@/types/paymentTypes'

export async function syncCheckoutSession(
  eventId: string,
  eventType: StripeCheckoutEventType,
  context: CheckoutFulfillmentContext
): Promise<void> {
  if (context.purchaseModel !== 'lifetime') {
    throw new Error(`Checkout Session ${context.snapshot.id} is not a lifetime purchase`)
  }
  const { snapshot } = context
  const paymentState = resolveCheckoutPaymentState(eventType, snapshot.paymentStatus)
  const paid = paymentState === 'paid'
  const failed = paymentState === 'failed'
  const canGrantAccess = canGrantPaymentAccess(
    context.ownerDeletedAt ? null : context.userId,
    context.ownerDeletedAt
  )
  const cleanupAfter = context.ownerDeletedAt
    ? getAccountDeletionCleanupAfter(context.ownerDeletedAt)
    : null

  if (paymentState === 'invalid') {
    throw new Error(`Async success ${eventId} is not paid`)
  }
  if (paid && !snapshot.paymentIntentId) {
    throw new Error(`Paid Checkout Session ${snapshot.id} has no PaymentIntent`)
  }

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(
      ${`${context.userId}:${context.courseSlug}:lifetime`}, 0
    ))`)

    const [event] = await tx.insert(processedEvents).values({
      eventId,
      userId: canGrantAccess ? context.userId : null,
      eventType,
      stripeObjectId: snapshot.id,
      orderId: canGrantAccess ? context.orderId : null,
      ownerDeletedAt: context.ownerDeletedAt,
      cleanupAfter,
    }).onConflictDoNothing({ target: processedEvents.eventId }).returning({
      id: processedEvents.id,
    })

    if (!event) return

    const [payment] = await tx.insert(payments).values({
      userId: canGrantAccess ? context.userId : null,
      orderId: canGrantAccess ? context.orderId : null,
      offerKey: context.offerKey,
      accessTier: context.accessTier,
      amountTotal: snapshot.amountTotal!,
      currency: 'pln',
      paymentStatus: paymentState,
      courseSlug: context.courseSlug,
      stripeCustomerId: canGrantAccess ? context.stripeCustomerId : null,
      sessionId: snapshot.id,
      paymentIntentId: snapshot.paymentIntentId,
      invoiceId: snapshot.invoiceId,
      createdAt: snapshot.createdAt,
      retentionUntil: getPaymentRetentionDeadline(snapshot.createdAt),
      pseudonymizedAt: context.ownerDeletedAt,
    }).onConflictDoUpdate({
      target: payments.sessionId,
      set: {
        paymentStatus: paymentState,
        paymentIntentId: snapshot.paymentIntentId,
        invoiceId: snapshot.invoiceId,
        ...(!canGrantAccess ? {
          userId: null,
          orderId: null,
          customerEmail: null,
          stripeCustomerId: null,
          pseudonymizedAt: context.ownerDeletedAt,
          retentionUntil: getPaymentRetentionDeadline(snapshot.createdAt),
        } : {}),
      },
    }).returning({ id: payments.id })

    if (context.orderId) {
      await tx.update(checkoutOrders).set({
        status: failed ? 'FAILED' : paid ? 'PAID' : 'PROCESSING',
        ...(failed || paid ? { deduplicationKey: null } : {}),
        updatedAt: new Date(),
      }).where(eq(checkoutOrders.id, context.orderId))
    }

    if (paid && !failed && canGrantAccess) {
      await syncLifetimeEnrollment(tx, context)
      await tx.insert(userLimits).values({ userId: context.userId })
        .onConflictDoNothing({ target: userLimits.userId })
    }

    if (!payment) throw new Error(`Payment ${snapshot.id} was not persisted`)
    await tx.update(processedEvents).set({ paymentId: payment.id })
      .where(eq(processedEvents.id, event.id))
  })
}

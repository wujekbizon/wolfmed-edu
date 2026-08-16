import 'server-only'
import { subscriptions } from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'
import type {
  SubscriptionCheckoutOrder,
  SubscriptionSnapshot,
  VerifiedPaymentOffer,
  VerifiedScheduledSubscriptionChange,
} from '@/types/paymentTypes'
import { canGrantPaymentAccess } from '@/helpers/canGrantPaymentAccess'
import { getAccountDeletionCleanupAfter } from '@/helpers/getAccountDeletionCleanupAfter'

export async function upsertSubscriptionRecord(
  tx: PaymentTransaction,
  snapshot: SubscriptionSnapshot,
  order: SubscriptionCheckoutOrder,
  offer: VerifiedPaymentOffer,
  scheduledChange: VerifiedScheduledSubscriptionChange | null,
  now: Date
) {
  const canGrantAccess = canGrantPaymentAccess(order.userId, order.ownerDeletedAt)
  const ownerDeletedAt = canGrantAccess ? null : order.ownerDeletedAt ?? now
  const cleanupAfter = canGrantAccess
    ? null
    : order.cleanupAfter ?? getAccountDeletionCleanupAfter(ownerDeletedAt ?? now)
  const values = {
    offerKey: offer.key,
    amountTotal: offer.amount,
    invoiceId: snapshot.latestInvoiceId,
    paymentStatus: snapshot.latestInvoiceStatus ?? 'unpaid',
    courseSlug: offer.courseSlug,
    accessTier: offer.accessTier,
    priceId: offer.priceId,
    status: snapshot.status,
    currentPeriodStart: snapshot.currentPeriodStart,
    currentPeriodEnd: snapshot.currentPeriodEnd,
    scheduleId: snapshot.scheduleId,
    pendingOfferKey: scheduledChange?.offer.key ?? null,
    pendingAccessTier: scheduledChange?.offer.accessTier ?? null,
    pendingPriceId: scheduledChange?.priceId ?? null,
    pendingChangeAt: scheduledChange?.effectiveAt ?? null,
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    cancelAt: snapshot.cancelAt,
    canceledAt: snapshot.canceledAt,
    endedAt: snapshot.endedAt,
    updatedAt: now,
  }
  const [subscription] = await tx.insert(subscriptions).values({
    ...values,
    userId: canGrantAccess ? order.userId : null,
    sessionId: order.stripeSessionId,
    orderId: canGrantAccess ? order.id : null,
    currency: offer.currency,
    customerId: snapshot.customerId,
    subscriptionId: snapshot.id,
    ownerDeletedAt,
    cleanupAfter,
    createdAt: snapshot.createdAt,
  }).onConflictDoUpdate({
    target: subscriptions.subscriptionId,
    set: {
      ...values,
      ...(!canGrantAccess ? {
        userId: null,
        orderId: null,
        customerEmail: null,
        ownerDeletedAt,
        cleanupAfter,
      } : {}),
    },
  }).returning({ id: subscriptions.id })

  if (!subscription) throw new Error(`Subscription ${snapshot.id} was not persisted`)
  return subscription
}

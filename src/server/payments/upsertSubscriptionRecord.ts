import 'server-only'
import { subscriptions } from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'
import type {
  SubscriptionCheckoutOrder,
  SubscriptionSnapshot,
  VerifiedPaymentOffer,
} from '@/types/paymentTypes'

export async function upsertSubscriptionRecord(
  tx: PaymentTransaction,
  snapshot: SubscriptionSnapshot,
  order: SubscriptionCheckoutOrder,
  offer: VerifiedPaymentOffer,
  now: Date
) {
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
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    cancelAt: snapshot.cancelAt,
    canceledAt: snapshot.canceledAt,
    endedAt: snapshot.endedAt,
    updatedAt: now,
  }
  const [subscription] = await tx.insert(subscriptions).values({
    ...values,
    userId: order.userId,
    sessionId: order.stripeSessionId,
    orderId: order.id,
    currency: offer.currency,
    customerId: snapshot.customerId,
    subscriptionId: snapshot.id,
    createdAt: snapshot.createdAt,
  }).onConflictDoUpdate({
    target: subscriptions.subscriptionId,
    set: values,
  }).returning({ id: subscriptions.id })

  if (!subscription) throw new Error(`Subscription ${snapshot.id} was not persisted`)
  return subscription
}

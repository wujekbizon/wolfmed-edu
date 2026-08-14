import 'server-only'
import { payments } from '@/server/db/schema'
import type { PaymentTransaction } from '@/types/dbTypes'
import type {
  SubscriptionCheckoutOrder,
  SubscriptionSnapshot,
  VerifiedPaymentOffer,
} from '@/types/paymentTypes'

export async function upsertSubscriptionPayment(
  tx: PaymentTransaction,
  snapshot: SubscriptionSnapshot,
  order: SubscriptionCheckoutOrder,
  offer: VerifiedPaymentOffer,
  now: Date
): Promise<void> {
  if (!snapshot.latestInvoiceId || snapshot.latestInvoiceAmount === null) return

  await tx.insert(payments).values({
    userId: order.userId,
    orderId: order.id,
    offerKey: offer.key,
    accessTier: offer.accessTier,
    amountTotal: snapshot.latestInvoiceAmount,
    currency: offer.currency,
    paymentStatus: snapshot.latestInvoicePaid ? 'paid' : 'failed',
    courseSlug: offer.courseSlug,
    stripeCustomerId: snapshot.customerId,
    invoiceId: snapshot.latestInvoiceId,
    paymentIntentId: snapshot.latestPaymentIntentId,
    subscriptionId: snapshot.id,
    createdAt: snapshot.currentPeriodStart,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: payments.invoiceId,
      set: {
        paymentStatus: snapshot.latestInvoicePaid ? 'paid' : 'failed',
        amountTotal: snapshot.latestInvoiceAmount,
        paymentIntentId: snapshot.latestPaymentIntentId,
      updatedAt: now,
    },
  })
}

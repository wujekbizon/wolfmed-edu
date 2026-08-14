import 'server-only'
import { payments } from '@/server/db/schema'
import { canGrantPaymentAccess } from '@/helpers/canGrantPaymentAccess'
import { getPaymentRetentionDeadline } from '@/helpers/getPaymentRetentionDeadline'
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
  const canGrantAccess = canGrantPaymentAccess(order.userId, order.ownerDeletedAt)
  const pseudonymizedAt = canGrantAccess ? null : order.ownerDeletedAt ?? now

  await tx.insert(payments).values({
    userId: canGrantAccess ? order.userId : null,
    orderId: canGrantAccess ? order.id : null,
    offerKey: offer.key,
    accessTier: offer.accessTier,
    amountTotal: snapshot.latestInvoiceAmount,
    currency: offer.currency,
    paymentStatus: snapshot.latestInvoicePaid ? 'paid' : 'failed',
    courseSlug: offer.courseSlug,
    stripeCustomerId: canGrantAccess ? snapshot.customerId : null,
    invoiceId: snapshot.latestInvoiceId,
    paymentIntentId: snapshot.latestPaymentIntentId,
    subscriptionId: snapshot.id,
    createdAt: snapshot.currentPeriodStart,
    updatedAt: now,
    retentionUntil: getPaymentRetentionDeadline(snapshot.currentPeriodStart),
    pseudonymizedAt,
  }).onConflictDoUpdate({
    target: payments.invoiceId,
    set: {
      paymentStatus: snapshot.latestInvoicePaid ? 'paid' : 'failed',
      amountTotal: snapshot.latestInvoiceAmount,
      paymentIntentId: snapshot.latestPaymentIntentId,
      updatedAt: now,
      ...(!canGrantAccess ? {
        userId: null,
        orderId: null,
        customerEmail: null,
        stripeCustomerId: null,
        pseudonymizedAt,
        retentionUntil: getPaymentRetentionDeadline(snapshot.currentPeriodStart),
      } : {}),
    },
  })
}

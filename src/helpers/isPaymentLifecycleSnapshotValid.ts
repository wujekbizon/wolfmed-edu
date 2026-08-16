import type {
  PaymentLifecycleRecord,
  PaymentLifecycleSnapshot,
} from '@/types/paymentTypes'

export function isPaymentLifecycleSnapshotValid(
  payment: PaymentLifecycleRecord,
  snapshot: PaymentLifecycleSnapshot
): boolean {
  return (
    payment.paymentStatus === 'paid' &&
    payment.amountTotal === snapshot.amount &&
    payment.currency === snapshot.currency &&
    (payment.pseudonymizedAt !== null ||
      payment.stripeCustomerId === snapshot.customerId) &&
    (!payment.chargeId || payment.chargeId === snapshot.chargeId) &&
    snapshot.chargePaid &&
    snapshot.chargeStatus === 'succeeded' &&
    snapshot.amountRefunded >= 0 &&
    snapshot.amountRefunded <= snapshot.amount
  )
}

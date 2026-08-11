import type Stripe from 'stripe'

export function sumSuccessfulRefundAmounts(refunds: Stripe.Refund[]): number {
  return refunds.reduce(
    (total, refund) => refund.status === 'succeeded' ? total + refund.amount : total,
    0
  )
}

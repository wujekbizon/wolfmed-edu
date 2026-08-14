export type StripePaymentLifecycleEventType =
  | 'charge.refunded'
  | 'refund.created'
  | 'refund.updated'
  | 'refund.failed'
  | 'charge.dispute.created'
  | 'charge.dispute.closed'

export type PaymentRefundStatus = 'none' | 'partial' | 'full'

export type PaymentDisputeStatus = 'none' | 'open' | 'won' | 'lost' | 'resolved'

export type PaymentLifecycleSnapshot = {
  eventObjectId: string
  chargeId: string
  paymentIntentId: string
  customerId: string | null
  amount: number
  amountRefunded: number
  currency: string
  chargePaid: boolean
  chargeStatus: string
  refundStatus: PaymentRefundStatus
  disputeStatus: PaymentDisputeStatus | null
}

export type PaymentLifecycleRecord = {
  amountTotal: number
  currency: string | null
  stripeCustomerId: string | null
  chargeId: string | null
  paymentStatus: string
}

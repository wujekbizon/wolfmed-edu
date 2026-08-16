import type {
  PaymentDisputeStatus,
  PaymentRefundStatus,
} from '@/types/paymentTypes'

export function shouldRevokePaymentEntitlement(
  refundStatus: PaymentRefundStatus,
  disputeStatus: PaymentDisputeStatus
): boolean {
  return refundStatus === 'full' || disputeStatus === 'lost'
}

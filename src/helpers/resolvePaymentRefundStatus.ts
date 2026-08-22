import type { PaymentRefundStatus } from '@/types/paymentTypes'

export function resolvePaymentRefundStatus(
  amount: number,
  amountRefunded: number
): PaymentRefundStatus {
  if (amountRefunded <= 0) return 'none'
  return amountRefunded >= amount ? 'full' : 'partial'
}

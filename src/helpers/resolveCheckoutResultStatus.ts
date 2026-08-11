import type {
  CheckoutResultResolution,
  CheckoutResultStatus,
} from '@/types/paymentTypes'

export function resolveCheckoutResultStatus({
  currentUserId,
  checkoutUserId,
  paymentStatus,
  sessionStatus,
  orderStatus,
}: CheckoutResultResolution): CheckoutResultStatus {
  if (currentUserId !== checkoutUserId) return 'invalid'
  if (paymentStatus === 'paid') return 'paid'
  if (orderStatus === 'FAILED' || sessionStatus === 'expired') return 'failed'
  return 'processing'
}

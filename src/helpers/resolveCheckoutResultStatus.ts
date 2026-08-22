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
}: CheckoutResultResolution): Exclude<CheckoutResultStatus, 'scheduled' | 'unavailable'> {
  if (currentUserId !== checkoutUserId) return 'invalid'
  if (paymentStatus === 'paid') return 'paid'
  if (orderStatus === 'FAILED' || sessionStatus === 'expired') return 'failed'
  return 'processing'
}

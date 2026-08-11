import type {
  CheckoutPaymentState,
  StripeCheckoutEventType,
} from '@/types/paymentTypes'

export function resolveCheckoutPaymentState(
  eventType: StripeCheckoutEventType,
  paymentStatus: string
): CheckoutPaymentState {
  if (paymentStatus === 'paid') return 'paid'
  if (eventType === 'checkout.session.async_payment_succeeded') return 'invalid'
  if (eventType === 'checkout.session.async_payment_failed') return 'failed'
  return 'processing'
}

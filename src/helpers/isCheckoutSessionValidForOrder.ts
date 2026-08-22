import type {
  CheckoutSessionExpectation,
  CheckoutSessionSnapshot,
} from '@/types/paymentTypes'

export function isCheckoutSessionValidForOrder(
  session: CheckoutSessionSnapshot,
  expected: CheckoutSessionExpectation
): boolean {
  const [lineItem] = session.lineItems

  return (
    session.mode === (expected.purchaseModel === 'subscription' ? 'subscription' : 'payment') &&
    (!expected.sessionId || session.id === expected.sessionId) &&
    session.clientReferenceId === expected.userId &&
    session.customerId === expected.customerId &&
    session.amountTotal === expected.amount &&
    session.currency === expected.currency &&
    session.lineItems.length === 1 &&
    lineItem?.priceId === expected.priceId &&
    lineItem?.quantity === 1
  )
}

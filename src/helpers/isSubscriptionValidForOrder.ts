import type {
  SubscriptionExpectation,
  SubscriptionSnapshot,
} from '@/types/paymentTypes'

export function isSubscriptionValidForOrder(
  snapshot: SubscriptionSnapshot,
  expected: SubscriptionExpectation
): boolean {
  return (
    expected.purchaseModel === 'subscription' &&
    snapshot.orderId === expected.orderId &&
    snapshot.customerId === expected.customerId &&
    snapshot.priceId === expected.offer.priceId &&
    snapshot.amount === expected.offer.amount &&
    snapshot.currency === expected.offer.currency &&
    expected.courseSlug === expected.offer.courseSlug
  )
}

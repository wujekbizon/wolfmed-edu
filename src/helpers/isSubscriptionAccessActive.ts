import type { SubscriptionSnapshot } from '@/types/paymentTypes'

export function isSubscriptionAccessActive(snapshot: SubscriptionSnapshot): boolean {
  return (
    (snapshot.status === 'active' || snapshot.status === 'trialing') &&
    snapshot.latestInvoicePaid
  )
}

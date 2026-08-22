import type {
  BillingDateSummary,
  BillingSubscription,
} from '@/types/billingTypes'

export function getSubscriptionBillingDate(
  subscription: BillingSubscription
): BillingDateSummary | null {
  if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
    return null
  }
  if (subscription.cancelAt) {
    return { date: subscription.cancelAt, label: 'dostęp do' }
  }
  if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
    return { date: subscription.currentPeriodEnd, label: 'dostęp do' }
  }
  return subscription.currentPeriodEnd
    ? { date: subscription.currentPeriodEnd, label: 'odnowienie' }
    : null
}

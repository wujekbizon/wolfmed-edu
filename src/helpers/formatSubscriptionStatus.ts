import { SUBSCRIPTION_STATUS_LABELS } from '@/constants/subscriptionStatus'

export function formatSubscriptionStatus(status: string): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status
}

import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import type {
  CheckoutResultStatus,
  SubscriptionSnapshot,
} from '@/types/paymentTypes'

export function resolveSubscriptionResultStatus(
  snapshot: SubscriptionSnapshot
): Exclude<CheckoutResultStatus, 'invalid' | 'unavailable' | 'scheduled'> {
  if (isSubscriptionAccessActive(snapshot)) return 'paid'
  if (snapshot.status === 'incomplete') return 'processing'
  return 'failed'
}

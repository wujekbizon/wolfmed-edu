import type Stripe from 'stripe'
import type { PaymentDisputeStatus } from '@/types/paymentTypes'

export function resolvePaymentDisputeStatus(
  statuses: Stripe.Dispute.Status[]
): PaymentDisputeStatus {
  if (statuses.length === 0) return 'none'
  if (statuses.includes('lost')) return 'lost'
  if (statuses.every((status) => status === 'won')) return 'won'
  if (statuses.every((status) => (
    status === 'prevented' || status === 'warning_closed' || status === 'won'
  ))) return 'resolved'
  return 'open'
}

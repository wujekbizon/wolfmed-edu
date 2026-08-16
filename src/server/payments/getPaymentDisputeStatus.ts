import 'server-only'
import { resolvePaymentDisputeStatus } from '@/helpers/resolvePaymentDisputeStatus'
import stripe from '@/lib/stripeClient'
import type { PaymentDisputeStatus } from '@/types/paymentTypes'
import type Stripe from 'stripe'

export async function getPaymentDisputeStatus(
  paymentIntentId: string
): Promise<PaymentDisputeStatus> {
  const statuses: Stripe.Dispute.Status[] = []
  for await (const dispute of stripe.disputes.list({
    payment_intent: paymentIntentId,
  })) {
    statuses.push(dispute.status)
  }
  return resolvePaymentDisputeStatus(statuses)
}

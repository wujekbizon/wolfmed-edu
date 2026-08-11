import 'server-only'
import { sumSuccessfulRefundAmounts } from '@/helpers/sumSuccessfulRefundAmounts'
import stripe from '@/lib/stripeClient'

export async function getSuccessfulRefundAmount(
  paymentIntentId: string
): Promise<number> {
  const refunds = []
  for await (const refund of stripe.refunds.list({ payment_intent: paymentIntentId })) {
    refunds.push(refund)
  }
  return sumSuccessfulRefundAmounts(refunds)
}

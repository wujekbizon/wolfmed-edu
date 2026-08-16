import 'server-only'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import { resolvePaymentRefundStatus } from '@/helpers/resolvePaymentRefundStatus'
import stripe from '@/lib/stripeClient'
import { getSuccessfulRefundAmount } from '@/server/payments/getSuccessfulRefundAmount'
import type {
  PaymentDisputeStatus,
  PaymentLifecycleSnapshot,
} from '@/types/paymentTypes'

export async function getChargeLifecycleSnapshot(
  chargeId: string,
  eventObjectId: string,
  disputeStatus: PaymentDisputeStatus | null
): Promise<PaymentLifecycleSnapshot> {
  const charge = await stripe.charges.retrieve(chargeId)
  const paymentIntentId = getStripeObjectId(charge.payment_intent)
  if (!paymentIntentId) throw new Error(`Charge ${charge.id} has no PaymentIntent`)
  const amountRefunded = await getSuccessfulRefundAmount(paymentIntentId)

  return {
    eventObjectId,
    chargeId: charge.id,
    paymentIntentId,
    customerId: getStripeObjectId(charge.customer),
    amount: charge.amount,
    amountRefunded,
    currency: charge.currency,
    chargePaid: charge.paid,
    chargeStatus: charge.status,
    refundStatus: resolvePaymentRefundStatus(charge.amount, amountRefunded),
    disputeStatus,
  }
}

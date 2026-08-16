import 'server-only'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import stripe from '@/lib/stripeClient'
import { getChargeLifecycleSnapshot } from '@/server/payments/getChargeLifecycleSnapshot'
import { getPaymentDisputeStatus } from '@/server/payments/getPaymentDisputeStatus'
import type {
  PaymentLifecycleSnapshot,
  StripePaymentLifecycleEventType,
} from '@/types/paymentTypes'
import type Stripe from 'stripe'

export async function getPaymentLifecycleSnapshot(
  event: Stripe.Event
): Promise<PaymentLifecycleSnapshot> {
  const eventType = event.type as StripePaymentLifecycleEventType
  if (eventType === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    return getChargeLifecycleSnapshot(charge.id, charge.id, null)
  }
  if (eventType.startsWith('refund.')) {
    const eventRefund = event.data.object as Stripe.Refund
    const refund = await stripe.refunds.retrieve(eventRefund.id)
    const chargeId = getStripeObjectId(refund.charge)
    if (!chargeId) throw new Error(`Refund ${refund.id} has no Charge`)
    return getChargeLifecycleSnapshot(chargeId, refund.id, null)
  }

  const eventDispute = event.data.object as Stripe.Dispute
  const dispute = await stripe.disputes.retrieve(eventDispute.id)
  const paymentIntentId = getStripeObjectId(dispute.payment_intent)
  const chargeId = getStripeObjectId(dispute.charge)
  if (!paymentIntentId || !chargeId) {
    throw new Error(`Dispute ${dispute.id} has no payment identifiers`)
  }

  const disputeStatus = await getPaymentDisputeStatus(paymentIntentId)
  return getChargeLifecycleSnapshot(chargeId, dispute.id, disputeStatus)
}

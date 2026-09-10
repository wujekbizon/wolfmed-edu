import 'server-only'
import type Stripe from 'stripe'
import stripe from '@/lib/stripeClient'
import { STRIPE_REPORT_REQUEST_OPTIONS } from '@/constants/stripeReports'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import type { StripeReportSource } from '@/types/stripeReportTypes'

export async function getReportSource(
  transaction: Stripe.BalanceTransaction
): Promise<StripeReportSource> {
  let source = transaction.source
  if (!source) throw new Error('Brak źródła transakcji Stripe.')
  if (typeof source === 'string') {
    source = transaction.type.includes('refund')
      ? await stripe.refunds.retrieve(source, {}, STRIPE_REPORT_REQUEST_OPTIONS)
      : await stripe.charges.retrieve(source, {}, STRIPE_REPORT_REQUEST_OPTIONS)
  }
  if (source.object === 'charge') return { transaction, charge: source, refund: null }
  if (source.object !== 'refund') throw new Error('Nieobsługiwane źródło transakcji Stripe.')
  const chargeId = getStripeObjectId(source.charge)
  if (!chargeId) throw new Error('Brak płatności dla zwrotu.')
  const charge = await stripe.charges.retrieve(chargeId, {}, STRIPE_REPORT_REQUEST_OPTIONS)
  return { transaction, charge, refund: source }
}

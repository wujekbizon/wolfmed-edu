import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import type { StripeReportBilling, StripeReportRow, StripeReportSource } from '@/types/stripeReportTypes'

export function toStripeReportRow(
  { transaction, charge, refund }: StripeReportSource,
  billing: StripeReportBilling
): StripeReportRow {
  const included = refund ? refund.status === 'succeeded'
    : charge.paid && charge.captured && charge.status === 'succeeded'
  return {
    ...billing, id: transaction.id, chargeId: charge.id,
    paymentIntentId: getStripeObjectId(charge.payment_intent),
    customerId: getStripeObjectId(charge.customer), date: transaction.created,
    kind: refund ? 'refund' : 'payment', amount: transaction.amount,
    currency: transaction.currency, fee: transaction.fee, net: transaction.net,
    originalAmount: refund ? -refund.amount : charge.amount_captured,
    originalCurrency: refund?.currency ?? charge.currency,
    exchangeRate: transaction.exchange_rate,
    method: charge.payment_method_details?.type ?? 'Brak danych',
    status: refund?.status ?? (included ? 'paid' : charge.status),
    included, disputed: charge.disputed,
  }
}

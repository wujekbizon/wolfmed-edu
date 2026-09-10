import type Stripe from 'stripe'
import { STRIPE_REPORT_TYPES } from '@/constants/stripeReports'
import { toStripeReportRow } from './toStripeReportRow'
import type { StripeReportBilling, StripeReportReader, StripeReportRow } from '@/types/stripeReportTypes'

export async function readStripeReportRows(
  transactions: AsyncIterable<Stripe.BalanceTransaction>,
  reader: StripeReportReader,
  deadline = Date.now() + 240_000
): Promise<StripeReportRow[]> {
  const selected = new Map<string, Stripe.BalanceTransaction>()
  for await (const transaction of transactions) {
    if (Date.now() > deadline) throw new Error('Przekroczono czas pobierania raportu.')
    if (STRIPE_REPORT_TYPES.includes(transaction.type)) selected.set(transaction.id, transaction)
  }
  const cache = new Map<string, Promise<StripeReportBilling>>()
  const rows: StripeReportRow[] = []
  const all = [...selected.values()]
  for (let index = 0; index < all.length; index += 4) {
    if (Date.now() > deadline) throw new Error('Przekroczono czas pobierania raportu.')
    const batch = await Promise.all(all.slice(index, index + 4).map(async (transaction) => {
      const source = await reader.source(transaction)
      let billing = cache.get(source.charge.id)
      if (!billing) {
        billing = reader.billing(source.charge)
        cache.set(source.charge.id, billing)
      }
      return toStripeReportRow(source, await billing)
    }))
    rows.push(...batch)
  }
  return rows.sort((a, b) => b.date - a.date || a.id.localeCompare(b.id))
}

import type { StripeReportRow, StripeReportTotal } from '@/types/stripeReportTypes'

export function summarizeStripeReport(rows: StripeReportRow[]): StripeReportTotal[] {
  const totals = new Map<string, StripeReportTotal>()
  for (const row of rows) {
    if (!row.included) continue
    const total = totals.get(row.currency) ?? {
      currency: row.currency, count: 0, payments: 0, refunds: 0,
    }
    if (row.kind === 'payment') {
      total.count++
      total.payments += row.amount
    } else total.refunds += row.amount
    totals.set(row.currency, total)
  }
  return [...totals.values()].sort((a, b) => a.currency.localeCompare(b.currency))
}

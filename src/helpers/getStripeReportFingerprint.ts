import { createHash } from 'node:crypto'
import type { StripeReportPeriod, StripeReportRow } from '@/types/stripeReportTypes'

export function getStripeReportFingerprint(
  period: StripeReportPeriod,
  livemode: boolean,
  rows: StripeReportRow[]
): string {
  const stableRows = rows.map((row) => ({
    ...row,
    invoices: row.invoices.map(({ pdf: _pdf, ...invoice }) => invoice),
  }))
  return createHash('sha256')
    .update(JSON.stringify({ period, livemode, rows: stableRows }))
    .digest('hex')
}

import 'server-only'
import stripe from '@/lib/stripeClient'
import { ensureAdmin } from '@/helpers/ensureAdmin'
import { checkRateLimit } from '@/lib/rateLimit'
import { StripeReportMonthSchema } from '@/server/schema'
import { getStripeReportPeriod } from '@/helpers/getStripeReportPeriod'
import { summarizeStripeReport } from '@/helpers/summarizeStripeReport'
import { readStripeReportRows } from '@/helpers/readStripeReportRows'
import { getStripeReportFingerprint } from '@/helpers/getStripeReportFingerprint'
import { getReportSource } from './getReportSource'
import { getReportBilling } from './getReportBilling'
import { STRIPE_REPORT_REQUEST_OPTIONS } from '@/constants/stripeReports'
import type { StripeReport } from '@/types/stripeReportTypes'

export async function getStripeReport(month: unknown): Promise<StripeReport> {
  const userId = await ensureAdmin()
  const parsed = StripeReportMonthSchema.safeParse({ month })
  if (!parsed.success) throw new Error('Wybierz poprawny, zakończony miesiąc.')
  if (!(await checkRateLimit(userId, 'stripe:report')).success) {
    throw new Error('Zbyt wiele raportów. Spróbuj ponownie za minutę.')
  }
  const period = getStripeReportPeriod(parsed.data.month)
  const { livemode } = await stripe.balance.retrieve({}, STRIPE_REPORT_REQUEST_OPTIONS)
  const sorted = await readStripeReportRows(stripe.balanceTransactions.list({
    created: { gte: period.start, lt: period.end }, limit: 100, expand: ['data.source'],
  }, STRIPE_REPORT_REQUEST_OPTIONS), { source: getReportSource, billing: getReportBilling })
  const fingerprint = getStripeReportFingerprint(period, livemode, sorted)
  return {
    period, livemode, rows: sorted, fingerprint, generatedAt: Math.floor(Date.now() / 1000),
    totals: summarizeStripeReport(sorted),
    missingAddresses: sorted.filter((row) => row.missingAddress).length,
  }
}

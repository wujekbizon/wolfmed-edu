import { STRIPE_REPORT_TIMEZONE } from '@/constants/stripeReports'

export function getPreviousStripeReportMonth(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: STRIPE_REPORT_TIMEZONE, year: 'numeric', month: '2-digit',
  }).formatToParts(now)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  return new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7)
}

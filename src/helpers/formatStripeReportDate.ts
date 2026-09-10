import { STRIPE_REPORT_TIMEZONE } from '@/constants/stripeReports'

export function formatStripeReportDate(timestamp: number): string {
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: STRIPE_REPORT_TIMEZONE, dateStyle: 'short', timeStyle: 'medium',
  }).format(new Date(timestamp * 1000))
}

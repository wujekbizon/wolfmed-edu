import { STRIPE_REPORT_TIMEZONE } from '@/constants/stripeReports'
import type { StripeReportPeriod } from '@/types/stripeReportTypes'

export function getStripeReportPeriod(month: string): StripeReportPeriod {
  const [year, monthNumber] = month.split('-').map(Number) as [number, number]
  const boundaries = [monthNumber - 1, monthNumber].map((index) => {
    const utc = Date.UTC(year, index, 1)
    const offset = new Intl.DateTimeFormat('en', {
      timeZone: STRIPE_REPORT_TIMEZONE, timeZoneName: 'shortOffset',
    }).formatToParts(utc).find((part) => part.type === 'timeZoneName')?.value
    const hours = Number(offset?.replace('GMT', ''))
    if (!Number.isFinite(hours)) throw new Error('Nieprawidłowa strefa czasowa.')
    return (utc - hours * 3_600_000) / 1000
  })
  return {
    month, start: boundaries[0]!, end: boundaries[1]!,
    label: new Intl.DateTimeFormat('pl-PL', {
      timeZone: STRIPE_REPORT_TIMEZONE, month: 'long', year: 'numeric',
    }).format(new Date(Date.UTC(year, monthNumber - 1, 15))),
  }
}

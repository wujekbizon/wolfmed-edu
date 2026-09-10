import { requireAdmin } from '@/helpers/requireAdmin'
import { getPreviousStripeReportMonth } from '@/helpers/getPreviousStripeReportMonth'
import { getStripeReport } from '@/server/stripe-reports/getStripeReport'
import { StripeReportMonthSchema } from '@/server/schema'
import { getGmailReportStatus } from '@/server/gmail-reports/getGmailReportConnection'
import StripeReportMonthForm from './StripeReportMonthForm'
import StripeReportPanel from './StripeReportPanel'
import type { StripeReport, StripeReportPageProps } from '@/types/stripeReportTypes'

export default async function StripeReportContent({ searchParams }: StripeReportPageProps) {
  const { userId } = await requireAdmin()
  const query = await searchParams
  const gmailStatus = await getGmailReportStatus()
  const month = query.month ?? getPreviousStripeReportMonth()
  const parsed = StripeReportMonthSchema.safeParse({ month })
  let report: StripeReport | null = null
  let error = parsed.success ? '' : 'Wybierz poprawny, zakończony miesiąc.'
  if (parsed.success) {
    try {
      report = await getStripeReport(parsed.data.month)
    } catch {
      error = 'Nie udało się pobrać pełnego raportu. Spróbuj ponownie.'
    }
  }
  return (
    <section className="space-y-6 text-zinc-900">
      <h1 className="text-2xl font-bold">Raporty Stripe</h1>
      <StripeReportMonthForm key={String(month)} month={parsed.success ? parsed.data.month : getPreviousStripeReportMonth()} />
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {report && <StripeReportPanel
        key={`${userId}:${report.period.month}`}
        report={report}
        userId={userId}
        gmailStatus={gmailStatus}
        oauthStatus={typeof query.gmail === 'string' ? query.gmail : ''}
      />}
    </section>
  )
}

'use client'

import Button from '@/components/ui/Button'
import { useStripeReport } from '@/hooks/useStripeReport'
import { useStripeReportDownload } from '@/hooks/useStripeReportDownload'
import { formatStripeReportDate } from '@/helpers/formatStripeReportDate'
import StripeReportSummary from './StripeReportSummary'
import StripeReportTable from './StripeReportTable'
import GmailReportCard from './GmailReportCard'
import type { StripeReport } from '@/types/stripeReportTypes'
import type { GmailReportStatus } from '@/types/gmailReportTypes'

export default function StripeReportPanel({
  report,
  userId,
  gmailStatus,
  oauthStatus,
}: {
  report: StripeReport
  userId: string
  gmailStatus: GmailReportStatus
  oauthStatus: string
}) {
  const query = useStripeReport(report, userId)
  const current = query.data
  const pdf = useStripeReportDownload(current)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold capitalize">{current.period.label}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={query.isFetching || pdf.pending} onClick={() => void query.refetch()}>
            {query.isFetching ? 'Odświeżanie…' : 'Odśwież'}
          </Button>
          <Button disabled={query.isFetching || query.isError || pdf.pending} onClick={() => void pdf.download()}>
            {pdf.pending ? 'Generowanie…' : 'Generuj PDF + hasło'}
          </Button>
        </div>
      </div>
      {!current.livemode && <p className="font-bold text-amber-800">TRYB TESTOWY — dane nie do księgowania</p>}
      <p className="text-sm text-zinc-600">Płatności i zwroty; bez wypłat, opłat zbiorczych i rozliczenia sporów. Dane pobrane: {formatStripeReportDate(current.generatedAt)}.</p>
      {(query.isError || pdf.error) && <p role="alert" className="text-red-700">{pdf.error || 'Odświeżenie nie powiodło się. Pokazano poprzednie dane; pobieranie zablokowane.'}</p>}
      <StripeReportSummary report={current} />
      <GmailReportCard report={current} status={gmailStatus} oauthStatus={oauthStatus} />
      <StripeReportTable rows={current.rows} />
    </div>
  )
}

import Card from '@/components/ui/Card'
import { formatStripeReportMoney } from '@/helpers/formatStripeReportMoney'
import type { StripeReport } from '@/types/stripeReportTypes'

export default function StripeReportSummary({ report }: { report: StripeReport }) {
  return (
    <Card className="space-y-2 p-5">
      {report.totals.map((total) => (
        <p key={total.currency}>
          Płatności: <strong>{total.count}</strong> · Suma brutto: <strong>{formatStripeReportMoney(total.payments, total.currency)}</strong>
          {' '}· Zwroty: <strong>{formatStripeReportMoney(total.refunds, total.currency)}</strong>
        </p>
      ))}
      <p>Brak pełnego adresu: {report.missingAddresses}. Wiersze poza sumami: {report.rows.filter((row) => !row.included).length}.</p>
      <p className="text-sm text-zinc-600">Brakujące dane pozostają w raporcie. Kwoty brutto przed opłatami Stripe.</p>
    </Card>
  )
}

import { formatStripeReportDate } from '@/helpers/formatStripeReportDate'
import { formatStripeReportMoney } from '@/helpers/formatStripeReportMoney'
import type { StripeReportRow } from '@/types/stripeReportTypes'

export default function StripeReportTableRow({ row, index }: { row: StripeReportRow; index: number }) {
  return (
    <tr className="border-t border-zinc-200 align-top odd:bg-white even:bg-zinc-50">
      <td className="p-3">{index + 1}</td>
      <td className="whitespace-nowrap p-3">{formatStripeReportMoney(row.amount, row.currency)}<br />{row.kind === 'refund' ? 'Zwrot' : 'Płatność'}</td>
      <td className="p-3">{formatStripeReportDate(row.date)}</td>
      <td className="p-3">{row.method}<br />{row.status}{row.disputed && <p className="text-red-700">Spór</p>}{!row.included && <p>Poza sumami</p>}</td>
      <td className="min-w-60 max-w-96 break-words p-3">
        <p className="font-medium">{row.name || 'Brak danych'}</p>
        <p>{row.email || 'Brak e-maila'}</p><p>{row.address || 'Brak danych adresowych'}</p>
        {row.missingAddress && <p className="text-amber-800">Niepełny adres</p>}
        {row.taxIds && <p>NIP / ID podatkowe: {row.taxIds}</p>}
      </td>
      <td className="p-3">
        <details className="max-w-80 break-words">
          <summary className="cursor-pointer">Dane Stripe / faktury</summary>
          <p>{row.id}</p><p>{row.chargeId}</p><p>{row.paymentIntentId}</p><p>{row.customerId}</p>
          <p>Źródła danych klienta: {row.sources || 'Brak danych'}</p>
          <p>Płatność źródłowa: {formatStripeReportMoney(row.originalAmount, row.originalCurrency)}</p>
          <p>Opłata: {formatStripeReportMoney(row.fee, row.currency)}</p>
          <p>Wpływ netto na saldo: {formatStripeReportMoney(row.net, row.currency)}</p>
          {row.exchangeRate && <p>Kurs Stripe: {row.exchangeRate}</p>}
          {row.invoices.map((invoice) => (
            <p key={invoice.id}>{invoice.number}: {formatStripeReportMoney(invoice.total, invoice.currency)}
              {' '}· Podatek: {formatStripeReportMoney(invoice.tax, invoice.currency)}
              {invoice.pdf && <a href={invoice.pdf} target="_blank" rel="noreferrer" className="ml-2 underline">PDF faktury Stripe</a>}
            </p>
          ))}
        </details>
      </td>
    </tr>
  )
}

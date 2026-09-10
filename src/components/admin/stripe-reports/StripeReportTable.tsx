import StripeReportTableRow from './StripeReportTableRow'
import type { StripeReportRow } from '@/types/stripeReportTypes'

export default function StripeReportTable({ rows }: { rows: StripeReportRow[] }) {
  if (!rows.length) return <p>Brak płatności i zwrotów w wybranym miesiącu.</p>
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Zestawienie transakcji Stripe</caption>
        <thead className="bg-zinc-100">
          <tr>{['Lp.', 'Kwota brutto', 'Data wpływu', 'Metoda / status', 'Klient / adres', 'Szczegóły'].map((label) => (
            <th key={label} scope="col" className="p-3">{label}</th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row, index) => <StripeReportTableRow key={row.id} row={row} index={index} />)}</tbody>
      </table>
    </div>
  )
}

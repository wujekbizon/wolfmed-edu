import { Link, Text, View } from '@react-pdf/renderer'
import { formatStripeReportDate } from '@/helpers/formatStripeReportDate'
import { formatStripeReportMoney } from '@/helpers/formatStripeReportMoney'
import { reportPdfColumns, reportPdfStyles as styles } from './styles'
import type { StripeReportRow } from '@/types/stripeReportTypes'

export default function StripeReportPdfRow({ row, index }: { row: StripeReportRow; index: number }) {
  const cells = [
    String(index + 1),
    `${formatStripeReportMoney(row.amount, row.currency)}\n${row.kind === 'refund' ? 'Zwrot' : 'Płatność'}`,
    formatStripeReportDate(row.date),
    [row.method, row.status, row.disputed ? 'Spór' : '', row.included ? '' : 'Poza sumami'].filter(Boolean).join('\n'),
    row.email || 'Brak danych', row.name || 'Brak danych',
    [row.address || 'Brak danych', row.missingAddress ? 'Niepełny adres' : '', row.taxIds].filter(Boolean).join('\n'),
  ]
  const invoices = row.invoices.filter((invoice) => invoice.pdf)
  return (
    <View wrap={false} style={[styles.row, { backgroundColor: index % 2 ? '#f8fafc' : '#ffffff' }]}>
      {cells.map((cell, column) => (
        <Text key={column} style={[styles.cell, { width: reportPdfColumns[column]!.width }]}>{cell}</Text>
      ))}
      <View style={[styles.cell, { width: reportPdfColumns[7]!.width }]}>
        {invoices.length ? invoices.map((invoice) => (
          <Link key={invoice.id} src={invoice.pdf!} style={styles.link}>Pobierz fakturę</Link>
        )) : <Text>Brak faktury</Text>}
      </View>
    </View>
  )
}

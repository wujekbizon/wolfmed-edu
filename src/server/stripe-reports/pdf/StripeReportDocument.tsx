import { Document, Page, Text, View } from '@react-pdf/renderer'
import { formatStripeReportDate } from '@/helpers/formatStripeReportDate'
import { formatStripeReportMoney } from '@/helpers/formatStripeReportMoney'
import StripeReportPdfRow from './StripeReportPdfRow'
import { reportPdfColumns, reportPdfStyles as styles } from './styles'
import type { StripeReport, StripeReportPdfSecurity } from '@/types/stripeReportTypes'

export default function StripeReportDocument({
  report,
  security,
}: {
  report: StripeReport
  security: StripeReportPdfSecurity
}) {
  return (
    <Document
      title={`Zestawienie transakcji Stripe - ${report.period.label}`}
      author="Wolfmed"
      language="pl"
      pdfVersion="1.7ext3"
      userPassword={security.userPassword}
      ownerPassword={security.ownerPassword}
      permissions={{ printing: 'highResolution', copying: true, contentAccessibility: true }}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View fixed style={styles.heading}>
          <Text style={styles.title}>Zestawienie transakcji Stripe{report.livemode ? '' : ' - TRYB TESTOWY'}</Text>
          <Text style={styles.period}>Okres rozliczeniowy: {report.period.label}</Text>
        </View>
        <View fixed style={styles.header}>
          {reportPdfColumns.map((column) => <Text key={column.title} style={[styles.cell, { width: column.width }]}>{column.title}</Text>)}
        </View>
        {report.rows.map((row, index) => <StripeReportPdfRow key={row.id} row={row} index={index} />)}
        {!report.rows.length && <Text>Brak płatności i zwrotów w wybranym miesiącu.</Text>}
        <View wrap={false} style={styles.summary}>
          {report.totals.map((total) => (
            <Text key={total.currency}>Liczba płatności: {total.count} · Suma brutto: {formatStripeReportMoney(total.payments, total.currency)} · Zwroty: {formatStripeReportMoney(total.refunds, total.currency)}</Text>
          ))}
          <Text style={styles.note}>Brak pełnego adresu: {report.missingAddresses}. Wiersze poza sumami: {report.rows.filter((row) => !row.included).length}.</Text>
          <Text style={styles.note}>Płatności i zwroty; bez wypłat, opłat zbiorczych i rozliczenia sporów. Kwoty brutto przed opłatami Stripe. Brak danych oznacza brak danych historycznych w Stripe.</Text>
        </View>
        <Text fixed style={styles.footer} render={({ pageNumber, totalPages }) => `Wygenerowano: ${formatStripeReportDate(report.generatedAt)} · ${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}

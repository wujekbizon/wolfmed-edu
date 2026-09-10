import 'server-only'
import path from 'node:path'
import { Font, renderToBuffer } from '@react-pdf/renderer'
import StripeReportDocument from './StripeReportDocument'
import type { StripeReport, StripeReportPdfSecurity } from '@/types/stripeReportTypes'

Font.register({
  family: 'ReportNoto',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/stripe-report/NotoSans-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public/fonts/stripe-report/NotoSans-Bold.ttf'), fontWeight: 700 },
  ],
})

export async function renderStripeReport(report: StripeReport, security: StripeReportPdfSecurity) {
  return renderToBuffer(<StripeReportDocument report={report} security={security} />)
}

import { readReportRequest } from '@/server/stripe-reports/readReportRequest'
import { renderStripeReport } from '@/server/stripe-reports/pdf/renderStripeReport'
import { STRIPE_REPORT_HEADERS } from '@/constants/stripeReports'
import { createStripeReportPdfSecurity } from '@/helpers/createStripeReportPdfSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
  const report = await readReportRequest(request, true)
  if (report instanceof Response) return report
  try {
    const security = createStripeReportPdfSecurity()
    const buffer = await renderStripeReport(report, security)
    return new Response(new Uint8Array(buffer), {
      headers: {
        ...STRIPE_REPORT_HEADERS,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Zestawienie_transakcji_Stripe_${report.period.month}.pdf"`,
        'X-Report-Password': security.userPassword,
      },
    })
  } catch {
    return Response.json({ error: 'Nie udało się wygenerować PDF.' }, {
      status: 500, headers: STRIPE_REPORT_HEADERS,
    })
  }
}

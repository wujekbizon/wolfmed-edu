import { readReportRequest } from '@/server/stripe-reports/readReportRequest'
import { STRIPE_REPORT_HEADERS } from '@/constants/stripeReports'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const report = await readReportRequest(request)
  return report instanceof Response ? report : Response.json(report, { headers: STRIPE_REPORT_HEADERS })
}

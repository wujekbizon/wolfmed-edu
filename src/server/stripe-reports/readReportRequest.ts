import 'server-only'
import { ensureAdmin } from '@/helpers/ensureAdmin'
import { StripeReportDownloadSchema, StripeReportMonthSchema } from '@/server/schema'
import { STRIPE_REPORT_HEADERS } from '@/constants/stripeReports'
import { getStripeReport } from './getStripeReport'

export async function readReportRequest(request: Request, pdf = false) {
  const headers = STRIPE_REPORT_HEADERS
  try {
    await ensureAdmin()
  } catch {
    return Response.json({ error: 'Brak dostępu.' }, { status: 403, headers })
  }
  const search = new URL(request.url).searchParams
  const schema = pdf ? StripeReportDownloadSchema : StripeReportMonthSchema
  const parsed = schema.safeParse(Object.fromEntries(search))
  if (!parsed.success) return Response.json({ error: 'Nieprawidłowe parametry.' }, { status: 400, headers })
  try {
    const report = await getStripeReport(parsed.data.month)
    if (pdf && search.get('fingerprint') !== report.fingerprint) {
      return Response.json({ error: 'Odśwież raport.' }, { status: 409, headers })
    }
    return report
  } catch {
    return Response.json({ error: 'Nie udało się pobrać pełnego raportu.' }, { status: 503, headers })
  }
}

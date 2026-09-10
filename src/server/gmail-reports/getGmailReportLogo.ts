import 'server-only'
import { GMAIL_REPORT_LOGO_URL } from '@/constants/gmailReports'

export async function getGmailReportLogo(): Promise<Buffer> {
  const response = await fetch(GMAIL_REPORT_LOGO_URL, { next: { revalidate: 86_400 } })
  if (!response.ok) throw new Error('Nie udało się pobrać logo Wolfmed.')
  return Buffer.from(await response.arrayBuffer())
}

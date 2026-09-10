import 'server-only'
import { createStripeReportPdfSecurity } from '@/helpers/createStripeReportPdfSecurity'
import { renderStripeReport } from '@/server/stripe-reports/pdf/renderStripeReport'
import { buildGmailPdfMessage } from './buildGmailPdfMessage'
import { buildGmailTextMessage } from './buildGmailTextMessage'
import { sendGmailRawMessage } from './sendGmailRawMessage'
import { getGmailReportLogo } from './getGmailReportLogo'
import { buildStripeReportPdfEmailHtml } from '@/helpers/buildStripeReportPdfEmailHtml'
import { buildStripeReportPasswordEmailHtml } from '@/helpers/buildStripeReportPasswordEmailHtml'
import type { GmailReportConnection } from '@/types/gmailReportTypes'
import type { StripeReport } from '@/types/stripeReportTypes'

export async function sendStripeReportEmails(
  connection: GmailReportConnection,
  recipient: string,
  report: StripeReport
) {
  const security = createStripeReportPdfSecurity()
  const [pdf, logo] = await Promise.all([
    renderStripeReport(report, security),
    getGmailReportLogo(),
  ])
  const filename = `Zestawienie_transakcji_Stripe_${report.period.month}.pdf`
  const subject = `Wolfmed | Raport Stripe - ${report.period.label}`
  const pdfMessage = buildGmailPdfMessage(
    recipient,
    subject,
    `Dzień dobry,\n\nw załączniku przesyłam raport Stripe za ${report.period.label}. Hasło prześlę w osobnej wiadomości.\n\nPozdrawiam,\nWolfmed Edukacja`,
    buildStripeReportPdfEmailHtml(report.period.label),
    filename,
    pdf,
    logo
  )
  await sendGmailRawMessage(connection.refreshToken, pdfMessage)
  const passwordMessage = buildGmailTextMessage(
    recipient,
    `Wolfmed | Hasło do raportu Stripe - ${report.period.label}`,
    `Hasło do pliku ${filename}: ${security.userPassword}\n\nPozdrawiam,\nWolfmed Edukacja`,
    buildStripeReportPasswordEmailHtml(report.period.label, security.userPassword),
    logo
  )
  await sendGmailRawMessage(connection.refreshToken, passwordMessage)
}

import 'server-only'
import { cookies } from 'next/headers'
import { GMAIL_REPORT_CONNECTION_COOKIE } from '@/constants/gmailReports'
import { decryptGmailConnection } from '@/helpers/decryptGmailConnection'
import type { GmailReportConnection, GmailReportStatus } from '@/types/gmailReportTypes'

export async function getGmailReportConnection(): Promise<GmailReportConnection | null> {
  const value = (await cookies()).get(GMAIL_REPORT_CONNECTION_COOKIE)?.value
  if (!value) return null
  try {
    return decryptGmailConnection(value)
  } catch {
    return null
  }
}

export async function getGmailReportStatus(): Promise<GmailReportStatus> {
  const connection = await getGmailReportConnection()
  return {
    connected: Boolean(connection),
    senderEmail: connection?.senderEmail ?? '',
  }
}

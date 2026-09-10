import { cookies } from 'next/headers'
import { ensureAdmin } from '@/helpers/ensureAdmin'
import { encryptGmailConnection } from '@/helpers/encryptGmailConnection'
import { createGmailOAuthClient } from '@/server/gmail-reports/createGmailOAuthClient'
import {
  GMAIL_REPORT_CONNECTION_COOKIE,
  GMAIL_REPORT_COOKIE_AGE,
  GMAIL_REPORT_STATE_COOKIE,
} from '@/constants/gmailReports'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const returnUrl = new URL('/admin/stripe-reports', request.url)
  try {
    await ensureAdmin()
    const url = new URL(request.url)
    const store = await cookies()
    const stateValue = store.get(GMAIL_REPORT_STATE_COOKIE)?.value
    store.delete(GMAIL_REPORT_STATE_COOKIE)
    const [state, month] = stateValue?.split(':') ?? []
    if (!state || state !== url.searchParams.get('state')) throw new Error('Nieprawidłowy stan OAuth.')
    if (/^20\d{2}-(0[1-9]|1[0-2])$/.test(month ?? '')) returnUrl.searchParams.set('month', month!)
    const code = url.searchParams.get('code')
    if (!code) throw new Error('Brak kodu OAuth.')
    const client = createGmailOAuthClient(new URL('/api/admin/gmail/callback', request.url).toString())
    const { tokens } = await client.getToken(code)
    if (!tokens.refresh_token || !tokens.id_token) throw new Error('Brak tokenu Gmail.')
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_GMAIL_CLIENT_ID!,
    })
    const senderEmail = ticket.getPayload()?.email
    if (!senderEmail) throw new Error('Brak adresu Gmail.')
    store.set(GMAIL_REPORT_CONNECTION_COOKIE, encryptGmailConnection({
      refreshToken: tokens.refresh_token,
      senderEmail,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: GMAIL_REPORT_COOKIE_AGE,
    })
    returnUrl.searchParams.set('gmail', 'connected')
  } catch {
    returnUrl.searchParams.set('gmail', 'error')
  }
  return Response.redirect(returnUrl)
}

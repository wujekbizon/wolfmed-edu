import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { ensureAdmin } from '@/helpers/ensureAdmin'
import { createGmailOAuthClient } from '@/server/gmail-reports/createGmailOAuthClient'
import { GMAIL_REPORT_SCOPE, GMAIL_REPORT_STATE_COOKIE } from '@/constants/gmailReports'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await ensureAdmin()
    const requestUrl = new URL(request.url)
    const redirectUri = new URL('/api/admin/gmail/callback', requestUrl).toString()
    const month = requestUrl.searchParams.get('month') ?? ''
    const state = randomBytes(32).toString('base64url')
    const store = await cookies()
    store.set(GMAIL_REPORT_STATE_COOKIE, `${state}:${month}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    })
    const url = createGmailOAuthClient(redirectUri).generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      prompt: 'consent',
      scope: GMAIL_REPORT_SCOPE,
      state,
    })
    return Response.redirect(url)
  } catch {
    return Response.redirect(new URL('/admin/stripe-reports?gmail=error', request.url))
  }
}

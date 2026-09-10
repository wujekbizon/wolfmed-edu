import 'server-only'
import { OAuth2Client } from 'google-auth-library'

export function createGmailOAuthClient(redirectUri?: string) {
  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Brak konfiguracji Gmail OAuth.')
  return new OAuth2Client(clientId, clientSecret, redirectUri)
}

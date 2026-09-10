import 'server-only'
import { createGmailOAuthClient } from './createGmailOAuthClient'

export async function sendGmailRawMessage(refreshToken: string, raw: string) {
  const client = createGmailOAuthClient()
  client.setCredentials({ refresh_token: refreshToken })
  await client.request({
    url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    method: 'POST',
    data: { raw },
  })
}

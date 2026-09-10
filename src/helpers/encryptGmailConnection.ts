import { createCipheriv, randomBytes } from 'node:crypto'
import { getGmailTokenKey } from '@/helpers/getGmailTokenKey'
import type { GmailReportConnection } from '@/types/gmailReportTypes'

export function encryptGmailConnection(connection: GmailReportConnection): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getGmailTokenKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(connection), 'utf8'),
    cipher.final(),
  ])
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString('base64url'))
    .join('.')
}

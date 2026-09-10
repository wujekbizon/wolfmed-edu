import { createDecipheriv } from 'node:crypto'
import { getGmailTokenKey } from '@/helpers/getGmailTokenKey'
import type { GmailReportConnection } from '@/types/gmailReportTypes'

export function decryptGmailConnection(value: string): GmailReportConnection {
  const [ivValue, tagValue, encryptedValue] = value.split('.')
  if (!ivValue || !tagValue || !encryptedValue) throw new Error('Nieprawidłowe dane Gmail.')
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getGmailTokenKey(),
    Buffer.from(ivValue, 'base64url')
  )
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
  return JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')) as GmailReportConnection
}

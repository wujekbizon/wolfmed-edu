export function getGmailTokenKey(): Buffer {
  const value = process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  if (!value) throw new Error('Brak GMAIL_TOKEN_ENCRYPTION_KEY.')
  const key = Buffer.from(value, 'base64')
  if (key.length !== 32) throw new Error('GMAIL_TOKEN_ENCRYPTION_KEY musi mieć 32 bajty base64.')
  return key
}

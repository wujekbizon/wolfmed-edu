import 'server-only'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'

export async function getKierunkiWolfekRateLimitIdentity(userId: string | null): Promise<string> {
  if (userId) return `user:${userId}`
  const requestHeaders = await headers()
  const address = requestHeaders.get('x-real-ip') ?? requestHeaders.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  const fingerprint = createHash('sha256').update(address || 'unknown').digest('hex')
  return `public:${fingerprint}`
}

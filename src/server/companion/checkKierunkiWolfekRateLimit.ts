import 'server-only'
import { checkRateLimit } from '@/lib/rateLimit'
import { getKierunkiWolfekRateLimitIdentity } from './getKierunkiWolfekRateLimitIdentity'

export async function checkKierunkiWolfekRateLimit(userId: string | null) {
  const identity = await getKierunkiWolfekRateLimitIdentity(userId)
  return checkRateLimit(identity, 'kierunki:jev')
}

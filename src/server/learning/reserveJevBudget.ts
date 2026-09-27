import 'server-only'
import { getRedis } from '@/lib/redis'
import type { JevConfig } from '@/types/jevTypes'

export async function reserveJevBudget(config: JevConfig, sessionId: string, trigger: string) {
  const redis = getRedis()
  if (!redis) return false
  const day = new Date().toISOString().slice(0, 10)
  try {
    const reserved = await redis.eval(`
      if redis.call('EXISTS', KEYS[3]) == 1 then return 0 end
      if redis.call('EXISTS', KEYS[4]) == 1 then return 0 end
      if tonumber(redis.call('GET', KEYS[1]) or '0') >= tonumber(ARGV[1]) then return 0 end
      if tonumber(redis.call('GET', KEYS[2]) or '0') >= tonumber(ARGV[2]) then return 0 end
      redis.call('INCR', KEYS[1])
      redis.call('EXPIRE', KEYS[1], 172800)
      redis.call('INCR', KEYS[2])
      redis.call('EXPIRE', KEYS[2], 2592000)
      redis.call('SET', KEYS[3], '1', 'EX', 2592000)
      redis.call('SET', KEYS[4], '1', 'EX', 45)
      return 1
    `, [`jev:daily:${day}`, `jev:session:${sessionId}`, `jev:trigger:${sessionId}:${trigger}`,
      `jev:cooldown:${sessionId}`],
    [config.dailyLimit, config.sessionLimit])
    return reserved === 1
  } catch {
    return false
  }
}

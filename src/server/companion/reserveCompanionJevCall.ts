import 'server-only'
import { randomUUID } from 'node:crypto'
import { getRedis } from '@/lib/redis'
import { COMPANION_JEV_RATE_LIMIT } from '@/constants/companionJevRateLimit'

export async function reserveCompanionJevCall(identity: string, fingerprint: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  const config = COMPANION_JEV_RATE_LIMIT
  const limits = identity.startsWith('user:') ? config.signedIn : config.anonymous
  try {
    const reserved = await redis.eval(`
      if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
      local time = redis.call('TIME')
      local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - tonumber(ARGV[3]))
      if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[4]) then return 0 end
      local minuteStart = '(' .. tostring(now - tonumber(ARGV[1]))
      if redis.call('ZCOUNT', KEYS[1], minuteStart, '+inf') >= tonumber(ARGV[2]) then return 0 end
      redis.call('ZADD', KEYS[1], now, ARGV[7])
      redis.call('EXPIRE', KEYS[1], ARGV[5])
      redis.call('SET', KEYS[2], '1', 'EX', ARGV[6])
      return 1
    `, [`jev:companion:rate:${identity}`, `jev:companion:lock:${identity}:${fingerprint}`],
    [config.minuteWindowMs, limits.minuteCalls, config.hourWindowMs, limits.hourCalls,
      config.windowTtlSeconds, config.lockSeconds, randomUUID()])
    return reserved === 1
  } catch {
    return false
  }
}

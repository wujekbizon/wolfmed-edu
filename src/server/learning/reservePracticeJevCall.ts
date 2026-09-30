import 'server-only'
import { getRedis } from '@/lib/redis'
import { PRACTICE_JEV_RATE_LIMIT } from '@/constants/practiceJevRateLimit'

export async function reservePracticeJevCall(userId: string, sessionId: string, trigger: string) {
  const redis = getRedis()
  if (!redis) return false
  const limits = PRACTICE_JEV_RATE_LIMIT
  try {
    const reserved = await redis.eval(`
      if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
      if redis.call('EXISTS', KEYS[3]) == 1 then return 0 end
      local time = redis.call('TIME')
      local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - tonumber(ARGV[3]))
      if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[4]) then return 0 end
      local minuteStart = '(' .. tostring(now - tonumber(ARGV[1]))
      if redis.call('ZCOUNT', KEYS[1], minuteStart, '+inf') >= tonumber(ARGV[2]) then return 0 end
      redis.call('ZADD', KEYS[1], now, KEYS[2])
      redis.call('EXPIRE', KEYS[1], ARGV[5])
      redis.call('SET', KEYS[2], '1', 'EX', ARGV[6])
      redis.call('SET', KEYS[3], '1', 'EX', ARGV[7])
      return 1
    `, [`jev:practice:rate:${userId}`, `jev:trigger:${sessionId}:${trigger}`,
      `jev:cooldown:${sessionId}`],
    [limits.minuteWindowMs, limits.minuteCalls, limits.hourWindowMs, limits.hourCalls,
      limits.windowTtlSeconds, limits.triggerTtlSeconds, limits.cooldownSeconds])
    return reserved === 1
  } catch {
    return false
  }
}

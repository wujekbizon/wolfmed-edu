import { getRedis } from './redis'

// In-memory store for development fallback
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  interval: number // milliseconds
  maxRequests: number
}

/**
 * Rate limit configurations for different actions
 * Format: action -> { interval (ms), maxRequests }
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'note:create': { interval: 60 * 60 * 1000, maxRequests: 10 },
  'note:update': { interval: 60 * 60 * 1000, maxRequests: 30 },
  'note:delete': { interval: 60 * 60 * 1000, maxRequests: 20 },

  'material:upload': { interval: 60 * 60 * 1000, maxRequests: 5 },
  'file:upload': { interval: 60 * 60 * 1000, maxRequests: 10 },

  'flashcard:create': { interval: 60 * 60 * 1000, maxRequests: 50 },

  'message:send': { interval: 60 * 60 * 1000, maxRequests: 3 },
  'email:send': { interval: 60 * 60 * 1000, maxRequests: 3 },

  'forum:post:create': { interval: 60 * 60 * 1000, maxRequests: 5 },
  'forum:post:delete': { interval: 60 * 60 * 1000, maxRequests: 10 },
  'forum:comment:create': { interval: 60 * 60 * 1000, maxRequests: 20 },
  'forum:comment:delete': { interval: 60 * 60 * 1000, maxRequests: 20 },

  'blog:post:create': { interval: 60 * 60 * 1000, maxRequests: 3 },
  'blog:post:update': { interval: 60 * 60 * 1000, maxRequests: 10 },
  'blog:post:delete': { interval: 60 * 60 * 1000, maxRequests: 5 },
  'blog:like': { interval: 60 * 60 * 1000, maxRequests: 100 },

  'test:start': { interval: 60 * 60 * 1000, maxRequests: 20 },
  'test:submit': { interval: 60 * 60 * 1000, maxRequests: 20 },
  'test:create': { interval: 60 * 60 * 1000, maxRequests: 5 },
  'test:delete': { interval: 60 * 60 * 1000, maxRequests: 10 },

  'challenge:submit': { interval: 60 * 60 * 1000, maxRequests: 30 },

  'profile:update:username': { interval: 60 * 60 * 1000, maxRequests: 3 },
  'profile:update:motto': { interval: 60 * 60 * 1000, maxRequests: 5 },

  'testimonial:create': { interval: 60 * 60 * 1000, maxRequests: 2 },

  'cells:update': { interval: 60 * 60 * 1000, maxRequests: 50 },

  'rag:query': { interval: 60 * 60 * 1000, maxRequests: 10 },
  'rag:admin:test': {interval: 60 * 60 * 1000, maxRequests: 10 },
  'rag:admin:upload':{interval: 60 * 60 * 1000, maxRequests: 3},
  'rag:admin:create-store':{ interval: 60 * 60 * 1000, maxRequests: 3 }
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if action is rate limited
 * Uses Redis in production, in-memory in development
 *
 * @param userId - User identifier
 * @param action - Action key (must be in RATE_LIMITS)
 * @returns Rate limit result with success/remaining/reset info
 */
export async function checkRateLimit(
  userId: string,
  action: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[action]
  if (!config) {
    throw new Error(`Unknown rate limit action: ${action}`)
  }

  const key = `ratelimit:${userId}:${action}`
  const redis = getRedis()

  if (!redis) {
    // Fallback to in-memory for development
    return checkInMemoryRateLimit(key, config)
  }

  const now = Date.now()
  const windowStart = now - config.interval

  try {
    // Use Redis sorted set with timestamps as scores
    // This allows sliding window rate limiting

    // Remove old entries outside the time window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count current requests in window
    const count = await redis.zcard(key)

    // Add current request timestamp
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })

    // Set expiry on the key (cleanup)
    await redis.expire(key, Math.ceil(config.interval / 1000))

    const remaining = Math.max(0, config.maxRequests - count - 1)
    const resetAt = now + config.interval

    return {
      success: count < config.maxRequests,
      limit: config.maxRequests,
      remaining,
      reset: resetAt,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open (allow request) rather than fail closed
    // This ensures service availability even if Redis is down
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.interval,
    }
  }
}

/**
 * In-memory rate limiting for development
 * Not suitable for production (doesn't persist across server restarts)
 */
function checkInMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const stored = inMemoryStore.get(key)

  if (!stored || now > stored.resetAt) {
    // New window
    inMemoryStore.set(key, { count: 1, resetAt: now + config.interval })
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.interval,
    }
  }

  stored.count++

  return {
    success: stored.count <= config.maxRequests,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - stored.count),
    reset: stored.resetAt,
  }
}

/**
 * Cleanup in-memory store periodically (every minute)
 * Prevents memory leaks in development
 */
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of inMemoryStore.entries()) {
      if (now > value.resetAt) {
        inMemoryStore.delete(key)
      }
    }
  }, 60000)
}

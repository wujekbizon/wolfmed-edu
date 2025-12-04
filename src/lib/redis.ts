import { Redis } from '@upstash/redis'

/**
 * Singleton Redis instance for rate limiting and caching
 * Uses Upstash Redis (serverless-friendly)
 */
let redis: Redis | null = null

export function getRedis(): Redis | null {
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      console.warn('Redis not configured. Rate limiting will use in-memory fallback.')
      return null
    }

    redis = new Redis({
      url,
      token,
    })
  }

  return redis
}

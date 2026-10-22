import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'
import { loadRateLimiter } from '../../support/loadRateLimiter'
import type { LimiterMode } from '../../support/rateLimitTypes'

export function liveLimiter(label: string) {
  assert.ok(process.argv.includes('--live'), 'Manual test only: pass --live to permit external writes')
  dotenv.config({ quiet: true })
  assert.ok(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN, 'Configure Upstash in .env')
  const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  const runId = randomUUID()
  const errors: unknown[] = []
  const keys = new Set<string>()
  return {
    runId,
    check(mode: LimiterMode) {
      const prefix = `ratelimit:smoke:${label}:${runId}:${mode}`
      const check = loadRateLimiter(redis, { prefix, mode, onError: (...args) => errors.push(args) })
      return async (userId: string, action: string) => {
        keys.add(`${prefix}:${userId}:${action}`)
        const result = await check(userId, action)
        assert.equal(errors.length, 0, 'Redis failed; fail-open results are invalid')
        return result
      }
    },
    async cleanup() {
      const results = await Promise.allSettled([...keys].map(async key => {
        await redis.del(key)
        assert.equal(await redis.exists(key), 0, 'Test Redis key still exists')
      }))
      for (const result of results) {
        if (result.status === 'rejected') throw result.reason
      }
      assert.equal(errors.length, 0, 'Redis failed during the test')
      console.log('Isolated Redis counters removed and verified')
    },
  }
}

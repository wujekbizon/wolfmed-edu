import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadSource } from './loadSource'
import type { CheckRateLimit, LimiterOptions } from './rateLimitTypes'

export function loadRateLimiter(redis: unknown, options: LimiterOptions = {}): CheckRateLimit {
  let source = readFileSync(new URL('../../src/lib/rateLimit.ts', import.meta.url), 'utf8')
  const importLine = "import { getRedis } from './redis'"
  assert.ok(source.includes(importLine), 'Update limiter source harness after import changes')
  source = source.replace(importLine, '')
  assert.doesNotMatch(source, /^import\s/m, 'Unexpected limiter dependency')
  if (options.mode === 'old') {
    const start = source.indexOf('    const count = await redis.eval<unknown[], number>(')
    const end = source.indexOf('    const remaining', start)
    assert.ok(start >= 0 && end > start, 'Update legacy comparison after limiter refactor')
    const legacy = readFileSync(new URL('../rateLimit/fixtures/legacyRedisBlock.txt', import.meta.url), 'utf8')
    source = source.slice(0, start) + legacy + '\n\n' + source.slice(end)
  }
  if (options.prefix) {
    const key = '`ratelimit:${userId}:${action}`'
    assert.ok(source.includes(key), 'Update isolated key replacement after limiter refactor')
    source = source.replace(key, `${JSON.stringify(options.prefix)} + ':' + userId + ':' + action`)
  }
  return loadSource<{ checkRateLimit: CheckRateLimit }>(source, {
    getRedis: () => redis,
    setInterval: () => undefined,
    Date: { now: options.now ?? Date.now },
    console: { error: options.onError ?? (() => {}) },
  }).checkRateLimit
}

import assert from 'node:assert/strict'
import test from 'node:test'
import { loadRateLimiter } from '../support/loadRateLimiter'
import { createMemoryRedis } from './fixtures/createMemoryRedis'

for (const [action, limit] of [['profile:update:motto', 5], ['rag:query', 10]] as const) {
  test(`${action}: concurrent requests cannot exceed allowance`, async () => {
    const errors: unknown[] = []
    const check = loadRateLimiter(createMemoryRedis(), { onError: (...args) => errors.push(args) })
    const results = await Promise.all(Array.from({ length: limit * 2 }, () => check('user-a', action)))
    assert.equal(results.filter(result => result.success).length, limit)
    assert.deepEqual(results.filter(result => result.success).map(result => result.remaining).sort((a, b) => a - b),
      Array.from({ length: limit }, (_, index) => index))
    assert.equal((await check('user-a', action)).success, false)
    assert.deepEqual(errors, [])
  })
}

test('legacy separate commands reproduce the race under the same concurrency', async () => {
  const check = loadRateLimiter(createMemoryRedis(), { mode: 'old' })
  const results = await Promise.all(Array.from({ length: 10 }, () => check('user-a', 'profile:update:motto')))
  assert.equal(results.filter(result => result.success).length, 10)
})

test('different users and action keys retain independent allowances', async () => {
  const check = loadRateLimiter(createMemoryRedis())
  await Promise.all(Array.from({ length: 5 }, () => check('user-a', 'profile:update:motto')))
  assert.equal((await check('user-a', 'profile:update:motto')).success, false)
  assert.equal((await check('user-b', 'profile:update:motto')).remaining, 4)
  assert.equal((await check('user-a', 'rag:query')).remaining, 9)
})

test('expired entries release allowance after the sliding window', async () => {
  let now = 10_000_000
  const check = loadRateLimiter(createMemoryRedis(), { now: () => now })
  await Promise.all(Array.from({ length: 5 }, () => check('user-a', 'profile:update:motto')))
  now += 60 * 60 * 1000
  assert.equal((await check('user-a', 'profile:update:motto')).remaining, 4)
})

test('Redis failure preserves existing fail-open behavior and logs the error', async () => {
  const redis = createMemoryRedis()
  const errors: unknown[] = []
  redis.eval = async () => { throw new Error('Offline simulated failure') }
  const check = loadRateLimiter(redis, { onError: (...args) => errors.push(args) })
  const result = await check('user-a', 'profile:update:motto')
  assert.equal(result.success, true)
  assert.equal(result.remaining, 5)
  assert.equal(errors.length, 1)
})

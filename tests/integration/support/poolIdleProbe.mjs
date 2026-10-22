import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { performance } from 'node:perf_hooks'
import { setTimeout as delay } from 'node:timers/promises'
import { attachDatabasePool } from '@vercel/functions/db-connections'

export async function measurePoolIdleLifetime(idleTimeoutMillis) {
  const symbol = Symbol.for('@vercel/request-context')
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, symbol)
  const savedEnv = { VERCEL_URL: process.env.VERCEL_URL, VERCEL_REGION: process.env.VERCEL_REGION }
  const pool = new EventEmitter()
  pool.options = { idleTimeoutMillis }
  const pending = []
  let settled = false
  let settledAt = null
  let releaseAt = null
  const started = performance.now()
  try {
    process.env.VERCEL_URL = 'isolated.invalid'
    process.env.VERCEL_REGION = 'fra1'
    Object.defineProperty(globalThis, symbol, { configurable: true, value: {
      get: () => ({ waitUntil: promise => pending.push(promise.then(() => {
        settled = true
        settledAt = performance.now()
      })) }),
    } })
    attachDatabasePool(pool)
    await delay(25)
    releaseAt = performance.now()
    pool.emit('release')
    const responseAt = performance.now()
    assert.equal(pending.length, 1, 'Real helper must register one background promise')
    assert.equal(settled, false, 'Simulated response must precede background completion')
    await Promise.all(pending)
    assert.equal(settled, true)
    return { idleTimeoutMillis, simulatedResponseMs: +(responseAt - started).toFixed(2),
      helperLifetimeMs: +(settledAt - releaseAt).toFixed(2),
      postResponseMs: +(settledAt - responseAt).toFixed(2), backgroundPromises: pending.length }
  } finally {
    await Promise.allSettled(pending)
    pool.removeAllListeners()
    if (descriptor) Object.defineProperty(globalThis, symbol, descriptor)
    else delete globalThis[symbol]
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

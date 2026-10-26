import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { measurePoolIdleLifetime } from './support/poolIdleProbe.mjs'

const require = createRequire(import.meta.url)
const helperDirectory = dirname(require.resolve('@vercel/functions/db-connections'))
const packageInfo = JSON.parse(readFileSync(join(helperDirectory, '../package.json'), 'utf8'))
const appConfig = readFileSync(new URL('../../src/server/db/index.ts', import.meta.url), 'utf8')
const configuredIdle = Number(appConfig.match(/idleTimeoutMillis:\s*(\d+)/)?.[1])
assert.equal(configuredIdle, 5_000, 'App must use approved 5s idle timeout')
console.log(JSON.stringify({ helperVersion: packageInfo.version, realTimers: true,
  realDatabase: false, realVercel: false, realHttpResponse: false }))

const baseline = await measurePoolIdleLifetime(30_000)
console.log(JSON.stringify({ scenario: 'baseline', ...baseline }))
if (process.argv.includes('--reproduce')) {
  assert.ok(baseline.helperLifetimeMs < 11_000,
    `Reproduced: quick simulated response retains background work for ${baseline.helperLifetimeMs}ms; exceeds 11s candidate budget`)
} else {
  assert.ok(baseline.helperLifetimeMs >= 30_000 && baseline.helperLifetimeMs < 35_000)
  for (const idle of [15_000, 10_000, configuredIdle]) {
    const candidate = await measurePoolIdleLifetime(idle)
    assert.ok(candidate.helperLifetimeMs >= idle && candidate.helperLifetimeMs < idle + 1_000)
    assert.ok(baseline.simulatedResponseMs < 1_000 && candidate.simulatedResponseMs < 1_000)
    assert.ok(baseline.postResponseMs - candidate.postResponseMs > 30_000 - idle - 1_000)
    console.log(JSON.stringify({ scenario: idle === configuredIdle ? 'app' : 'candidate', ...candidate,
      savedPostResponseMs: +(baseline.postResponseMs - candidate.postResponseMs).toFixed(2),
      helperLifetimeReductionPercent: +((1 - candidate.helperLifetimeMs / baseline.helperLifetimeMs) * 100).toFixed(2),
      result: 'PASS', productionBillingMeasured: false }))
  }
}

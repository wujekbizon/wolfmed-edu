import assert from 'node:assert/strict'
import test from 'node:test'
import { getRemainingSeconds } from '../../src/hooks/useCountdownTestTimer'

test('exam timer uses absolute server deadline', () => {
  const now = Date.parse('2026-08-10T10:00:00.000Z')
  const expiresAt = '2026-08-10T10:15:00.000Z'

  assert.equal(getRemainingSeconds(expiresAt, now), 900)
  assert.equal(getRemainingSeconds(expiresAt, now + 5 * 60 * 1000), 600)
})

test('exam timer stays expired after reload', () => {
  const expiresAt = '2026-08-10T10:15:00.000Z'
  const afterDeadline = Date.parse('2026-08-10T10:16:00.000Z')

  assert.equal(getRemainingSeconds(expiresAt, afterDeadline), 0)
  assert.equal(getRemainingSeconds('invalid', afterDeadline), 0)
})

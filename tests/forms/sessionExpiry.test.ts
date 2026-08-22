import assert from 'node:assert/strict'
import test from 'node:test'
import { hasSessionExpired } from '../../src/helpers/hasSessionExpired'

test('session deadline compares absolute Date values without local-time parsing', () => {
  const now = new Date('2026-08-10T14:23:49.220Z')
  const deadline = new Date('2026-08-10T14:48:47.021Z')

  assert.equal(hasSessionExpired(deadline, now), false)
})

test('session expires at or after its absolute deadline', () => {
  const deadline = new Date('2026-08-10T14:48:47.021Z')

  assert.equal(hasSessionExpired(deadline, new Date('2026-08-10T14:48:47.021Z')), true)
  assert.equal(hasSessionExpired(deadline, new Date('2026-08-10T14:48:48.000Z')), true)
})

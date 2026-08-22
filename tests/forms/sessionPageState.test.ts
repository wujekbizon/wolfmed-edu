import assert from 'node:assert/strict'
import test from 'node:test'
import { getTestSessionPageState } from '../../src/helpers/getTestSessionPageState'

const now = new Date('2026-08-10T14:30:00.000Z')
const expiresAt = new Date('2026-08-10T14:55:00.000Z')

test('completed owned session redirects to results state', () => {
  assert.equal(getTestSessionPageState({
    category: 'opiekun-medyczny',
    status: 'COMPLETED',
    expiresAt,
  }, 'opiekun-medyczny', now), 'COMPLETED')
})

test('active session remains renderable', () => {
  assert.equal(getTestSessionPageState({
    category: 'opiekun-medyczny',
    status: 'ACTIVE',
    expiresAt,
  }, 'opiekun-medyczny', now), 'ACTIVE')
})

test('expired, missing, and category-mismatched sessions stay invalid', () => {
  assert.equal(getTestSessionPageState(undefined, 'opiekun-medyczny', now), 'INVALID')
  assert.equal(getTestSessionPageState({
    category: 'another-category',
    status: 'COMPLETED',
    expiresAt,
  }, 'opiekun-medyczny', now), 'INVALID')
  assert.equal(getTestSessionPageState({
    category: 'opiekun-medyczny',
    status: 'EXPIRED',
    expiresAt,
  }, 'opiekun-medyczny', now), 'INVALID')
})

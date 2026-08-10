import assert from 'node:assert/strict'
import test from 'node:test'
import {
  claimSessionUnmount,
  markSessionMounted,
} from '../../src/helpers/sessionCleanupGuard'

test('same-session remount cancels stale cleanup expiry', () => {
  const sessionId = 'remount-session'
  const staleGeneration = markSessionMounted(sessionId)
  const currentGeneration = markSessionMounted(sessionId)

  assert.equal(claimSessionUnmount(sessionId, staleGeneration), false)
  assert.equal(claimSessionUnmount(sessionId, currentGeneration), true)
})

test('real unmount claims expiry once', () => {
  const sessionId = 'unmount-session'
  const generation = markSessionMounted(sessionId)

  assert.equal(claimSessionUnmount(sessionId, generation), true)
  assert.equal(claimSessionUnmount(sessionId, generation), false)
})

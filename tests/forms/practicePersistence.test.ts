import assert from 'node:assert/strict'
import test, { after, beforeEach } from 'node:test'
import { state, payload, questionId, hooks } from './fixtures/practicePersistence'

const { persistPracticeProgress } = await import('@/server/savePracticeProgress')
after(() => hooks.deregister())
beforeEach(() => {
  state.row.userId = 'owner'
  state.row.mode = 'PRACTICE'
  state.row.status = 'ACTIVE'
  state.row.progress = {}
  state.row.meta = { practiceProgressVersions: {} }
  state.access = true
  state.writes = []
})

test('active practice autosave still writes progress', async () => {
  const result = await persistPracticeProgress('owner', payload)
  assert.equal(result.success, true)
  assert.equal(state.writes.length, 1)
  assert.equal(state.writes[0]?.progress[questionId], 1)
})

test('late navigation beacons after completion succeed without restoring cleared progress', async () => {
  state.row.status = 'COMPLETED'
  assert.deepEqual(await persistPracticeProgress('owner', payload), { success: true, completed: true })
  assert.deepEqual(await persistPracticeProgress('owner', payload), { success: true, completed: true })
  assert.equal(state.writes.length, 0)
  assert.deepEqual(state.row.progress, {})
})

test('completed-session no-op remains scoped to the owner and practice mode', async () => {
  state.row.status = 'COMPLETED'
  assert.equal((await persistPracticeProgress('another-user', payload)).success, false)
  state.row.mode = 'EXAM'
  assert.equal((await persistPracticeProgress('owner', payload)).success, false)
  assert.equal(state.writes.length, 0)
})

test('revoked access and foreign question IDs still reject late saves', async () => {
  state.row.status = 'COMPLETED'
  state.access = false
  assert.equal((await persistPracticeProgress('owner', payload)).success, false)
  state.access = true
  state.row.questionIds = []
  assert.equal((await persistPracticeProgress('owner', payload)).success, false)
  state.row.questionIds = [questionId]
  assert.equal(state.writes.length, 0)
})

test('expired and cancelled sessions still reject autosaves', async () => {
  for (const status of ['EXPIRED', 'CANCELLED']) {
    state.row.status = status
    assert.equal((await persistPracticeProgress('owner', payload)).success, false)
  }
  assert.equal(state.writes.length, 0)
})

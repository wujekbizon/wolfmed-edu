import assert from 'node:assert/strict'
import test from 'node:test'
import { mergePracticeProgress } from '@/helpers/mergePracticeProgress'
import { getPracticeProgressMeta } from '@/helpers/getPracticeProgressMeta'
import { SavePracticeProgressSchema } from '@/server/schema'
import type { PracticeAnswerUpdate } from '@/types/testTypes'

const id = '11111111-1111-4111-8111-111111111111'
const clientId = '22222222-2222-4222-8222-222222222222'
const update = (answerIndex: number, revision: number, baseRevision = 0): PracticeAnswerUpdate =>
  ({ answerIndex, revision, baseRevision, clientId })

test('late autosave cannot overwrite a newer beacon answer', () => {
  const newer = mergePracticeProgress({}, {}, { [id]: update(2, 2) })!
  const late = mergePracticeProgress(newer.progress, newer.versions, { [id]: update(1, 1) })!
  assert.deepEqual(late, newer)
  assert.equal(late.progress, newer.progress)
  assert.equal(late.versions, newer.versions)
})

test('later beacon can replace an earlier autosave and duplicate delivery is harmless', () => {
  const earlier = mergePracticeProgress({}, {}, { [id]: update(1, 1) })!
  const newer = mergePracticeProgress(earlier.progress, earlier.versions, { [id]: update(2, 2) })!
  assert.equal(newer.progress[id], 2)
  const duplicate = mergePracticeProgress(newer.progress, newer.versions, { [id]: update(2, 2) })!
  assert.deepEqual(duplicate, newer)
  assert.equal(duplicate.progress, newer.progress)
})

test('reverting an answer still supersedes an outstanding beacon', () => {
  const changed = mergePracticeProgress({ [id]: 0 }, {}, { [id]: update(1, 1) })!
  const reverted = mergePracticeProgress(changed.progress, changed.versions, { [id]: update(0, 2) })!
  assert.equal(reverted.progress[id], 0)
  assert.deepEqual(mergePracticeProgress(reverted.progress, reverted.versions, { [id]: update(1, 1) }), reverted)
})

test('stale windows conflict; refreshed windows can continue without erasing other questions', () => {
  const saved = mergePracticeProgress({ other: 3 }, {}, { [id]: update(1, 3) })!
  const otherClient = '33333333-3333-4333-8333-333333333333'
  assert.equal(mergePracticeProgress(saved.progress, saved.versions, {
    [id]: { ...update(0, 1), clientId: otherClient },
  }), null)
  const resumed = mergePracticeProgress(saved.progress, saved.versions, {
    [id]: { ...update(2, 4, 3), clientId: otherClient },
  })!
  assert.equal(resumed.progress[id], 2)
  assert.equal(resumed.progress.other, 3)
})

test('legacy metadata starts with no versions and preserves unrelated metadata', () => {
  assert.deepEqual(getPracticeProgressMeta(null), { practiceProgressVersions: {} })
  assert.deepEqual(getPracticeProgressMeta({ device: 'mobile' }), {
    device: 'mobile', practiceProgressVersions: {},
  })
})

test('unversioned and invalid save payloads are rejected', () => {
  const payload = { sessionId: id, answers: { [id]: update(0, 1) } }
  assert.equal(SavePracticeProgressSchema.safeParse(payload).success, true)
  for (const answer of [0, update(0, 1, 1), update(0, -1), { ...update(0, 1), clientId: 'invalid' }]) {
    assert.equal(SavePracticeProgressSchema.safeParse({ ...payload, answers: { [id]: answer } }).success, false)
  }
})

test('legacy anatomy question IDs can be saved and their metadata reloaded', () => {
  const questionId = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
  const answer = update(0, 1)
  const payload = { sessionId: id, answers: { [questionId]: answer } }
  assert.equal(SavePracticeProgressSchema.safeParse(payload).success, true)
  assert.deepEqual(getPracticeProgressMeta({ practiceProgressVersions: {
    [questionId]: { revision: answer.revision, clientId },
  } }).practiceProgressVersions[questionId], { revision: 1, clientId })
})

test('question IDs still require the database UUID shape', () => {
  for (const questionId of ['invalid', 'c3d4e5f6-a7b8-9012-cdef-12345678901z']) {
    assert.equal(SavePracticeProgressSchema.safeParse({ sessionId: id, answers: {
      [questionId]: update(0, 1),
    } }).success, false)
  }
  assert.equal(SavePracticeProgressSchema.safeParse({ sessionId: id, answers: {
    [id]: { ...update(0, 1), clientId: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
  } }).success, false)
})

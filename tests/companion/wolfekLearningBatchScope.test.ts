import assert from 'node:assert/strict'
import test from 'node:test'
import { getWolfekPreparedScope } from '@/helpers/getWolfekPreparedScope'
import { getWolfekContextVersion } from '@/helpers/getWolfekContextVersion'
import { learningInput, learningPack, learningContext } from './fixtures/wolfekLearningBatch'

test('session creation and assistance version changes preserve prepared decisions', () => {
  const fingerprint = getWolfekContextVersion(learningInput, learningPack, learningContext)
  const scope = getWolfekPreparedScope(learningInput.practice)
  for (const version of [1, 2, 3]) {
    const input = { ...learningInput, practice: { ...learningInput.practice, sessionId: crypto.randomUUID(), version } }
    assert.equal(getWolfekPreparedScope(input.practice), scope)
    assert.equal(getWolfekContextVersion(input, learningPack, learningContext), fingerprint)
  }
})

test('changed question, revision, category or selected answer invalidates prepared decisions', () => {
  const fingerprint = getWolfekContextVersion(learningInput, learningPack, learningContext)
  for (const change of [{ questionId: crypto.randomUUID() }, { revision: 'b'.repeat(64) },
    { category: 'inna-kategoria' }, { selected: 1 }, { selected: null }]) {
    const input = { ...learningInput, practice: { ...learningInput.practice, ...change } }
    assert.notEqual(getWolfekPreparedScope(input.practice), getWolfekPreparedScope(learningInput.practice))
    assert.notEqual(getWolfekContextVersion(input, learningPack, learningContext), fingerprint)
  }
})

test('answer visibility, resolution and access changes invalidate server decisions', () => {
  const fingerprint = getWolfekContextVersion(learningInput, learningPack, learningContext)
  const changed = [
    { ...learningContext, facts: { ...learningContext.facts,
      card: { ...learningContext.facts.card, answerVisible: true } } },
    { ...learningContext, facts: { ...learningContext.facts,
      card: { ...learningContext.facts.card, resolved: true } } },
    { ...learningContext, facts: { ...learningContext.facts,
      access: { ...learningContext.facts.access, premiumTutorAllowed: false } } },
  ]
  for (const context of changed) assert.notEqual(getWolfekContextVersion(learningInput, learningPack, context), fingerprint)
})

test('response pack changes cannot reuse old decisions', () => {
  const fingerprint = getWolfekContextVersion(learningInput, learningPack, learningContext)
  assert.notEqual(getWolfekContextVersion(learningInput, { ...learningPack, version: 'new-pack' }, learningContext), fingerprint)
  const changed = structuredClone(learningPack)
  changed.options[0]!.template = 'Changed response'
  assert.notEqual(getWolfekContextVersion(learningInput, changed, learningContext), fingerprint)
})

test('null and omitted selections share the same empty-choice scope', () => {
  const { selected: _selected, ...practice } = learningInput.practice
  assert.equal(getWolfekPreparedScope(practice), getWolfekPreparedScope({ ...practice, selected: null }))
})

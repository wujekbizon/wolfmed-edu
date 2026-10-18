import assert from 'node:assert/strict'
import test, { after, beforeEach } from 'node:test'
import { services, hooks } from './fixtures/mockWolfekPreparedServices'
import { context, preparedInput } from './fixtures/wolfekPrepared'
import { learningInput } from './fixtures/wolfekLearning'
import questions from '@/content/wolfek/questions.json'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'

const { executeWolfekPreparedQuestion } = await import('@/server/companion/executeWolfekPreparedQuestion')
const { executeWolfekQuestion } = await import('@/server/companion/executeWolfekQuestion')
after(() => hooks.deregister())
beforeEach(() => {
  services.allowed = true
  services.limited = false
  services.providerCalls = 0
  services.deliveries = 0
  services.contextReads = 0
  services.appContext = context
  services.replay = null
  services.completed = null
  services.records = []
})

test('all prepared buttons bypass Jev, including fresh and repeated clicks', async () => {
  for (const route of Object.keys(questions) as WolfekRoute[]) {
    for (const { id } of questions[route]) {
      const input = preparedInput(route, id)
      const request = route === 'learning.practice'
        ? { ...learningInput, question: input.question, preparedQuestionId: id } : input
      for (let click = 0; click < 2; click++) {
        const result = await executeWolfekPreparedQuestion('user', request)
        assert.equal(result.status, 'SUCCESS', `${route}:${id}`)
      }
    }
  }
  assert.equal(services.providerCalls, 0)
})

test('prepared delivery works without Jev and records deterministic usage', async () => {
  const result = await executeWolfekPreparedQuestion('user', preparedInput('panel.results', 'results_history'))
  assert.equal(result.answer?.text, 'Masz 17 ukończonych testów.')
  assert.equal(result.confidence, null)
  assert.equal(services.providerCalls, 0)
  assert.equal(services.deliveries, 0)
  assert.equal(services.completed, result)
  assert.equal(services.records[0]?.outcome, 'prepared')
})

test('access and rate limits reject prepared requests before loading private facts', async () => {
  services.allowed = false
  await assert.rejects(executeWolfekPreparedQuestion('user', learningInput), /Brak dostępu/)
  services.allowed = true
  services.limited = true
  await assert.rejects(executeWolfekPreparedQuestion('user', learningInput), /Zbyt wiele/)
  assert.equal(services.contextReads, 0)
  assert.equal(services.deliveries, 0)
})

test('learning buttons reach existing assistance delivery without Jev', async () => {
  const result = await executeWolfekPreparedQuestion('user', learningInput)
  assert.equal(result.answer?.action?.type, 'rag_hint')
  assert.equal(result.values?.origin, 'prepared')
  assert.equal(services.deliveries, 1)
  assert.equal(services.providerCalls, 0)
})

test('duplicate requests revalidate current facts without delivering assistance twice', async () => {
  services.replay = await executeWolfekPreparedQuestion('user', learningInput)
  const result = await executeWolfekPreparedQuestion('user', learningInput)
  assert.equal(result, services.replay)
  assert.equal(services.deliveries, 1)
  assert.equal(services.records.length, 1)
  services.allowed = false
  await assert.rejects(executeWolfekPreparedQuestion('user', learningInput), /Brak dostępu/)
})

test('replayed prepared answers cannot return stale personal results', async () => {
  const input = preparedInput('panel.results', 'results_history')
  services.replay = await executeWolfekPreparedQuestion('user', input)
  services.appContext = { ...context, facts: { results: { hasTests: true, completedTestCount: 18 } } }
  await assert.rejects(executeWolfekPreparedQuestion('user', input), /Dane lub dostęp/)
  assert.equal(services.records.length, 1)
})

test('typed questions and mismatched practice routes cannot enter prepared delivery', async () => {
  await assert.rejects(executeWolfekPreparedQuestion('user', { ...learningInput, origin: 'typed' }))
  await assert.rejects(executeWolfekPreparedQuestion('user', { ...learningInput, route: 'panel.home' }))
  assert.equal(services.contextReads, 0)
  assert.equal(services.providerCalls, 0)
})

test('typing a prepared prompt still invokes Jev and never substitutes the JSON answer', async () => {
  const previousKey = process.env.TYPESAFE_API_KEY
  process.env.TYPESAFE_API_KEY = 'offline-test-key'
  try {
    const input = { ...preparedInput('panel.results', 'results_history'), origin: 'typed' as const, preparedQuestionId: null }
    const result = await executeWolfekQuestion('user', input)
    assert.equal(services.providerCalls, 1)
    assert.equal(result.status, 'ERROR')
    assert.equal(result.answer, null)
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY
    else process.env.TYPESAFE_API_KEY = previousKey
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import questions from '@/content/wolfek/questions.json'
import results from '@/content/wolfek/panel-results.json'
import home from '@/content/wolfek/panel-home.json'
import kierunki from '@/content/wolfek/kierunki.json'
import learning from '@/content/wolfek/learning-practice.json'
import { WolfekPackSchema } from '@/server/schema'
import { buildWolfekPreparedBatch } from '@/helpers/buildWolfekPreparedBatch'
import { evaluateWolfekPreparedBatch } from '@/helpers/evaluateWolfekPreparedBatch'
import { getWolfekPreparedBatch } from '@/helpers/getWolfekPreparedBatch'
import { parseWolfekPreparedBatch } from '@/helpers/parseWolfekPreparedBatch'
import type { WolfekPreparedBatch } from '@/types/wolfekBatchTypes'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'

const input = { route: 'panel.results' as const, question: questions['panel.results'][0]!.prompt,
  origin: 'prepared' as const, preparedQuestionId: 'results_explain', submissionId: crypto.randomUUID(), practice: null }
const built = buildWolfekPreparedBatch(input, WolfekPackSchema.parse(results),
  { facts: { results: { completedTestCount: 17, hasTests: true } }, destinations: {} })
const raw = () => ({ model: 'jev-1.13.0', usage: { input_tokens: 100, output_tokens: 20 },
  answers: Object.fromEntries(built.preparedQuestions.flatMap(({ id }) => [
    [`${id}__response`, { type: 'choice', choice: 'test_count', confidence: .9,
      probabilities: Object.fromEntries(Object.keys(built.answers).map((key) => [key, key === 'test_count' ? 1 : 0])) }],
    [`${id}__needs_clarification`, { type: 'noul', noul: 0 }],
    [`${id}__answer_coverage`, { type: 'score', score: 2.98, confidence: .9,
      probabilities: { '0': 0, '1': 0, '2': 0, '3': 1 }, legend: { '0': '', '1': '', '2': '', '3': '' } }],
  ])) })

test('all prepared questions on each route share one state and one API envelope', () => {
  const packs = { kierunki, 'panel.home': home, 'panel.results': results, 'learning.practice': learning }
  for (const [route, pack] of Object.entries(packs)) {
    const batch = buildWolfekPreparedBatch({ ...input, route: route as WolfekRoute }, WolfekPackSchema.parse(pack),
      { facts: {}, destinations: {} })
    assert.equal(batch.preparedQuestions.length, questions[route as WolfekRoute].length)
    assert.equal(Object.keys(batch.payload.questions).length, batch.preparedQuestions.length * 3)
    for (const question of Object.values(batch.payload.questions)) {
      if ((question as { type: string }).type === 'choice') {
        assert.ok(Object.values((question as { criteria: object }).criteria).every((value) => value === null))
      }
    }
    assert.equal(JSON.stringify(batch.payload).includes('{{'), false)
  }
})

test('no load on visit; first click fetches all results once and later clicks reuse', async () => {
  const client = new QueryClient()
  const key = ['wolfek-prepared', 'visit-1', 'user-1', 'panel.results']
  let calls = 0
  const load = async (): Promise<WolfekPreparedBatch> => {
    const states = await evaluateWolfekPreparedBatch(built, async (_payload, parse) => { calls++; return parse(raw()) })
    return { id: crypto.randomUUID(), visitId: 'visit-1', contextVersion: 'facts-1', states }
  }
  assert.equal(calls, 0)
  const [first, duplicate] = await Promise.all([getWolfekPreparedBatch(client, key, load), getWolfekPreparedBatch(client, key, load)])
  assert.equal(calls, 1)
  assert.equal(first.id, duplicate.id)
  for (const button of built.preparedQuestions) {
    const cached = await getWolfekPreparedBatch(client, key, load)
    assert.equal(cached.states[button.id]?.answer?.text, 'Masz 17 ukończonych testów.')
  }
  assert.equal(calls, 1)
  client.removeQueries({ queryKey: ['wolfek-prepared', 'visit-1'] })
  await getWolfekPreparedBatch(client, key, load)
  assert.equal(calls, 2)
  await getWolfekPreparedBatch(client, ['wolfek-prepared', 'visit-2', 'user-1', 'panel.results'], load)
  await getWolfekPreparedBatch(client, ['wolfek-prepared', 'visit-2', 'user-2', 'panel.results'], load)
  await getWolfekPreparedBatch(client, ['wolfek-prepared', 'visit-2', 'user-2', 'panel.results', 'facts-2'], load)
  assert.equal(calls, 5)
  client.clear()
})

test('a failed batch never seeds results; invalid selected IDs cannot be reused', async () => {
  const corrupted = raw()
  const field = `${built.preparedQuestions[0]!.id}__response`
  ;(corrupted.answers[field] as { choice: string }).choice = 'invented'
  assert.equal(parseWolfekPreparedBatch(corrupted, built.preparedQuestions.map((q) => q.id), Object.keys(built.answers)), null)
  await assert.rejects(evaluateWolfekPreparedBatch(built, async () => null))
})

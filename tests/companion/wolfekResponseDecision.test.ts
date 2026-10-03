import assert from 'node:assert/strict'
import test from 'node:test'
import results from '@/content/wolfek/panel-results.json'
import { WolfekPackSchema } from '@/server/schema'
import { buildWolfekResponseRequest } from '@/helpers/buildWolfekResponseRequest'
import { evaluateWolfekResponse } from '@/helpers/evaluateWolfekResponse'
import { parseWolfekResponse } from '@/helpers/parseWolfekResponse'
import type { WolfekResponseEvaluator } from '@/types/wolfekResponseTypes'

const built = buildWolfekResponseRequest({ route: 'panel.results', question: 'Ile mam ukończonych testów?',
  origin: 'prepared', preparedQuestionId: 'results_history', submissionId: crypto.randomUUID(), practice: null },
WolfekPackSchema.parse(results), { facts: { results: { completedTestCount: 17, hasTests: true } }, destinations: {} })
const allowed = Object.keys(built.answers)
const response = (choice = 'test_count', confidence = .9) => ({
  model: 'jev-1.13.0',
  answers: {
    response: { type: 'choice', choice, confidence,
      probabilities: Object.fromEntries(allowed.map((id) => [id, id === choice ? 1 : 0])) },
    needs_clarification: { type: 'noul', noul: 0 },
    answer_coverage: { type: 'score', score: 3, confidence: .9,
      probabilities: { '0': 0, '1': 0, '2': 0, '3': 1 },
      legend: { '0': 'none', '1': 'partial', '2': 'clarify', '3': 'complete' } },
  },
  usage: { input_tokens: 100, output_tokens: 20 },
})

test('only Jev selection determines the displayed answer, not button identity', async () => {
  let calls = 0
  const evaluated = await evaluateWolfekResponse(built, async (payload, parse) => {
    calls++
    assert.equal((payload.state as { question: string }).question, 'Ile mam ukończonych testów?')
    return parse(response('history_location'))
  })
  assert.equal(calls, 1)
  assert.equal(evaluated.answer?.responseId, 'history_location')
  assert.equal(evaluated.answer?.text, built.answers.history_location?.text)
})

test('response selection invokes the evaluator each time', async () => {
  let calls = 0
  const evaluate: WolfekResponseEvaluator = async (_payload, parse) => {
    calls++
    return parse(response())
  }
  for (let i = 0; i < 2; i++) await evaluateWolfekResponse(built, evaluate)
  assert.equal(calls, 2)
})

test('invalid, missing or timed-out provider output never uses a direct FAQ fallback', async () => {
  await assert.rejects(evaluateWolfekResponse(built, async () => null))
  await assert.rejects(evaluateWolfekResponse(built, async (_payload, parse) => parse(response('invented'))))
  await assert.rejects(evaluateWolfekResponse(built, async () => { throw new Error('timeout') }))
  const unsure = await evaluateWolfekResponse(built, async (_payload, parse) => parse(response('test_count', .1)))
  assert.equal(unsure.answer, null)
})

test('all three response primitives and complete probability maps are validated', () => {
  assert.equal(parseWolfekResponse(response(), allowed)?.coverage, 3)
  assert.equal(parseWolfekResponse({ ...response(), model: 'wrong' }, allowed), null)
  const malformed = response()
  malformed.answers.answer_coverage.score = 4
  assert.equal(parseWolfekResponse(malformed, allowed), null)
  const missingNoul = { ...response(), answers: { response: response().answers.response } }
  assert.equal(parseWolfekResponse(missingNoul, allowed), null)
})

test('diagnostic Score differences do not reject a valid response Choice', async () => {
  const observed = response()
  observed.answers.answer_coverage.score = 2.98
  const evaluated = await evaluateWolfekResponse(built, async (_payload, parse) => parse(observed))
  assert.equal(evaluated.answer?.responseId, 'test_count')
  assert.equal(evaluated.decision.coverage, 2.98)
  observed.answers.answer_coverage.score = 2.82
  observed.answers.answer_coverage.probabilities = { '0': .01, '1': .03, '2': .11, '3': .85 }
  assert.equal(parseWolfekResponse(observed, allowed)?.responseId, 'test_count')
})

test('diagnostic differences never admit an unknown response or malformed distribution', () => {
  const observed = response()
  observed.answers.answer_coverage.score = 2.98
  observed.answers.response.choice = 'not_a_supplied_response'
  assert.equal(parseWolfekResponse(observed, allowed), null)
  observed.answers.response.choice = 'test_count'
  observed.answers.answer_coverage.probabilities = { '0': 0, '1': 0, '2': 0, '3': .5 }
  assert.equal(parseWolfekResponse(observed, allowed), null)
})

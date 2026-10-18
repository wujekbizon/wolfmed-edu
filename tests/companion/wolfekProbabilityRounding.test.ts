import assert from 'node:assert/strict'
import test from 'node:test'
import { parseWolfekResponse } from '@/helpers/parseWolfekResponse'

const allowed = ['exam_course', 'clarify', 'no_match']
const response = (total: number) => ({ model: 'jev-1.13.0', usage: { input_tokens: 8000, output_tokens: 1500 },
  answers: {
    response: { type: 'choice', choice: 'exam_course', confidence: .9,
      probabilities: { exam_course: total - .02, clarify: .01, no_match: .01 } },
    needs_clarification: { type: 'noul', noul: .01 },
    answer_coverage: { type: 'score', score: 2.98, confidence: .9,
      probabilities: { '0': 0, '1': .01, '2': .01, '3': total - .02 },
      legend: { '0': 'none', '1': 'partial', '2': 'clarification', '3': 'complete' } },
  } })

test('typed responses accept rounded Choice and Score totals of .99 and 1.01', () => {
  for (const total of [.99, 1, 1.01]) {
    assert.equal(parseWolfekResponse(response(total), allowed)?.responseId, 'exam_course')
  }
})

test('rounding tolerance still rejects malformed distributions, unknown IDs and missing judgments', () => {
  for (const total of [.97, 1.03]) assert.equal(parseWolfekResponse(response(total), allowed), null)
  const unknown = response(.99)
  unknown.answers.response.choice = 'invented'
  assert.equal(parseWolfekResponse(unknown, allowed), null)
  const missing = { ...response(.99), answers: { response: response(.99).answers.response } }
  assert.equal(parseWolfekResponse(missing, allowed), null)
})

test('near-tied rounded probabilities preserve Jev choice but reject a materially lower choice', () => {
  const observed = response(1)
  const answer = observed.answers.response
  answer.choice = 'clarify'
  answer.probabilities = { exam_course: .34, clarify: .33, no_match: .33 }
  assert.equal(parseWolfekResponse(observed, allowed)?.responseId, 'clarify')
  answer.probabilities = { exam_course: .5, clarify: .3, no_match: .2 }
  assert.equal(parseWolfekResponse(observed, allowed), null)
})

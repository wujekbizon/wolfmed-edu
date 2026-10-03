import assert from 'node:assert/strict'
import test from 'node:test'
import { parseWolfekPreparedBatch } from '@/helpers/parseWolfekPreparedBatch'

const allowed = ['exam_course', 'clarify', 'no_match']
const batch = (total: number) => ({ model: 'jev-1.13.0', usage: { input_tokens: 8000, output_tokens: 1500 },
  answers: Object.fromEntries(['exam', 'tiers'].flatMap((id) => [
    [`${id}__response`, { type: 'choice', choice: 'exam_course', confidence: .9,
      probabilities: { exam_course: total - .02, clarify: .01, no_match: .01 } }],
    [`${id}__needs_clarification`, { type: 'noul', noul: .01 }],
    [`${id}__answer_coverage`, { type: 'score', score: 2.98, confidence: .9,
      probabilities: { '0': 0, '1': .01, '2': .01, '3': total - .02 },
      legend: { '0': 'none', '1': 'partial', '2': 'clarification', '3': 'complete' } }],
  ])) })

test('prepared batches accept rounded Choice and Score totals of .99 and 1.01', () => {
  for (const total of [.99, 1, 1.01]) {
    const parsed = parseWolfekPreparedBatch(batch(total), ['exam', 'tiers'], allowed)
    assert.equal(parsed?.exam?.responseId, 'exam_course')
    assert.equal(parsed?.tiers?.responseId, 'exam_course')
  }
})

test('rounding tolerance still rejects malformed distributions, unknown IDs and missing judgments', () => {
  for (const total of [.97, 1.03]) assert.equal(parseWolfekPreparedBatch(batch(total), ['exam', 'tiers'], allowed), null)
  const unknown = batch(.99)
  ;(unknown.answers.exam__response as { choice: string }).choice = 'invented'
  assert.equal(parseWolfekPreparedBatch(unknown, ['exam', 'tiers'], allowed), null)
  const missing = batch(.99)
  delete missing.answers.tiers__needs_clarification
  assert.equal(parseWolfekPreparedBatch(missing, ['exam', 'tiers'], allowed), null)
})

test('near-tied rounded probabilities preserve Jev choice but reject a materially lower choice', () => {
  const observed = batch(1)
  const answer = observed.answers.exam__response as {
    choice: string; probabilities: Record<string, number>
  }
  answer.choice = 'clarify'
  answer.probabilities = { exam_course: .34, clarify: .33, no_match: .33 }
  assert.equal(parseWolfekPreparedBatch(observed, ['exam', 'tiers'], allowed)?.exam?.responseId, 'clarify')
  answer.probabilities = { exam_course: .5, clarify: .3, no_match: .2 }
  assert.equal(parseWolfekPreparedBatch(observed, ['exam', 'tiers'], allowed), null)
})

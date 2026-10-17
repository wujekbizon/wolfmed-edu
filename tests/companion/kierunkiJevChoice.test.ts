import assert from 'node:assert/strict'
import test from 'node:test'
import { JEV_MODEL } from '@/constants/jev'
import { KIERUNKI_WOLFEK_TOPIC_IDS } from '@/constants/kierunkiWolfek'
import { parseKierunkiJevChoice } from '@/helpers/parseKierunkiJevChoice'

const choices = [...KIERUNKI_WOLFEK_TOPIC_IDS, 'other']

function response(choice = 'exam_preparation') {
  const probabilities = Object.fromEntries(choices.map((id) => [id, id === choice ? 1 : 0]))
  return { model: JEV_MODEL, answers: { guide: {
    type: 'choice', choice, confidence: 1, probabilities,
  } }, usage: { input_tokens: 250, output_tokens: 16 } }
}

test('accepts an allowed course guidance topic', () => {
  assert.deepEqual(parseKierunkiJevChoice(response()), { topic: 'exam_preparation', confidence: 1 })
})

test('rejects invented, incomplete, and wrong-model decisions', () => {
  assert.equal(parseKierunkiJevChoice(response('checkout_now')), null)
  assert.equal(parseKierunkiJevChoice({ ...response(), answers: { guide: {
    type: 'choice', choice: 'exam_preparation', confidence: 1, probabilities: { exam_preparation: 1 },
  } } }), null)
  assert.equal(parseKierunkiJevChoice({ ...response(), model: 'another-model' }), null)
})

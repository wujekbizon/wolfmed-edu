import assert from 'node:assert/strict'
import test from 'node:test'
import { JEV_MODEL } from '@/constants/jev'
import { PANEL_WOLFEK_TOPIC_IDS } from '@/constants/panelWolfek'
import { parsePanelJevChoice } from '@/helpers/parsePanelJevChoice'

const choices = [...PANEL_WOLFEK_TOPIC_IDS, 'other']
const probabilities = Object.fromEntries(choices.map((id) => [id, id === 'billing' ? 1 : 0]))

function response(choice = 'billing', values = probabilities) {
  return { model: JEV_MODEL, answers: { help: {
    type: 'choice', choice, confidence: 1, probabilities: values,
  } }, usage: { input_tokens: 300, output_tokens: 20 } }
}

test('accepts a complete Choice decision', () => {
  assert.deepEqual(parsePanelJevChoice(response()), { topic: 'billing', confidence: 1 })
})

test('rejects invented and incomplete topics', () => {
  assert.equal(parsePanelJevChoice(response('delete_account')), null)
  assert.equal(parsePanelJevChoice(response('billing', { billing: 1 })), null)
})

test('rejects invalid probabilities and model versions', () => {
  assert.equal(parsePanelJevChoice(response('billing', { ...probabilities, other: .5 })), null)
  assert.equal(parsePanelJevChoice({ ...response(), model: 'another-model' }), null)
})

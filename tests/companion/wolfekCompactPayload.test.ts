import assert from 'node:assert/strict'
import test from 'node:test'
import results from '@/content/wolfek/panel-results.json'
import { WolfekPackSchema } from '@/server/schema'
import { buildWolfekResponseRequest } from '@/helpers/buildWolfekResponseRequest'
import { getWolfekDecisionFacts } from '@/helpers/getWolfekDecisionFacts'

test('complete responses appear once; bulk feature aliases and action URLs stay local', () => {
  const input = { route: 'panel.results' as const, question: 'Ile mam testów?', origin: 'typed' as const,
    preparedQuestionId: null, submissionId: crypto.randomUUID(), practice: null }
  const text = 'This deliberately long repeated feature description is unnecessary because the response already carries its factual information.'
  const context = { facts: { results: { completedTestCount: 17, hasTests: true },
    catalog: { courses: { opiekun: { basicFeaturesText: text, featuresText: text } },
      opiekun: { basicFeaturesText: text, featuresText: text } } }, destinations: {} }
  const built = buildWolfekResponseRequest(input, WolfekPackSchema.parse(results), context)
  const body = JSON.stringify(built.payload)
  assert.equal(body.includes(text), false)
  assert.equal(body.split('Masz 17 ukończonych testów.').length - 1, 1)
  const choices = (built.payload.questions.response as { criteria: Record<string, null> }).criteria
  assert.ok(Object.values(choices).every((value) => value === null))
  assert.ok(built.answers.test_count)
})

test('flags, zero values and current learning question remain available for judgments', () => {
  const facts = getWolfekDecisionFacts({ access: { signedIn: true }, results: { completedTestCount: 0 },
    card: { questionText: 'Pytanie medyczne', reviewedHintText: 'Already in a response' }, payments: { supported: null } })
  assert.deepEqual(facts, { access: { signedIn: true }, results: { completedTestCount: 0 },
    card: { questionText: 'Pytanie medyczne' }, payments: { supported: null } })
})

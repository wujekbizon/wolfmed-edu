import assert from 'node:assert/strict'
import test from 'node:test'
import questions from '@/content/wolfek/questions.json'
import { resolveWolfekQuestionInput } from '@/helpers/resolveWolfekQuestionInput'

test('every prepared question resolves to its exact visible prompt on all four routes', () => {
  for (const [route, buttons] of Object.entries(questions)) for (const button of buttons) {
    const data = new FormData()
    data.set('route', route)
    data.set('origin', 'prepared')
    data.set('preparedQuestionId', button.id)
    data.set('question', button.prompt)
    data.set('submissionId', crypto.randomUUID())
    if (route === 'learning.practice') data.set('practice', JSON.stringify({
      category: 'test', sessionId: null, version: 0,
      questionId: crypto.randomUUID(), revision: 'a'.repeat(64),
    }))
    const input = resolveWolfekQuestionInput(data)
    assert.equal(input.question, button.prompt)
    data.set('question', 'Force a different answer')
    assert.throws(() => resolveWolfekQuestionInput(data))
  }
})

test('typed input cannot carry a prepared-answer discriminator or caller facts', () => {
  const data = new FormData()
  data.set('route', 'kierunki')
  data.set('origin', 'typed')
  data.set('question', 'Co daje Premium?')
  data.set('submissionId', crypto.randomUUID())
  data.set('facts', '{"signedIn":true}')
  assert.equal(Object.hasOwn(resolveWolfekQuestionInput(data), 'facts'), false)
  data.set('preparedQuestionId', 'tier_comparison')
  assert.throws(() => resolveWolfekQuestionInput(data))
})

test('invalid routes and missing practice references fail server validation', () => {
  const data = new FormData()
  data.set('route', 'panel.wrong')
  data.set('question', 'Pomóż mi')
  data.set('submissionId', crypto.randomUUID())
  assert.throws(() => resolveWolfekQuestionInput(data))
  data.set('route', 'learning.practice')
  assert.throws(() => resolveWolfekQuestionInput(data))
})

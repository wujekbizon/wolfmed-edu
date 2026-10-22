import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { toFormState } from '@/helpers/toFormState'
import { wolfekAction } from '../support/wolfekAction'
import { loadRateLimiter } from '../support/loadRateLimiter'
import { createMemoryRedis } from './fixtures/createMemoryRedis'

test('Wolfek blocks excess requests before retrieval or generation', async () => {
  const errors: unknown[] = []
  const check = loadRateLimiter(createMemoryRedis(), { onError: (...args) => errors.push(args) })
  const { askRagQuestion, counts } = wolfekAction('user-a', check)
  const results = await Promise.all(Array.from({ length: 20 }, () => {
    const form = new FormData()
    form.set('question', 'Wyjaśnij budowę serca')
    form.set('cellId', randomUUID())
    form.set('commandsEnabled', 'false')
    return askRagQuestion(toFormState('UNSET', ''), form)
  }))
  assert.equal(results.filter(result => result.status === 'SUCCESS').length, 10)
  assert.equal(results.filter(result => result.message.startsWith('Zbyt wiele zapytań')).length, 10)
  assert.deepEqual(counts(), { generated: 10, retrievals: 10 })
  assert.deepEqual(errors, [])
})

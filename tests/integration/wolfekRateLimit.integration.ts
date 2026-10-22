import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { toFormState } from '@/helpers/toFormState'
import { liveLimiter } from './support/liveLimiter'
import { wolfekAction } from '../support/wolfekAction'

const live = liveLimiter('wolfek')
const userId = `smoke-${live.runId}`
try {
  for (const mode of ['old', 'fixed'] as const) {
    const { askRagQuestion, counts } = wolfekAction(userId, live.check(mode))
    const batch = await Promise.allSettled(Array.from({ length: 20 }, () => {
      const form = new FormData()
      form.set('question', 'Wyjaśnij budowę serca')
      form.set('cellId', randomUUID())
      form.set('commandsEnabled', 'false')
      return askRagQuestion(toFormState('UNSET', ''), form)
    }))
    const responses = batch.map(item => {
      assert.equal(item.status, 'fulfilled', 'Wolfek action threw unexpectedly')
      return (item as PromiseFulfilledResult<Awaited<ReturnType<typeof askRagQuestion>>>).value
    })
    const accepted = responses.filter(item => item.status === 'SUCCESS' && item.values?.answer === 'Offline model stub').length
    const blocked = responses.filter(item => item.status === 'ERROR' && item.message.startsWith('Zbyt wiele zapytań')).length
    assert.equal(accepted + blocked, 20, 'Unexpected Wolfek action response')
    assert.deepEqual(counts(), { generated: accepted, retrievals: accepted })
    console.log(JSON.stringify({ mode, concurrent: 20, limit: 10, accepted, blocked, modelStubs: counts().generated }))
    if (mode === 'fixed') assert.equal(accepted, 10)
    else console.log(`Legacy race reproduced: ${accepted > 10}; live timing may vary`)
  }
} finally {
  await live.cleanup()
}

import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import { getWolfekPreparedResult } from '@/helpers/getWolfekPreparedResult'
import { getWolfekPreparedScope } from '@/helpers/getWolfekPreparedScope'
import { toFormState } from '@/helpers/toFormState'
import type { WolfekPreparedActions } from '@/types/wolfekBatchTypes'
import { learningInput } from './fixtures/wolfekLearningBatch'
import { practiceView } from './fixtures/practiceView'

test('hint then comparison reuse one batch while delivering the latest session version each time', async (context) => {
  const client = new QueryClient()
  context.after(() => client.clear())
  let loads = 0
  const versions: number[] = []
  const actions: WolfekPreparedActions = {
    load: async () => ({ ...toFormState('SUCCESS', ''), batch: {
      id: `batch-${++loads}`, visitId: 'visit-1', contextVersion: 'same-facts', states: {},
    } }),
    consume: async (data) => {
      versions.push(JSON.parse(String(data.get('practice'))).version)
      return { ...toFormState('SUCCESS', ''), answer: null, confidence: 1,
        session: practiceView({ version: versions.at(-1)! + 1 }) }
    },
  }
  for (const [version, preparedQuestionId] of [[0, 'hint'], [1, 'compare'], [2, 'hint']] as const) {
    const practice = { ...learningInput.practice, sessionId: version ? 'session-1' : null, version }
    const data = new FormData()
    data.set('practice', JSON.stringify(practice))
    data.set('preparedQuestionId', preparedQuestionId)
    data.set('submissionId', crypto.randomUUID())
    const key = ['wolfek-prepared', 'visit-1', 'user-1', learningInput.route, getWolfekPreparedScope(practice)]
    await getWolfekPreparedResult(client, key, data, actions, () => {})
    assert.equal(data.get('batchId'), 'batch-1')
  }
  assert.equal(loads, 1)
  assert.deepEqual(versions, [0, 1, 2])
})

test('server invalidation rebuilds with a fresh submission ID rather than replaying the expired batch', async (context) => {
  const client = new QueryClient()
  context.after(() => client.clear())
  const data = new FormData()
  const originalId = crypto.randomUUID()
  data.set('submissionId', originalId)
  const submissions: string[] = []
  let deliveries = 0
  const result = await getWolfekPreparedResult(client, ['wolfek-prepared', 'visit-1'], data, {
    load: async (request) => {
      submissions.push(String(request.get('submissionId')))
      return { ...toFormState('SUCCESS', ''), batch: {
        id: `batch-${submissions.length}`, visitId: 'visit-1', contextVersion: 'facts', states: {},
      } }
    },
    consume: async (request) => {
      deliveries++
      if (deliveries === 1) return { ...toFormState('ERROR', 'Changed'), answer: null,
        confidence: null, values: { batchInvalidated: true } }
      assert.equal(request.get('batchId'), 'batch-2')
      return { ...toFormState('SUCCESS', ''), answer: null, confidence: 1 }
    },
  }, () => {})
  assert.equal(result.status, 'SUCCESS')
  assert.equal(submissions[0], originalId)
  assert.notEqual(submissions[1], originalId)
  assert.equal(deliveries, 2)
})

test('a conflict does not trigger automatic resubmission or another Jev batch', async (context) => {
  const client = new QueryClient()
  context.after(() => client.clear())
  let loads = 0
  const result = await getWolfekPreparedResult(client, ['wolfek-prepared', 'visit-1'], new FormData(), {
    load: async () => ({ ...toFormState('SUCCESS', ''), batch: {
      id: `batch-${++loads}`, visitId: 'visit-1', contextVersion: 'facts', states: {},
    } }),
    consume: async () => ({ ...toFormState('ERROR', 'Conflict'), answer: null, confidence: null,
      session: practiceView({ version: 11 }) }),
  }, () => {})
  assert.equal(result.status, 'ERROR')
  assert.equal(result.session?.version, 11)
  assert.equal(loads, 1)
})

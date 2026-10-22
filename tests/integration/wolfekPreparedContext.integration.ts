import assert from 'node:assert/strict'
import { preparedContextHooks } from './support/mockPreparedContextBoundaries'
import { preparedContextProbe as probe } from './support/preparedContextProbe'
import { preparedInput, packs } from '../companion/fixtures/wolfekPrepared'
import { verifyPreparedContextAnswers } from './support/verifyPreparedContextAnswers'

const baseline = process.argv.includes('--baseline')
const { executeWolfekPreparedQuestion: execute } = await import('@/server/companion/executeWolfekPreparedQuestion')
const unrelated = () => probe.reads.filter(name => name !== 'access.enrollment')
const budgets: { question: string; unrelatedReads: string[] }[] = []

try {
  for (const [question, responseId] of [['username', 'username_edit'], ['motto', 'motto_edit'], ['feedback', 'feedback']]) {
    probe.reset()
    const result = await execute('f03-user', preparedInput('panel.home', question!))
    const expected = packs['panel.home'].options.find(option => option.id === responseId)
    assert.ok(expected)
    assert.equal(result.status, 'SUCCESS')
    assert.equal(result.answer?.responseId, responseId)
    assert.equal(result.answer?.text, expected.template, 'Static answer changed')
    assert.ok(probe.reads.includes('access.enrollment'), 'Authorization must still read course access')
    assert.deepEqual(probe.events, ['rateLimit', 'submission', 'telemetry', 'complete'])
    budgets.push({ question: question!, unrelatedReads: [...unrelated()] })
    console.log(JSON.stringify({ audit: 'F03', route: 'panel.home', preparedWolfekQuestion: question,
      unrelatedLoaderCalls: unrelated().length, dataLoaderCalls: probe.reads, targetUnrelatedReads: 0 }))
  }

  probe.reset()
  let releaseBilling!: () => void
  const billingGate = new Promise<void>(resolve => { releaseBilling = resolve })
  let billingStarted!: () => void
  const started = new Promise<'billing'>(resolve => { billingStarted = () => resolve('billing') })
  probe.billingWait = () => { billingStarted(); return billingGate }
  const answer = execute('f03-user', preparedInput('panel.home', 'motto'))
  let first: 'billing' | 'answer'
  try {
    first = await Promise.race([started, answer.then(() => 'answer' as const)])
  } finally {
    releaseBilling()
    await answer
  }
  console.log(JSON.stringify({ audit: 'F03', preparedWolfekQuestion: 'motto', blockedByUnrelatedBilling: first === 'billing' }))

  probe.reset()
  const results = await execute('f03-user', preparedInput('panel.results', 'results_history'))
  assert.equal(results.answer?.text, 'Masz 17 ukończonych testów.')
  assert.ok(probe.reads.includes('tests.totals'), 'Dynamic result answers still need result facts')

  probe.reset()
  probe.enrolled = false
  await assert.rejects(execute('f03-user', preparedInput('panel.home', 'motto')), /Brak dostępu/)
  assert.deepEqual(unrelated(), [], 'Unauthorized request loaded private dashboard facts')
  assert.deepEqual(probe.events, [])
  console.log('Dynamic result accuracy and unauthorized-request controls passed')

  if (baseline) {
    console.log('Baseline measured; optimization budgets not enforced in --baseline mode')
  } else {
    assert.equal(first, 'answer', 'F03: static motto answer waits for unrelated billing')
    assert.deepEqual(budgets.map(row => ({ question: row.question, unrelatedReads: row.unrelatedReads })),
      budgets.map(row => ({ question: row.question, unrelatedReads: [] })),
      'F03: static prepared answers must not load unrelated dashboard facts')
    await verifyPreparedContextAnswers()
    console.log('F03 optimization budgets passed')
  }
} finally {
  preparedContextHooks.deregister()
}

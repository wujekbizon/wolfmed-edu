import assert from 'node:assert/strict'
import { testFactsHooks } from './support/mockTestFactsBoundaries'
import { testFactsProbe as probe } from './support/testFactsDatabaseProbe'
import { preparedContextProbe } from './support/preparedContextProbe'
import { preparedInput } from '../companion/fixtures/wolfekPrepared'

const baseline = process.argv.includes('--baseline')
const { executeWolfekPreparedQuestion: execute } = await import('@/server/companion/executeWolfekPreparedQuestion')
const askCount = () => execute('f03-user', preparedInput('panel.results', 'results_history'))
const measurements = []

try {
  for (const count of [1, 1000]) {
    preparedContextProbe.reset()
    probe.reset(count)
    const result = await askCount()
    assert.equal(result.status, 'SUCCESS')
    assert.equal(result.answer?.text, `Masz ${count} ukończonych testów.`)
    const measurement = { audit: 'F04', preparedWolfekQuestion: 'results_history', completedTests: count,
      queries: probe.queries.length, returnedRows: probe.queries.reduce((sum, query) => sum + query.rows, 0),
      serializedResultBytes: probe.queries.reduce((sum, query) => sum + query.serializedResultBytes, 0),
      answerEntriesLoaded: probe.queries.reduce((sum, query) => sum + query.answerEntries, 0),
      queryDetails: [...probe.queries] }
    measurements.push(measurement)
    console.log(JSON.stringify(measurement))
  }

  probe.reset(0)
  const empty = await askCount()
  assert.equal(empty.status, 'SUCCESS')
  assert.equal(empty.answer?.responseId, 'history_empty')

  probe.reset(2)
  probe.history[0]!.sessionLinked = false
  assert.equal((await askCount()).answer?.text, 'Masz 1 ukończonych testów.', 'Nullable legacy session IDs must retain existing count semantics')

  probe.reset(1)
  probe.failedQuery = 'totals'
  const failed = await askCount()
  assert.equal(failed.status, 'SUCCESS')
  assert.ok(failed.answer?.responseId.startsWith('unavailable_'), 'Failed count must not be presented as zero')

  probe.reset(1)
  probe.failedQuery = 'history'
  assert.equal((await askCount()).answer?.text, 'Masz 1 ukończonych testów.')

  preparedContextProbe.reset()
  preparedContextProbe.enrolled = false
  probe.reset(1)
  await assert.rejects(askCount(), /Brak dostępu/)
  assert.equal(probe.queries.length, 0)
  console.log('Correct counts, empty history, failed reads and access rejection checks passed')

  if (baseline) {
    console.log(measurements[1]!.answerEntriesLoaded > 0
      ? 'F04 reproduced: a count-only answer loads answer history; payload grows with history'
      : 'Current measurement: no answer history loaded for the count-only question')
  } else {
    for (const measurement of measurements) {
      assert.equal(measurement.queries, 1, 'F04: count-only answer should use one aggregate query')
      assert.equal(measurement.returnedRows, 1)
      assert.equal(measurement.answerEntriesLoaded, 0)
      assert.deepEqual(measurement.queryDetails[0]!.fields, ['count'])
    }
    console.log('F04 optimization budgets passed')
  }
} finally {
  testFactsHooks.deregister()
}

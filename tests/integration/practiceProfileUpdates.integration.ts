import assert from 'node:assert/strict'
import { createProjectionState, profileEvent, projectionUser, projectionCategory,
  verifyFinalProjection } from './support/profileProjectionFixture'
import { loadProfileProjection } from './support/loadProfileProjection'

const reproduce = process.argv.includes('--reproduce')
const measurements = []
for (const scenario of ['single', 'burst', 'sequential', 'already-current'] as const) {
  const state = createProjectionState()
  const update = loadProfileProjection(state)
  if (scenario === 'already-current') {
    assert.equal(await update(projectionUser, projectionCategory), true)
    for (const name of Object.keys(state.metrics) as Array<keyof typeof state.metrics>) state.metrics[name] = 0
  }
  const calls = scenario === 'single' ? 1 : 10
  if (scenario === 'burst') state.events.push(...Array.from({ length: 10 }, (_, i) => profileEvent(120 + i)))
  if (scenario === 'sequential') {
    for (let i = 0; i < calls; i++) {
      state.events.push(profileEvent(120 + i))
      assert.equal(await update(projectionUser, projectionCategory), true)
    }
  } else {
    const results = await Promise.all(Array.from({ length: calls }, () => update(projectionUser, projectionCategory)))
    assert.ok(results.every(Boolean))
  }
  const final = verifyFinalProjection(state)
  assert.equal(state.metrics.openTransactions, 0)
  assert.equal(state.metrics.transactions, calls)
  assert.equal(state.metrics.historyReads, calls)
  assert.equal(state.metrics.historyRows, calls * 120)
  assert.equal(state.metrics.profileReads, calls)
  const writes = scenario === 'already-current' ? 0 : scenario === 'sequential' ? 10 : 1
  assert.equal(state.metrics.factWrites, writes)
  assert.equal(state.metrics.episodeWrites, writes)
  assert.equal(state.facts.size, 1)
  assert.equal(state.episodes.size, 1)
  if (scenario === 'burst' || scenario === 'already-current') {
    assert.equal(state.metrics.peakOpenTransactions, 3)
    assert.equal(state.metrics.poolWaits, 7)
    assert.equal(state.metrics.peakPoolQueue, 7)
    assert.equal(state.metrics.lockWaits, 9)
    assert.equal(state.metrics.peakLockQueue, 2)
  }
  const measurement = { scenario, calls, ...state.metrics, finalEventId: final.lastEventId,
    finalCards: final.cards, profileCorrect: true }
  measurements.push(measurement)
  console.log(JSON.stringify(measurement))
}

const isolated = createProjectionState()
isolated.events.push(...Array.from({ length: 120 }, (_, i) => profileEvent(i, 'foreign-user')))
isolated.events.push(...Array.from({ length: 120 }, (_, i) => profileEvent(i, projectionUser, 'other-category')))
const update = loadProfileProjection(isolated)
await Promise.all([update(projectionUser, projectionCategory), update('foreign-user', projectionCategory),
  update(projectionUser, 'other-category')])
verifyFinalProjection(isolated)
verifyFinalProjection(isolated, 'foreign-user')
verifyFinalProjection(isolated, projectionUser, 'other-category')
assert.equal(isolated.facts.size, 3)
assert.equal(isolated.metrics.lockWaits, 0)
assert.equal(isolated.metrics.historyRows, 360)
console.log('Scope isolation, final profile/episode, history cap and drained transactions: PASS')
if (reproduce) {
  assert.equal(measurements.find(row => row.scenario === 'burst')!.historyReads, 1,
    'Reproduced: ten same-scope notifications repeat history reads despite one final profile write')
}
console.log('Background profile reproduction: PASS; mock pool/locks/writes; no production timing/billing measured')

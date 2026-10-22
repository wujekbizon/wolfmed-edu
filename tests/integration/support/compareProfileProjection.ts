import assert from 'node:assert/strict'
import { createProjectionState, profileEvent, projectionUser, projectionCategory,
  verifyFinalProjection } from './profileProjectionFixture'
import { loadProfileProjection } from './loadProfileProjection'

export async function compareProfileProjection(scenario: 'single' | 'burst' | 'sequential' | 'already-current') {
  const seed = createProjectionState()
  const additions = Array.from({ length: 10 }, (_, i) => profileEvent(120 + i))
  if (scenario === 'already-current') {
    assert.equal(await loadProfileProjection(seed)(projectionUser, projectionCategory), true)
    for (const name of Object.keys(seed.metrics) as Array<keyof typeof seed.metrics>) seed.metrics[name] = 0
  }
  const results = []
  for (const variant of ['baseline', 'candidate'] as const) {
    const state = structuredClone(seed)
    const update = loadProfileProjection(state, variant === 'candidate')
    const calls = scenario === 'single' ? 1 : 10
    if (scenario === 'burst') state.events.push(...structuredClone(additions))
    if (scenario === 'sequential') {
      for (const event of additions) {
        state.events.push(structuredClone(event))
        assert.equal(await update(projectionUser, projectionCategory), true)
      }
    } else {
      const replies = await Promise.all(Array.from({ length: calls }, () => update(projectionUser, projectionCategory)))
      assert.ok(replies.every(Boolean))
    }
    verifyFinalProjection(state)
    assert.equal(state.metrics.openTransactions, 0)
    results.push({ variant, state })
    console.log(JSON.stringify({ scenario, variant, calls, ...state.metrics, profileCorrect: true }))
  }
  const baseline = results[0]!.state
  const candidate = results[1]!.state
  assert.deepEqual(candidate.facts, baseline.facts, 'Final fact payload must be identical')
  assert.deepEqual(candidate.episodes, baseline.episodes, 'Final episode payload must be identical')
  assert.deepEqual(candidate.events, baseline.events, 'Raw events must remain unchanged')
  const expected = scenario === 'burst' || scenario === 'already-current' ? 1 : baseline.metrics.historyReads
  assert.equal(candidate.metrics.historyReads, expected, 'Candidate must coalesce burst history reads')
  assert.equal(candidate.metrics.transactions, expected)
  assert.equal(candidate.metrics.historyRows, expected * 120)
  assert.equal(candidate.metrics.factWrites, baseline.metrics.factWrites)
  assert.equal(candidate.metrics.episodeWrites, baseline.metrics.episodeWrites)
  assert.equal(candidate.metrics.poolWaits, 0)
  assert.equal(candidate.metrics.lockWaits, 0)
}

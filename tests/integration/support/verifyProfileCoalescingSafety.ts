import assert from 'node:assert/strict'
import { coalesceProfileProjection } from './coalesceProfileProjection'
import { createProjectionState, profileEvent, projectionUser, projectionCategory,
  verifyFinalProjection } from './profileProjectionFixture'
import { loadProfileProjection } from './loadProfileProjection'

export async function verifyProfileCoalescingSafety() {
  const seed = createProjectionState()
  const additions = Array.from({ length: 9 }, (_, i) => profileEvent(120 + i))
  const states = []
  for (const variant of ['baseline', 'candidate'] as const) {
    const state = structuredClone(seed)
    const update = loadProfileProjection(state, variant === 'candidate')
    let snapshotRead!: () => void
    let releaseRead!: () => void
    const ready = new Promise<void>(resolve => { snapshotRead = resolve })
    const release = new Promise<void>(resolve => { releaseRead = resolve })
    let first = true
    state.afterHistoryRead = async () => {
      if (!first) return
      first = false
      snapshotRead()
      await release
    }
    const initial = update(projectionUser, projectionCategory)
    await ready
    state.events.push(...structuredClone(additions))
    const later = additions.map(() => update(projectionUser, projectionCategory))
    releaseRead()
    assert.ok((await Promise.all([initial, ...later])).every(Boolean))
    verifyFinalProjection(state)
    assert.equal(state.metrics.openTransactions, 0)
    assert.equal(state.metrics.historyReads, variant === 'baseline' ? 10 : 2)
    assert.equal(state.metrics.factWrites, 2)
    assert.equal(state.metrics.episodeWrites, 2)
    console.log(JSON.stringify({ scenario: 'events-during-read', variant, ...state.metrics, profileCorrect: true }))
    states.push(state)
  }
  assert.deepEqual(states[0]!.facts, states[1]!.facts)
  assert.deepEqual(states[0]!.episodes, states[1]!.episodes)
  assert.deepEqual(states[0]!.events, states[1]!.events)

  const isolated = createProjectionState()
  isolated.events.push(...Array.from({ length: 120 }, (_, i) => profileEvent(i, 'foreign-user')))
  isolated.events.push(...Array.from({ length: 120 }, (_, i) => profileEvent(i, projectionUser, 'other-category')))
  const update = loadProfileProjection(isolated, true)
  const scopes = [[projectionUser, projectionCategory], ['foreign-user', projectionCategory],
    [projectionUser, 'other-category']] as const
  const replies = await Promise.all(scopes.flatMap(([user, category]) =>
    Array.from({ length: 10 }, () => update(user, category))))
  assert.ok(replies.every(Boolean))
  for (const [user, category] of scopes) verifyFinalProjection(isolated, user, category)
  assert.equal(isolated.facts.size, 3)
  assert.equal(isolated.metrics.historyReads, 3)
  assert.equal(isolated.metrics.lockWaits, 0)

  const separate = createProjectionState()
  const workers = [loadProfileProjection(separate, true), loadProfileProjection(separate, true)]
  await Promise.all(workers.flatMap(worker => Array.from({ length: 10 }, () =>
    worker(projectionUser, projectionCategory))))
  verifyFinalProjection(separate)
  assert.equal(separate.metrics.historyReads, 2, 'Separate instances cannot share local coalescing')
  assert.equal(separate.metrics.factWrites, 1)

  for (const failure of ['false', 'throw'] as const) {
    let calls = 0
    const retry = coalesceProfileProjection(async () => {
      if (++calls > 1) return true
      if (failure === 'throw') throw new Error('Synthetic failure')
      return false
    })
    const first = retry(projectionUser, projectionCategory)
    const second = retry(projectionUser, projectionCategory)
    assert.equal(first, second)
    if (failure === 'throw') await assert.rejects(first, /Synthetic failure/)
    else assert.equal(await first, false)
    assert.equal(await retry(projectionUser, projectionCategory), true)
    assert.equal(calls, 2)
  }
  console.log('New events during work, scope isolation and false/rejection retry cleanup: PASS')
}

import assert from 'node:assert/strict'
import { practiceReadProbe as probe, practiceProbeUser, practiceProbeId } from './practiceReadProbe'
import { learningInput } from '../../companion/fixtures/wolfekLearning'

export async function verifyPracticeReadSafety(revision: string) {
  const { executeWolfekPreparedQuestion: execute } = await import('@/server/companion/executeWolfekPreparedQuestion')
  const input = { ...learningInput, practice: { ...learningInput.practice,
    revision, sessionId: practiceProbeId(9999), version: 0 } }
  for (const stale of [false, true]) {
    probe.reset(100, revision)
    probe.cachedHelp = true
    probe.changeVersionDuringCache = stale
    const cached = await execute(practiceProbeUser, input)
    assert.equal(cached.status, stale ? 'ERROR' : 'SUCCESS')
    assert.equal(probe.metrics.assistanceWrites, stale ? 0 : 1)
    assert.equal(probe.metrics.modelCalls, 0)
    assert.equal(probe.metrics.cardReads, 2)

    probe.reset(100, revision)
    probe.noSources = true
    probe.changeVersionDuringRetrieval = stale
    const noSource = await execute(practiceProbeUser, input)
    assert.equal(noSource.status, stale ? 'ERROR' : 'SUCCESS')
    assert.equal(probe.metrics.assistanceWrites, 0)
    assert.equal(probe.metrics.modelCalls, 0)
    assert.equal(probe.metrics.cacheWrites, 0)
    assert.equal(probe.metrics.cardReads, 2)
  }

  probe.reset(1, revision)
  probe.changeVersionDuringModel = true
  assert.equal((await execute(practiceProbeUser, input)).status, 'ERROR')
  assert.equal(probe.metrics.cacheWrites, 0, 'Stale generation must not populate Redis')

  probe.reset(1, revision)
  probe.failPersistence = true
  assert.equal((await execute(practiceProbeUser, input)).status, 'ERROR')
  assert.equal(probe.metrics.cacheWrites, 0, 'Failed assistance commit must not populate Redis')

  probe.reset(100, revision)
  probe.expectExplain = true
  const reveal = await execute(practiceProbeUser, { ...input, preparedQuestionId: 'reveal_tutor' })
  assert.equal(reveal.status, 'SUCCESS', reveal.message)
  assert.equal(reveal.values?.learningMode, 'explain')
  assert.equal(probe.metrics.cardReads, 3, 'Reveal must refresh the snapshot after its session mutation')
  assert.equal(probe.metrics.assistanceWrites, 1)
  assert.equal(probe.metrics.reviewQuestionReads, 0)

  probe.reset(100, revision)
  const noSession = await execute(practiceProbeUser, { ...input, practice: { ...input.practice, sessionId: null } })
  assert.equal(noSession.status, 'SUCCESS', noSession.message)
  assert.equal(probe.metrics.queries, 2, 'No-session help needs no deck count or navigation queries')
  console.log('Cache/no-source freshness, no stale cache writes, reveal refresh and no-session controls passed')
}

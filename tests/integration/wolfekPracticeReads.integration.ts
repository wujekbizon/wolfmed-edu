import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { practiceReadHooks } from './support/mockPracticeReadBoundaries'
import { practiceReadProbe as probe, practiceProbeId, practiceProbeQuestion, practiceProbeUser } from './support/practiceReadProbe'
import { learningInput } from '../companion/fixtures/wolfekLearning'
import type { WolfekQuestionRequest } from '@/types/wolfekResponseTypes'
import type { PracticeReadMeasurement } from './support/practiceReadProbeTypes'
import { verifyPracticeReadSafety } from './support/verifyPracticeReadSafety'

const baseline = process.argv.includes('--baseline')
const { executeWolfekPreparedQuestion: execute } = await import('@/server/companion/executeWolfekPreparedQuestion')
const { getPracticeRevision } = await import('@/helpers/getPracticeRevision')
const revision = getPracticeRevision(practiceProbeQuestion)
const input = (mode: 'hint' | 'compare'): WolfekQuestionRequest => ({ ...learningInput,
  preparedQuestionId: mode, submissionId: randomUUID(), practice: { ...learningInput.practice,
    sessionId: practiceProbeId(9999), questionId: practiceProbeId(1), revision, version: 0 } })
const measurements: PracticeReadMeasurement[] = []

try {
  for (const mode of ['hint', 'compare'] as const) {
    for (const revealedCards of [1, 100]) {
      probe.reset(revealedCards, revision)
      const result = await execute(practiceProbeUser, input(mode))
      assert.equal(result.status, 'SUCCESS', result.message)
      assert.equal(result.answer?.text, 'Synthetic grounded help')
      assert.equal(result.values?.learningMode, mode)
      assert.equal(probe.metrics.modelCalls, 1)
      assert.equal(probe.metrics.retrievalCalls, 1)
      assert.equal(probe.metrics.assistanceWrites, 1)
      assert.equal(probe.metrics.openTransactions, 0)
      const measurement: PracticeReadMeasurement = { audit: 'F05', mode, oldRevealedCards: revealedCards, ...probe.metrics }
      measurements.push(measurement)
      console.log(JSON.stringify(measurement))
    }
  }

  probe.reset(1, revision)
  probe.changeVersionDuringModel = true
  const stale = await execute(practiceProbeUser, input('hint'))
  assert.equal(stale.status, 'ERROR')
  assert.equal(stale.answer, null)
  assert.match(stale.message, /Sesja uległa zmianie/)
  assert.equal(probe.metrics.assistanceWrites, 0)

  probe.reset(1, revision)
  probe.premium = false
  await assert.rejects(execute(practiceProbeUser, input('hint')), /Premium/)
  assert.equal(probe.metrics.queries, 0)
  assert.equal(probe.metrics.modelCalls, 0)

  probe.reset(1, revision)
  probe.session!.userId = 'another-user'
  const foreign = await execute(practiceProbeUser, input('hint'))
  assert.equal(foreign.status, 'ERROR')
  assert.equal(probe.metrics.modelCalls, 0)
  assert.equal(probe.metrics.assistanceWrites, 0)
  console.log('Stale progress rejected; Premium/ownership controls and no transaction during model verified')

  if (baseline) {
    console.log(measurements.some(row => row.reviewQuestionReads > 0)
      ? 'F05 reproduced: repeated card loads and review scans that grow with old revealed cards'
      : 'Current measurement: no unrelated review scans')
  } else {
    for (const row of measurements) {
      assert.equal(row.reviewQuestionReads, 0, 'F05: help must not scan unrelated review questions')
      assert.equal(row.reviewScans, 0, 'F05: help must not load every saved item for review availability')
      assert.ok(row.cardReads <= 2, 'F05: share the card snapshot within each validation phase')
    }
    await verifyPracticeReadSafety(revision)
    console.log('F05 optimization budgets passed')
  }
} finally {
  practiceReadHooks.deregister()
}

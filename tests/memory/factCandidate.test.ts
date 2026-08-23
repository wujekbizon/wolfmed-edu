import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareFactCandidate } from '@/server/memory/prepareFactCandidate'
import type { FactCandidate } from '@/types/memoryTypes'
import { getMemoryPerformanceLabel } from '@/helpers/getMemoryPerformanceLabel'
import { getChallengeTypeLabel } from '@/helpers/getChallengeTypeLabel'

const base: FactCandidate = {
  userId: 'user-1',
  subject: 'student',
  predicate: 'performance',
  content: 'Średni wynik: 60%.',
  source: 'quiz_derived',
  sourceRunId: 'quiz-1',
  confidence: 1,
  factKey: 'quiz:category',
}

test('normalizes deterministic facts into active keyed candidates', () => {
  const prepared = prepareFactCandidate(base)
  const equivalent = prepareFactCandidate({
    ...base,
    content: '  ŚREDNI   WYNIK: 60%. ',
  })

  assert.equal(prepared.status, 'active')
  assert.equal(prepared.contentHash, equivalent.contentHash)
  assert.deepEqual(prepared.metadata, { key: 'quiz:category' })
})

test('keeps uncorroborated inferred facts provisional', () => {
  assert.equal(
    prepareFactCandidate({
      ...base,
      source: 'llm_inferred',
      confidence: 0.95,
      hasSecondObservation: false,
    }).status,
    'provisional'
  )
  assert.equal(
    prepareFactCandidate({
      ...base,
      source: 'llm_inferred',
      confidence: 0.95,
      hasSecondObservation: true,
    }).status,
    'active'
  )
})

test('renders user-facing performance and challenge labels', () => {
  assert.equal(getMemoryPerformanceLabel(60), 'wynik wymagający poprawy')
  assert.equal(getMemoryPerformanceLabel(70), 'przeciętny wynik')
  assert.equal(getMemoryPerformanceLabel(90), 'dobry wynik')
  assert.equal(getChallengeTypeLabel('order-steps'), 'Uporządkuj kroki')
})

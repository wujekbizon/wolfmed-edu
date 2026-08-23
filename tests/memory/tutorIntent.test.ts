import test from 'node:test'
import assert from 'node:assert/strict'
import { TutorIntentClassificationSchema } from '@/server/schema'
import { resolveTutorRoute } from '@/helpers/resolveTutorRoute'

test('accepts the closed semantic intent contract', () => {
  assert.equal(
    TutorIntentClassificationSchema.safeParse({ intent: 'self_state', confidence: 0.93 }).success,
    true
  )
  assert.equal(
    TutorIntentClassificationSchema.safeParse({ intent: 'medical_question', confidence: 1 }).success,
    true
  )
  assert.equal(
    TutorIntentClassificationSchema.safeParse({ intent: 'ambiguous', confidence: 0.4 }).success,
    true
  )
})

test('rejects unknown, unbounded, and expanded router output', () => {
  assert.equal(
    TutorIntentClassificationSchema.safeParse({ intent: 'conversation', confidence: 0.8 }).success,
    false
  )
  assert.equal(
    TutorIntentClassificationSchema.safeParse({ intent: 'self_state', confidence: 2 }).success,
    false
  )
  assert.equal(
    TutorIntentClassificationSchema.safeParse({
      intent: 'self_state',
      confidence: 0.8,
      answer: 'ignored',
    }).success,
    false
  )
})

test('routes only self-state away from existing RAG', () => {
  assert.equal(
    resolveTutorRoute({
      status: 'classified',
      classification: { intent: 'self_state', confidence: 0.9 },
    }),
    'memory'
  )
  assert.equal(
    resolveTutorRoute({
      status: 'classified',
      classification: { intent: 'medical_question', confidence: 0.9 },
    }),
    'rag'
  )
  assert.equal(resolveTutorRoute({ status: 'unavailable' }), 'rag')
})

test('asks for clarification instead of guessing ambiguous intent', () => {
  assert.equal(
    resolveTutorRoute({
      status: 'classified',
      classification: { intent: 'ambiguous', confidence: 0.3 },
    }),
    'clarify'
  )
})

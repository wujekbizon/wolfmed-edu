import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePracticeMutationReplay } from '@/helpers/resolvePracticeMutationReplay'
import { deliverPracticeFormResult } from '@/helpers/deliverPracticeFormResult'
import { newestPracticeView } from '@/helpers/newestPracticeView'
import { toFormState } from '@/helpers/toFormState'
import { PracticeConflictError } from '@/server/learning/PracticeConflictError'
import { practiceView } from './fixtures/practiceView'

const answered = practiceView({ version: 11, question: {
  id: 'card-1', revision: 'revision-1', text: 'Question', options: ['A', 'B'], selected: 0,
  correct: true, correctIndex: 0, attempts: 1, hintOpened: false, resolved: true, invalid: false,
  hint: null, explanation: null, attemptId: 'attempt-1', supportPending: false,
  suggestedAction: null, suggestedTarget: null, suggestedEventId: null,
} })

test('stale submissions fail with latest progress instead of granting mutation permission', async () => {
  await assert.rejects(resolvePracticeMutationReplay(answered, 10, undefined, async () => answered),
    (error: unknown) => error instanceof PracticeConflictError && error.session === answered)
})

test('inactive sessions reject new mutations even when the version matches', async () => {
  for (const status of ['completed', 'abandoned'] as const) {
    const current = practiceView({ status })
    await assert.rejects(resolvePracticeMutationReplay(current, current.version, undefined, async () => current),
      (error: unknown) => error instanceof PracticeConflictError && error.session.status === status)
  }
})

test('committed event replays succeed after version changes or session completion without an extra read', async () => {
  const result = await resolvePracticeMutationReplay(practiceView({ version: 12, status: 'completed' }),
    10, answered, async () => { throw new Error('Replay must precede the conflict lookup') })
  assert.equal(result, answered)
})

test('current active requests proceed without fetching a conflict view', async () => {
  const current = practiceView()
  assert.equal(await resolvePracticeMutationReplay(current, current.version, undefined,
    async () => { throw new Error('An accepted mutation must not fetch a conflict view') }), null)
})

test('conflict responses update progress without triggering an answer reaction', () => {
  const error = new PracticeConflictError(answered)
  const state = { ...toFormState('ERROR', error.message), session: error.session }
  let progress = practiceView()
  let reactions = 0
  const event = deliverPracticeFormResult(state, {
    onSaved: (session) => { progress = newestPracticeView(progress, session)! },
    onAnswered: () => { reactions++ },
  }, 'attempt-1', null)
  assert.equal(progress.version, 11)
  assert.equal(event, null)
  assert.equal(reactions, 0)
  assert.ok(state.message)
  assert.deepEqual(state.fieldErrors, {})
})

test('late conflicts cannot replace newer client progress', () => {
  let progress = practiceView({ version: 12 })
  deliverPracticeFormResult({ ...toFormState('ERROR', 'Conflict'), session: answered }, {
    onSaved: (session) => { progress = newestPracticeView(progress, session)! }, onAnswered: () => assert.fail(),
  }, 'attempt-1', null)
  assert.equal(progress.version, 12)
})

test('successful matching attempts react once; successful replays preserve progress without duplicate reactions', () => {
  let saves = 0
  let reactions = 0
  const callbacks = { onSaved: () => { saves++ }, onAnswered: () => { reactions++ } }
  const state = { ...toFormState('SUCCESS', ''), session: answered }
  const first = deliverPracticeFormResult(state, callbacks, 'attempt-1', null)
  const replay = deliverPracticeFormResult(state, callbacks, 'attempt-1', first)
  assert.equal(replay, 'attempt-1')
  assert.equal(saves, 2)
  assert.equal(reactions, 1)
})

test('field validation without a session does not emit progress or answer reactions', () => {
  const state = { ...toFormState('ERROR', ''), fieldErrors: { selected: ['Wybierz odpowiedź.'] }, session: null }
  assert.equal(deliverPracticeFormResult(state, { onSaved: () => assert.fail(), onAnswered: () => assert.fail() },
    'attempt-1', null), null)
})

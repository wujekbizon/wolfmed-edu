import assert from 'node:assert/strict'
import test from 'node:test'
import { withPracticeTransportRecovery } from '@/helpers/withPracticeTransportRecovery'
import { deliverPracticeFormResult } from '@/helpers/deliverPracticeFormResult'
import { EMPTY_PRACTICE_STATE } from '@/constants/learningPractice'
import { practiceView } from '../companion/fixtures/practiceView'

for (const message of ['Failed to fetch', 'Load failed',
  'NetworkError when attempting to fetch resource.', 'Failed to fetch (wolfmed-edukacja.pl)']) {
  test(`connection failure returns message and preserves session: ${message}`, async () => {
    const previous = { ...EMPTY_PRACTICE_STATE, session: practiceView(),
      fieldErrors: { selected: ['old error'] } }
    const action = withPracticeTransportRecovery(async () => { throw new TypeError(message) })
    const result = await action(previous, new FormData())
    assert.equal(result.status, 'ERROR')
    assert.match(result.message, /Sprawdź połączenie i ponów próbę/)
    assert.equal(result.session, previous.session)
    assert.deepEqual(result.fieldErrors, {})
    assert.ok(result.timestamp > 0)
    let answered = false
    deliverPracticeFormResult(result, { onSaved: () => {}, onAnswered: () => { answered = true } }, 'event-1', null)
    assert.equal(answered, false)
  })
}

test('connection failure before session creation keeps session null', async () => {
  const action = withPracticeTransportRecovery(async () => { throw new TypeError('Failed to fetch') })
  assert.equal((await action(EMPTY_PRACTICE_STATE, new FormData())).session, null)
})

test('manual retry preserves event and selection without automatic resubmission', async () => {
  let calls = 0
  const data = new FormData()
  data.set('eventId', 'event-1')
  data.set('selected', '2')
  const saved = { ...EMPTY_PRACTICE_STATE, status: 'SUCCESS' as const, session: practiceView() }
  const action = withPracticeTransportRecovery(async (_previous, submitted) => {
    calls++
    assert.equal(submitted.get('eventId'), 'event-1')
    assert.equal(submitted.get('selected'), '2')
    if (calls === 1) throw new TypeError('Failed to fetch')
    return saved
  })
  const failed = await action(EMPTY_PRACTICE_STATE, data)
  assert.equal(calls, 1)
  assert.equal(await action(failed, data), saved)
  assert.equal(calls, 2)
})

test('server validation and conflict results pass through unchanged', async () => {
  const result = { ...EMPTY_PRACTICE_STATE, status: 'ERROR' as const,
    session: practiceView(), fieldErrors: { selected: ['Wybierz odpowiedź.'] } }
  const action = withPracticeTransportRecovery(async () => result)
  assert.equal(await action(EMPTY_PRACTICE_STATE, new FormData()), result)
})

test('unexpected exceptions still propagate', async () => {
  for (const error of [new Error('Failed to fetch'), new TypeError('Cannot read properties of null')]) {
    const action = withPracticeTransportRecovery(async () => { throw error })
    await assert.rejects(action(EMPTY_PRACTICE_STATE, new FormData()), (caught) => caught === error)
  }
})

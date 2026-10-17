import assert from 'node:assert/strict'
import test from 'node:test'
import { QueryClient } from '@tanstack/react-query'
import { EMPTY_WOLFEK_QUESTION } from '@/constants/wolfekResponses'
import { newestPracticeView } from '@/helpers/newestPracticeView'
import { resolveWolfekQuestionResult } from '@/helpers/resolveWolfekQuestionResult'
import type { PracticeView } from '@/types/learningPracticeTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'
import { practiceCard, practiceView } from './fixtures/practiceView'

const response = (session?: PracticeView): WolfekQuestionState => ({
  ...EMPTY_WOLFEK_QUESTION, status: 'SUCCESS', timestamp: 100,
  answer: { responseId: 'hint_rag', topic: 'hint', text: 'Hint for selection A', action: null },
  ...(session ? { session } : {}),
})

test('selection changes hide the old hint but retain committed session progress', (context) => {
  const client = new QueryClient()
  context.after(() => client.clear())
  const key = ['learningPractice', 'user-1', 'opiekun-medyczny']
  client.setQueryData(key, practiceView())
  const committed = practiceView({ version: 11, partial: true,
    cards: [practiceCard('card-1', { version: 11, hintOpened: true })] })
  const display = resolveWolfekQuestionResult(response(committed), 'card-1:A', 'card-1:B', (session) => {
    client.setQueryData<PracticeView>(key, (current) => newestPracticeView(current, session)!)
  })
  assert.equal(display, EMPTY_WOLFEK_QUESTION)
  assert.equal(client.getQueryData<PracticeView>(key)?.version, 11)
  assert.equal(client.getQueryData<PracticeView>(key)?.cards[0]?.hintOpened, true)
})

test('card changes retain partial progress without removing other cards', () => {
  const other = practiceCard('card-2', { resolved: true, outcome: 'unassisted' })
  let progress = practiceView({ cards: [other] })
  const committed = practiceView({ version: 11, partial: true,
    cards: [practiceCard('card-1', { version: 11, hintOpened: true })] })
  const display = resolveWolfekQuestionResult(response(committed), 'card-1:A', 'card-2:A', (session) => {
    progress = newestPracticeView(progress, session)!
  })
  assert.equal(display, EMPTY_WOLFEK_QUESTION)
  assert.equal(progress.cards.find((card) => card.id === 'card-2'), other)
  assert.equal(progress.cards.find((card) => card.id === 'card-1')?.hintOpened, true)
})

test('an explanation failure still delivers the committed reveal before hiding its stale reply', () => {
  const committed = practiceView({ version: 11,
    cards: [practiceCard('card-1', { correctIndex: 2, resolved: true, outcome: 'revealed' })] })
  const received: PracticeView[] = []
  const display = resolveWolfekQuestionResult({ ...response(committed), status: 'ERROR',
    answer: null, message: 'Provider unavailable' }, 'card-1:A', 'card-2:A', (session) => received.push(session))
  assert.equal(display, EMPTY_WOLFEK_QUESTION)
  assert.deepEqual(received, [committed])
})

test('late help cannot roll back newer deck progress', () => {
  let progress = practiceView({ version: 12 })
  const display = resolveWolfekQuestionResult(response(practiceView({ version: 11 })),
    'card-1:A', 'card-2:A', (session) => { progress = newestPracticeView(progress, session)! })
  assert.equal(display, EMPTY_WOLFEK_QUESTION)
  assert.equal(progress.version, 12)
})

test('matching replies remain visible after delivering progress', () => {
  const result = response(practiceView({ version: 11 }))
  let received: PracticeView | undefined
  const display = resolveWolfekQuestionResult(result, 'card-1:A', 'card-1:A', (session) => { received = session })
  assert.equal(received, result.session)
  assert.equal(display.answer, result.answer)
  assert.equal(display.values?.viewScope, 'card-1:A')
})

test('local cached replies without a session do not emit progress updates', () => {
  let updates = 0
  resolveWolfekQuestionResult(response(), 'card-1:A', 'card-1:A', () => { updates++ })
  assert.equal(updates, 0)
})

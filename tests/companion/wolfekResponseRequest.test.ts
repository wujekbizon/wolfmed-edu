import assert from 'node:assert/strict'
import test from 'node:test'
import kierunki from '@/content/wolfek/kierunki.json'
import home from '@/content/wolfek/panel-home.json'
import results from '@/content/wolfek/panel-results.json'
import learning from '@/content/wolfek/learning-practice.json'
import { WolfekPackSchema } from '@/server/schema'
import { buildWolfekResponseRequest } from '@/helpers/buildWolfekResponseRequest'
import { expandWolfekCourseResponses } from '@/helpers/expandWolfekCourseResponses'
import { renderWolfekTemplate } from '@/helpers/renderWolfekTemplate'
import type { WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

const input: WolfekQuestionRequest = { route: 'panel.results', question: 'Ile mam ukończonych testów?',
  origin: 'typed', preparedQuestionId: null, submissionId: crypto.randomUUID(), practice: null }

test('all packs are valid and questions use Choice, Noul and Score', () => {
  for (const raw of [kierunki, home, results, learning]) {
    const pack = WolfekPackSchema.parse(raw)
    const built = buildWolfekResponseRequest(input, pack, { facts: {}, destinations: {} })
    assert.deepEqual(Object.keys(built.payload), ['model', 'state', 'questions'])
    assert.equal((built.payload.questions.response as { type: string }).type, 'choice')
    assert.equal((built.payload.questions.needs_clarification as { type: string }).type, 'noul')
    assert.equal((built.payload.questions.answer_coverage as { type: string }).type, 'score')
    assert.equal(JSON.stringify(built.payload).includes('{{'), false)
  }
})

test('button and identical typed question have identical response candidates and judgments', () => {
  const pack = WolfekPackSchema.parse(results)
  const context = { facts: { results: { completedTestCount: 17, hasTests: true } }, destinations: {} }
  const typed = buildWolfekResponseRequest(input, pack, context)
  const prepared = buildWolfekResponseRequest({ ...input, origin: 'prepared',
    preparedQuestionId: 'results_history' }, pack, context)
  assert.deepEqual(prepared.payload.questions, typed.payload.questions)
  assert.deepEqual(prepared.answers, typed.answers)
  assert.equal(prepared.answers.test_count?.text, 'Masz 17 ukończonych testów.')
  assert.equal(JSON.stringify(prepared.payload).includes('preparedQuestionId'), false)
})

test('zero is a real value; missing count does not become zero', () => {
  const pack = WolfekPackSchema.parse(results)
  const zero = buildWolfekResponseRequest(input, pack, { facts: { results: { completedTestCount: 0, hasTests: false } }, destinations: {} })
  assert.equal(zero.answers.test_count?.text, 'Masz 0 ukończonych testów.')
  const missing = buildWolfekResponseRequest(input, pack, { facts: { results: { completedTestCount: null } }, destinations: {} })
  assert.equal(missing.answers.test_count, undefined)
  assert.match(missing.answers.unavailable_test_count!.text, /Nie mogę teraz sprawdzić/)
  assert.equal(renderWolfekTemplate('{{x}}', { x: 0 }), '0')
})

test('unknown payment methods and absent videos cannot produce affirmative answers', () => {
  const pack = expandWolfekCourseResponses(WolfekPackSchema.parse(kierunki))
  const built = buildWolfekResponseRequest({ ...input, route: 'kierunki' }, pack, {
    facts: { payments: { subscriptionCardSupported: null }, video: { courses: {
      opiekun: { status: 'unavailable', requestedCourseTitle: 'Opiekun Medyczny', title: null },
    } } }, destinations: { 'requestedCourse:opiekun-medyczny': { type: 'link', href: '/kierunki/opiekun-medyczny' } },
  })
  assert.equal(built.answers.card_yes, undefined)
  assert.equal(built.answers.card_no, undefined)
  assert.match(built.answers.card_unknown!.text, /Nie mam potwierdzonej/)
  assert.equal(built.answers.video_yes_opiekun, undefined)
  assert.match(built.answers.video_no_opiekun!.text, /Nie ma teraz/)
  assert.ok(pack.options.some((option) => option.id === 'tiers_nursing'))
})

test('missing reviewed hints cannot emit medical hint text or an action', () => {
  const pack = WolfekPackSchema.parse(learning)
  const built = buildWolfekResponseRequest({ ...input, route: 'learning.practice' }, pack, {
    facts: { card: { loaded: true, resolved: false, hasHint: false } }, destinations: { currentCard: { type: 'show_hint' } },
  })
  assert.equal(built.answers.hint_reviewed, undefined)
  assert.equal(built.answers.hint_missing?.action, null)
  assert.match(built.answers.hint_missing!.text, /Nie mam sprawdzonej/)
})

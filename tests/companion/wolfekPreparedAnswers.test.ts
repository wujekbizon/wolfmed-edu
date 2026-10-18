import assert from 'node:assert/strict'
import test from 'node:test'
import questions from '@/content/wolfek/questions.json'
import mappings from '@/content/wolfek/prepared-answers.json'
import { getWolfekPreparedAnswer } from '@/helpers/getWolfekPreparedAnswer'
import { context, packs, preparedInput } from './fixtures/wolfekPrepared'
import { learningContext, learningInput, learningPack } from './fixtures/wolfekLearning'
import type { WolfekContext, WolfekRoute } from '@/types/wolfekResponseTypes'

test('every prepared button has a valid deterministic answer from its route JSON', () => {
  for (const route of Object.keys(questions) as WolfekRoute[]) {
    assert.deepEqual(Object.keys(mappings[route]).sort(), questions[route].map(({ id }) => id).sort())
    for (const { id } of questions[route]) {
      const input = route === 'learning.practice' ? { ...learningInput, preparedQuestionId: id } : preparedInput(route, id)
      const answer = getWolfekPreparedAnswer(input, packs[route], route === 'learning.practice' ? learningContext : context)
      assert.ok(answer.text)
      assert.doesNotMatch(answer.responseId, /unavailable_|clarify|no_match/)
      assert.doesNotMatch(answer.text, /\{\{/)
    }
  }
})

test('prepared history uses the exact count, verified empty state and unavailable state', () => {
  const input = preparedInput('panel.results', 'results_history')
  const answer = (results: Record<string, unknown>) => getWolfekPreparedAnswer(input, packs['panel.results'],
    { ...context, facts: { results } })
  assert.equal(answer({ hasTests: true, completedTestCount: 17 }).text, 'Masz 17 ukończonych testów.')
  assert.equal(answer({ hasTests: false, completedTestCount: 0 }).responseId, 'history_empty')
  assert.match(answer({ hasTests: null, completedTestCount: null }).responseId, /^unavailable_/)
  assert.doesNotMatch(answer({}).text, /0 ukończonych/)
})

test('payment and comparison buttons resolve their own answers despite shared topics', () => {
  const resolve = (id: string, facts = context.facts) => getWolfekPreparedAnswer(preparedInput('kierunki', id),
    packs.kierunki, { ...context, facts })
  assert.equal(resolve('payment_models').responseId, 'payment_models')
  assert.equal(resolve('card_payment').responseId, 'card_yes')
  assert.equal(resolve('card_payment', { payments: { subscriptionCardSupported: null } }).responseId, 'card_unknown')
  assert.equal(resolve('card_payment', { payments: { subscriptionCardSupported: false, subscriptionMethodsText: 'Inne' } }).responseId, 'card_no')
  assert.equal(resolve('tier_comparison').responseId, 'tiers')
  assert.equal(resolve('tier_comparison').action?.href, context.destinations.catalog?.href)
})

test('owned-course answers distinguish signed out, no courses and active access', () => {
  const resolve = (access: Record<string, unknown>) => getWolfekPreparedAnswer(preparedInput('kierunki', 'owned_course'),
    packs.kierunki, { ...context, facts: { access } })
  assert.equal(resolve({ signedIn: false, hasCourses: false }).responseId, 'sign_in')
  assert.equal(resolve({ signedIn: true, hasCourses: false }).responseId, 'not_owned')
  assert.equal(resolve({ signedIn: true, hasCourses: true, ownedCoursesText: 'Kurs' }).responseId, 'owned')
})

test('plan answers prioritize completion and handle non-study days without inventing tasks', () => {
  const resolve = (plan: Record<string, unknown>) => getWolfekPreparedAnswer(preparedInput('panel.home', 'plan'),
    packs['panel.home'], { ...context, facts: { plan } })
  assert.equal(resolve({ active: false }).responseId, 'plan_create')
  assert.equal(resolve({ active: true, todayDone: true, todayHasTask: true,
    nextActivityText: 'Jutro', todayActivityText: 'Dziś', remainingMinutesToday: 10 }).responseId, 'plan_done')
  assert.equal(resolve({ active: true, todayDone: true, todayHasTask: true,
    todayActivityText: 'Dziś', remainingMinutesToday: 10 }).responseId, 'unavailable_plan_done')
  assert.equal(resolve({ active: true, todayDone: false, todayHasTask: false,
    attributedMinutes: 20, plannedTotalMinutes: 100, daysLeft: 5 }).responseId, 'plan_progress')
})

test('typed input and unknown prepared IDs cannot use deterministic routing', () => {
  for (const input of [{ ...preparedInput('panel.home', 'username'), origin: 'typed' as const },
    preparedInput('panel.home', '__proto__'), preparedInput('panel.home', 'results_history')]) {
    assert.throws(() => getWolfekPreparedAnswer(input, packs['panel.home'], context))
  }
})

test('learning modes preserve selection, reveal confirmation and Premium requirements', () => {
  const resolve = (id: string, changes: WolfekContext['facts'] = {}) => getWolfekPreparedAnswer(
    { ...learningInput, preparedQuestionId: id }, learningPack,
    { ...learningContext, facts: { ...learningContext.facts, ...changes } })
  assert.equal(resolve('hint').action?.type, 'rag_hint')
  assert.equal(resolve('compare').action?.type, 'rag_compare')
  assert.equal(resolve('compare', { card: { loaded: true, selectedAnswerPresent: false } }).responseId, 'compare_select')
  assert.equal(resolve('assistant').action?.type, 'confirm_reveal_then_tutor')
  assert.equal(resolve('reveal_tutor').action?.type, 'confirm_reveal_then_tutor')
  assert.equal(resolve('assistant', { card: { loaded: true, answerVisible: true } }).action?.type, 'rag_explain')
  assert.throws(() => resolve('hint', { access: { premiumTutorAllowed: false } }))
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { getJevTokenUsage } from '@/helpers/getJevTokenUsage'
import { getWolfekMetricDay } from '@/helpers/getWolfekMetricDay'
import { fillWolfekDailyChart } from '@/helpers/fillWolfekDailyChart'
import { toWolfekCsvCell } from '@/helpers/toWolfekCsvCell'
import { buildWolfekCsv } from '@/helpers/buildWolfekCsv'
import { getDefaultWolfekAdminFilters } from '@/helpers/getDefaultWolfekAdminFilters'
import { WolfekAdminFiltersSchema } from '@/server/schema'
import { needsWolfekInteractionReview } from '@/helpers/needsWolfekInteractionReview'
import type { WolfekInteraction } from '@/types/wolfekMetricTypes'
import { fromErrorToFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'

test('keeps missing or malformed token usage unknown', () => {
  assert.deepEqual(getJevTokenUsage(null), { input: null, output: null })
  assert.deepEqual(getJevTokenUsage({ usage: { input_tokens: '12', output_tokens: -1 } }), { input: null, output: null })
  assert.deepEqual(getJevTokenUsage({ usage: { input_tokens: 0, output_tokens: 12 } }), { input: 0, output: 12 })
  assert.deepEqual(getJevTokenUsage({ usage: { input_tokens: 10 } }), { input: 10, output: null })
})

test('groups events by Warsaw date rather than UTC date', () => {
  assert.equal(getWolfekMetricDay(new Date('2026-09-29T23:30:00Z')), '2026-09-30')
  assert.equal(getWolfekMetricDay(new Date('2026-01-29T23:30:00Z')), '2026-01-30')
})

test('daily charts include zero-activity days without losing usage', () => {
  const day = { day: '2026-09-02', questions: 3, clicks: 2, cacheHits: 1,
    providerCalls: 1, errors: 0, inputTokens: 100, outputTokens: 20 }
  const chart = fillWolfekDailyChart([day], '2026-09-01', '2026-09-03')
  assert.equal(chart.length, 3)
  assert.equal(chart[0]?.inputTokens, 0)
  assert.deepEqual(chart[1], day)
  assert.equal(chart[2]?.questions, 0)
})

test('CSV exports neutralize formulas and preserve quotes, commas and JSON', () => {
  assert.equal(toWolfekCsvCell('=1+1'), "\"'=1+1\"")
  assert.equal(toWolfekCsvCell(' @SUM(1)'), "\"' @SUM(1)\"")
  assert.equal(toWolfekCsvCell('a,"b"'), '"a,""b"""')
  const csv = buildWolfekCsv([{ question: 'a,b', payload: { confidence: .8 } }], ['question', 'payload'])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"a,b"'))
  assert.ok(csv.includes('""confidence""'))
})

test('admin filters reject invalid ranges, pagination and extra properties', () => {
  const filters = getDefaultWolfekAdminFilters()
  assert.equal(WolfekAdminFiltersSchema.safeParse(filters).success, true)
  for (const patch of [{ page: 0 }, { source: 'anything' }, { search: 'x'.repeat(301) },
    { from: '2026-10-01', to: '2026-09-01' }, { from: '2020-01-01', to: '2026-09-30' }, { role: 'admin' }]) {
    assert.equal(WolfekAdminFiltersSchema.safeParse({ ...filters, ...patch }).success, false)
  }
})

test('prepared answers need no confidence; unavailable and typed uncertain answers still need review', () => {
  const record: WolfekInteraction = { source: 'panel', route: 'panel.home', userId: 'user',
    kind: 'question', question: 'Pytanie', topic: 'username_edit', confidence: null, outcome: 'prepared' }
  assert.equal(needsWolfekInteractionReview(record), false)
  assert.equal(needsWolfekInteractionReview({ ...record, topic: 'unavailable_billing_status' }), true)
  assert.equal(needsWolfekInteractionReview({ ...record, topic: null, outcome: 'unavailable' }), true)
  assert.equal(needsWolfekInteractionReview({ ...record, outcome: 'typed_provider', confidence: .1 }), true)
  assert.equal(needsWolfekInteractionReview({ ...record, outcome: 'typed_provider', confidence: .9 }), false)
})

test('invalid admin date ranges return named field errors without a toast', () => {
  const defaults = getDefaultWolfekAdminFilters()
  for (const patch of [{ from: '2026-10-19', to: '2026-10-18' },
    { from: '2024-01-01', to: '2026-10-18' }, { to: '' }]) {
    const parsed = WolfekAdminFiltersSchema.safeParse({ ...defaults, ...patch })
    assert.equal(parsed.success, false)
    if (parsed.success) continue
    const state: FormState = fromErrorToFormState(parsed.error)
    assert.equal(state.message, '')
    assert.ok(state.fieldErrors.to?.length)
  }
  assert.equal(WolfekAdminFiltersSchema.safeParse({ ...defaults, from: '2026-10-18', to: '2026-10-18' }).success, true)
  assert.equal(WolfekAdminFiltersSchema.safeParse({ ...defaults, from: '2026-01-01', to: '2027-01-02' }).success, true)
})

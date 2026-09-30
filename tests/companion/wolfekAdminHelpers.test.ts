import assert from 'node:assert/strict'
import test from 'node:test'
import { getJevTokenUsage } from '@/helpers/getJevTokenUsage'
import { getWolfekMetricDay } from '@/helpers/getWolfekMetricDay'
import { fillWolfekDailyChart } from '@/helpers/fillWolfekDailyChart'
import { toWolfekCsvCell } from '@/helpers/toWolfekCsvCell'
import { buildWolfekCsv } from '@/helpers/buildWolfekCsv'
import { getDefaultWolfekAdminFilters } from '@/helpers/getDefaultWolfekAdminFilters'
import { WolfekAdminFiltersSchema } from '@/server/schema'

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

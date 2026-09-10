import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { getPreviousStripeReportMonth } from '@/helpers/getPreviousStripeReportMonth'
import { getStripeReportPeriod } from '@/helpers/getStripeReportPeriod'
import { formatStripeReportMoney } from '@/helpers/formatStripeReportMoney'
import { toStripeReportRow } from '@/helpers/toStripeReportRow'
import { summarizeStripeReport } from '@/helpers/summarizeStripeReport'
import { getStripeReportFingerprint } from '@/helpers/getStripeReportFingerprint'
import { StripeReportMonthSchema, StripeReportDownloadSchema } from '@/server/schema'
import { reportBilling, reportSource } from './fixtures/stripeReport'

test('Warsaw month boundaries account for DST and year rollover', () => {
  const march = getStripeReportPeriod('2026-03')
  assert.equal(new Date(march.start * 1000).toISOString(), '2026-02-28T23:00:00.000Z')
  assert.equal(new Date(march.end * 1000).toISOString(), '2026-03-31T22:00:00.000Z')
  const october = getStripeReportPeriod('2026-10')
  assert.equal(new Date(october.start * 1000).toISOString(), '2026-09-30T22:00:00.000Z')
  assert.equal(new Date(october.end * 1000).toISOString(), '2026-10-31T23:00:00.000Z')
  assert.equal(getPreviousStripeReportMonth(new Date('2026-12-31T23:30:00Z')), '2026-12')
  assert.equal(getPreviousStripeReportMonth(new Date('2026-09-01T00:00:00Z')), '2026-08')
})

test('month and download parameters reject malformed, future and open months', () => {
  for (const month of ['2026-13', '2026-00', '2099-01', '', ['2026-08']]) {
    assert.equal(StripeReportMonthSchema.safeParse({ month }).success, false)
  }
  assert.equal(StripeReportMonthSchema.safeParse({ month: '2020-01' }).success, true)
  assert.equal(StripeReportDownloadSchema.safeParse({ month: '2020-01', fingerprint: 'forged' }).success, false)
})

test('July gross totals remain exact and use balance receipt dates', () => {
  const row = toStripeReportRow(reportSource, reportBilling)
  assert.equal(row.date, reportSource.transaction.created)
  assert.notEqual(row.date, reportSource.charge.created)
  assert.deepEqual(summarizeStripeReport(Array(5).fill(row)), [
    { currency: 'pln', count: 5, payments: 79995, refunds: 0 },
  ])
  assert.match(formatStripeReportMoney(79995, 'pln'), /799,95/)
  assert.match(formatStripeReportMoney(100, 'jpy'), /100/)
  assert.match(formatStripeReportMoney(1234, 'kwd'), /1,234/)
})

test('refunds retain original charge reference, separate amounts and currencies', () => {
  const payment = toStripeReportRow(reportSource, reportBilling)
  const refund = toStripeReportRow({
    ...reportSource,
    transaction: { ...reportSource.transaction, amount: -5000 },
    refund: { amount: 5000, currency: 'pln', status: 'succeeded' } as Stripe.Refund,
  }, reportBilling)
  assert.equal(refund.chargeId, payment.chargeId)
  assert.deepEqual(summarizeStripeReport([payment, refund, { ...payment, currency: 'eur' }]), [
    { currency: 'eur', count: 1, payments: 15999, refunds: 0 },
    { currency: 'pln', count: 1, payments: 15999, refunds: -5000 },
  ])
  const failed = toStripeReportRow({ ...reportSource,
    charge: { ...reportSource.charge, paid: false, status: 'failed' },
  }, reportBilling)
  assert.equal(failed.included, false)
  assert.deepEqual(summarizeStripeReport([failed]), [])
})

test('fingerprint ignores temporary invoice PDF URLs only', () => {
  const period = getStripeReportPeriod('2026-07')
  const row = toStripeReportRow(reportSource, {
    ...reportBilling,
    invoices: [{ id: 'in_1', number: 'FV-1', currency: 'pln', total: 15999, tax: 0, pdf: 'https://stripe.test/first' }],
  })
  const fingerprint = getStripeReportFingerprint(period, false, [row])
  assert.equal(fingerprint, getStripeReportFingerprint(period, false, [{
    ...row, invoices: [{ ...row.invoices[0]!, pdf: 'https://stripe.test/second' }],
  }]))
  assert.notEqual(fingerprint, getStripeReportFingerprint(period, false, [{ ...row, amount: 16000 }]))
})

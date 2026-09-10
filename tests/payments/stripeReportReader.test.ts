import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { readStripeReportRows } from '@/helpers/readStripeReportRows'
import { reportBilling, reportSource } from './fixtures/stripeReport'

test('reads over 100 records, deduplicates and shares enrichment for repeated charges', async () => {
  let calls = 0
  const transactions = Array.from({ length: 205 }, (_, index) => ({
    ...reportSource.transaction, id: `txn_${index}`, created: index,
  }))
  async function* pages() {
    yield* transactions.slice(0, 100)
    yield* transactions.slice(100, 200)
    yield* transactions.slice(200)
    yield transactions[0]!
    yield { ...reportSource.transaction, type: 'payout' } as Stripe.BalanceTransaction
  }
  const rows = await readStripeReportRows(pages(), {
    source: async (transaction) => ({ ...reportSource, transaction }),
    billing: async () => { calls++; return reportBilling },
  })
  assert.equal(rows.length, 205)
  assert.equal(calls, 1)
  assert.equal(rows[0]?.date, 204)
})

test('pagination or enrichment failure prevents a partial report', async () => {
  async function* failedPages() {
    yield reportSource.transaction
    throw new Error('Stripe timeout')
  }
  const reader = {
    source: async () => reportSource,
    billing: async () => reportBilling,
  }
  await assert.rejects(readStripeReportRows(failedPages(), reader), /Stripe timeout/)
  async function* onePage() { yield reportSource.transaction }
  await assert.rejects(readStripeReportRows(onePage(), {
    ...reader, billing: async () => { throw new Error('Invoice timeout') },
  }), /Invoice timeout/)
  await assert.rejects(readStripeReportRows(onePage(), reader, 0), /czas/)
})

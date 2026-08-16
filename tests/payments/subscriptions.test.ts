import assert from 'node:assert/strict'
import test from 'node:test'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import { isSubscriptionValidForOrder } from '@/helpers/isSubscriptionValidForOrder'
import { resolveSubscriptionResultStatus } from '@/helpers/resolveSubscriptionResultStatus'
import type { SubscriptionSnapshot } from '@/types/paymentTypes'

const offer = { ...PAYMENT_OFFERS.opiekun_basic_monthly, priceId: 'price_monthly' }
const snapshot = (
  overrides: Partial<SubscriptionSnapshot> = {}
): SubscriptionSnapshot => ({
  id: 'sub_1',
  itemId: 'si_1',
  customerId: 'cus_1',
  priceId: 'price_monthly',
  status: 'active',
  amount: 1999,
  currency: 'pln',
  currentPeriodStart: new Date('2026-08-01T00:00:00Z'),
  currentPeriodEnd: new Date('2026-09-01T00:00:00Z'),
  scheduleId: null,
  scheduledChange: null,
  cancelAtPeriodEnd: false,
  cancelAt: null,
  canceledAt: null,
  endedAt: null,
  latestInvoiceId: 'in_1',
  latestInvoiceStatus: 'paid',
  latestInvoicePaid: true,
  latestInvoiceAmount: 1999,
  latestInvoiceCurrency: 'pln',
  latestPaymentIntentId: 'pi_1',
  orderId: '00000000-0000-4000-8000-000000000001',
  createdAt: new Date('2026-08-01T00:00:00Z'),
  ...overrides,
})

const expected = {
  orderId: '00000000-0000-4000-8000-000000000001',
  customerId: 'cus_1',
  courseSlug: 'opiekun-medyczny' as const,
  purchaseModel: 'subscription' as const,
  offer,
}

test('subscription snapshot matches trusted order and catalog', () => {
  assert.equal(isSubscriptionValidForOrder(snapshot(), expected), true)
  assert.equal(isSubscriptionValidForOrder(snapshot({ amount: 1 }), expected), false)
  assert.equal(isSubscriptionValidForOrder(snapshot({ customerId: 'cus_other' }), expected), false)
  assert.equal(isSubscriptionValidForOrder(snapshot({ priceId: 'price_other' }), expected), false)
  assert.equal(isSubscriptionValidForOrder(snapshot({ orderId: 'other' }), expected), false)
})

test('paid active subscription grants access through period-end cancellation', () => {
  assert.equal(isSubscriptionAccessActive(snapshot()), true)
  assert.equal(isSubscriptionAccessActive(snapshot({ cancelAtPeriodEnd: true })), true)
})

test('failed renewal and ended subscription revoke access', () => {
  assert.equal(isSubscriptionAccessActive(snapshot({
    latestInvoicePaid: false,
    latestInvoiceStatus: 'open',
  })), false)
  assert.equal(isSubscriptionAccessActive(snapshot({ status: 'canceled' })), false)
})

test('later paid invoice restores subscription access', () => {
  const failed = snapshot({ latestInvoicePaid: false, latestInvoiceStatus: 'open' })
  const recovered = snapshot({ latestInvoiceId: 'in_2' })

  assert.equal(isSubscriptionAccessActive(failed), false)
  assert.equal(isSubscriptionAccessActive(recovered), true)
})

test('subscription result distinguishes paid, processing and failed states', () => {
  assert.equal(resolveSubscriptionResultStatus(snapshot()), 'paid')
  assert.equal(resolveSubscriptionResultStatus(snapshot({
    status: 'incomplete',
    latestInvoicePaid: false,
    latestInvoiceStatus: 'open',
  })), 'processing')
  assert.equal(resolveSubscriptionResultStatus(snapshot({
    status: 'past_due',
    latestInvoicePaid: false,
    latestInvoiceStatus: 'open',
  })), 'failed')
})

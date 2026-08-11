import assert from 'node:assert/strict'
import test from 'node:test'
import { getCheckoutOrderDeduplicationKey } from '@/helpers/getCheckoutOrderDeduplicationKey'
import { getCheckoutOrderExpiry } from '@/helpers/getCheckoutOrderExpiry'
import { isCheckoutSessionValidForOrder } from '@/helpers/isCheckoutSessionValidForOrder'
import { resolveCheckoutPaymentState } from '@/helpers/resolveCheckoutPaymentState'
import type {
  CheckoutSessionExpectation,
  CheckoutSessionSnapshot,
} from '@/types/paymentTypes'

const expected: CheckoutSessionExpectation = {
  sessionId: 'cs_test_1',
  userId: 'user_1',
  customerId: 'cus_1',
  priceId: 'price_1',
  amount: 15999,
  currency: 'pln',
}

const snapshot = (
  overrides: Partial<CheckoutSessionSnapshot> = {}
): CheckoutSessionSnapshot => ({
  id: 'cs_test_1',
  mode: 'payment',
  paymentStatus: 'paid',
  amountTotal: 15999,
  currency: 'pln',
  clientReferenceId: 'user_1',
  customerId: 'cus_1',
  paymentIntentId: 'pi_1',
  invoiceId: 'in_1',
  createdAt: new Date('2026-08-11T10:00:00Z'),
  expiresAt: new Date('2026-08-12T10:00:00Z'),
  lineItems: [{ priceId: 'price_1', quantity: 1 }],
  ...overrides,
})

test('deduplication permits only one lifetime checkout per user and course', () => {
  const key = getCheckoutOrderDeduplicationKey('user_1', 'opiekun-medyczny', 'lifetime')
  assert.equal(key, 'user_1:opiekun-medyczny:lifetime')
  assert.notEqual(
    key,
    getCheckoutOrderDeduplicationKey('user_1', 'pielegniarstwo', 'lifetime')
  )
})

test('new checkout orders expire after the configured window', () => {
  const now = new Date('2026-08-11T10:00:00Z')
  assert.equal(getCheckoutOrderExpiry(now).toISOString(), '2026-08-12T10:00:00.000Z')
})

test('canonical Checkout Session matches the local order snapshot', () => {
  assert.equal(isCheckoutSessionValidForOrder(snapshot(), expected), true)
})

test('Checkout Session tampering is rejected', () => {
  assert.equal(isCheckoutSessionValidForOrder(snapshot({ amountTotal: 1 }), expected), false)
  assert.equal(isCheckoutSessionValidForOrder(snapshot({ customerId: 'cus_other' }), expected), false)
  assert.equal(isCheckoutSessionValidForOrder(snapshot({ clientReferenceId: 'user_2' }), expected), false)
  assert.equal(isCheckoutSessionValidForOrder(snapshot({ currency: 'eur' }), expected), false)
  assert.equal(isCheckoutSessionValidForOrder(snapshot({ mode: 'subscription' }), expected), false)
  assert.equal(isCheckoutSessionValidForOrder(snapshot({
    lineItems: [{ priceId: 'price_other', quantity: 1 }],
  }), expected), false)
})

test('canonical paid state wins over an out-of-order failure event', () => {
  assert.equal(resolveCheckoutPaymentState(
    'checkout.session.async_payment_failed',
    'paid'
  ), 'paid')
  assert.equal(resolveCheckoutPaymentState(
    'checkout.session.async_payment_succeeded',
    'unpaid'
  ), 'invalid')
})

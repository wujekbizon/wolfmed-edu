import assert from 'node:assert/strict'
import test from 'node:test'
import { getCheckoutOrderDeduplicationKey } from '@/helpers/getCheckoutOrderDeduplicationKey'
import { getCheckoutOrderExpiry } from '@/helpers/getCheckoutOrderExpiry'
import { isCheckoutSessionValidForOrder } from '@/helpers/isCheckoutSessionValidForOrder'
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
  purchaseModel: 'lifetime',
}

const snapshot = (
  overrides: Partial<CheckoutSessionSnapshot> = {}
): CheckoutSessionSnapshot => ({
  id: 'cs_test_1',
  mode: 'payment',
  status: 'complete',
  paymentStatus: 'paid',
  amountTotal: 15999,
  currency: 'pln',
  clientReferenceId: 'user_1',
  customerId: 'cus_1',
  paymentIntentId: 'pi_1',
  subscriptionId: null,
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

test('subscription orders require subscription Checkout mode', () => {
  assert.equal(isCheckoutSessionValidForOrder(snapshot({ mode: 'subscription' }), {
    ...expected,
    purchaseModel: 'subscription',
  }), true)
  assert.equal(isCheckoutSessionValidForOrder(snapshot(), {
    ...expected,
    purchaseModel: 'subscription',
  }), false)
})

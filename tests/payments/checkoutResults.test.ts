import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveCheckoutPaymentState } from '@/helpers/resolveCheckoutPaymentState'
import { resolveCheckoutResultStatus } from '@/helpers/resolveCheckoutResultStatus'
import { getCheckoutPaymentOutcome } from '@/helpers/getCheckoutPaymentOutcome'

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

test('success result rejects a Checkout Session owned by another user', () => {
  assert.equal(resolveCheckoutResultStatus({
    currentUserId: 'user_2',
    checkoutUserId: 'user_1',
    paymentStatus: 'paid',
    sessionStatus: 'complete',
    orderStatus: 'PAID',
  }), 'invalid')
})

test('success result distinguishes processing and failed payments', () => {
  const input = {
    currentUserId: 'user_1',
    checkoutUserId: 'user_1',
    paymentStatus: 'unpaid',
    sessionStatus: 'complete',
    orderStatus: 'PROCESSING' as const,
  }
  assert.equal(resolveCheckoutResultStatus(input), 'processing')
  assert.equal(resolveCheckoutResultStatus({ ...input, orderStatus: 'FAILED' }), 'failed')
})

test('canonical paid result wins over stale local failure', () => {
  assert.equal(resolveCheckoutResultStatus({
    currentUserId: 'user_1',
    checkoutUserId: 'user_1',
    paymentStatus: 'paid',
    sessionStatus: 'complete',
    orderStatus: 'FAILED',
  }), 'paid')
})

test('checkout result identifies purchase and upgrade outcomes', () => {
  assert.equal(getCheckoutPaymentOutcome('lifetime', 'lifetime_purchase'),
    'lifetime_purchase')
  assert.equal(getCheckoutPaymentOutcome('subscription', 'subscription'),
    'subscription_purchase')
  assert.equal(getCheckoutPaymentOutcome('lifetime', 'lifetime_upgrade'),
    'lifetime_upgrade')
})

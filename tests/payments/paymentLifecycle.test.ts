import assert from 'node:assert/strict'
import test from 'node:test'
import { isPaymentLifecycleSnapshotValid } from '@/helpers/isPaymentLifecycleSnapshotValid'
import { resolvePaymentDisputeStatus } from '@/helpers/resolvePaymentDisputeStatus'
import { resolvePaymentRefundStatus } from '@/helpers/resolvePaymentRefundStatus'
import { shouldRevokePaymentEntitlement } from '@/helpers/shouldRevokePaymentEntitlement'
import { sumSuccessfulRefundAmounts } from '@/helpers/sumSuccessfulRefundAmounts'
import type {
  PaymentLifecycleRecord,
  PaymentLifecycleSnapshot,
} from '@/types/paymentTypes'
import type Stripe from 'stripe'

const payment: PaymentLifecycleRecord = {
  amountTotal: 14000,
  currency: 'pln',
  stripeCustomerId: 'cus_1',
  chargeId: null,
  paymentStatus: 'paid',
  pseudonymizedAt: null,
}

const snapshot = (
  overrides: Partial<PaymentLifecycleSnapshot> = {}
): PaymentLifecycleSnapshot => ({
  eventObjectId: 're_1',
  chargeId: 'ch_1',
  paymentIntentId: 'pi_1',
  customerId: 'cus_1',
  amount: 14000,
  amountRefunded: 0,
  currency: 'pln',
  chargePaid: true,
  chargeStatus: 'succeeded',
  refundStatus: 'none',
  disputeStatus: null,
  ...overrides,
})

test('refund status distinguishes none, partial and full', () => {
  assert.equal(resolvePaymentRefundStatus(14000, 0), 'none')
  assert.equal(resolvePaymentRefundStatus(14000, 4000), 'partial')
  assert.equal(resolvePaymentRefundStatus(14000, 14000), 'full')
})

test('only successful refunds count toward entitlement revocation', () => {
  const refunds = [
    { amount: 9000, status: 'succeeded' },
    { amount: 5000, status: 'pending' },
    { amount: 5000, status: 'failed' },
  ] as Stripe.Refund[]

  assert.equal(sumSuccessfulRefundAmounts(refunds), 9000)
})

test('dispute aggregate prioritizes loss and open states', () => {
  assert.equal(resolvePaymentDisputeStatus([]), 'none')
  assert.equal(resolvePaymentDisputeStatus(['won']), 'won')
  assert.equal(resolvePaymentDisputeStatus(['prevented', 'won']), 'resolved')
  assert.equal(resolvePaymentDisputeStatus(['won', 'under_review']), 'open')
  assert.equal(resolvePaymentDisputeStatus(['won', 'lost']), 'lost')
})

test('only full refund or lost dispute revokes entitlement', () => {
  assert.equal(shouldRevokePaymentEntitlement('partial', 'none'), false)
  assert.equal(shouldRevokePaymentEntitlement('none', 'open'), false)
  assert.equal(shouldRevokePaymentEntitlement('full', 'won'), true)
  assert.equal(shouldRevokePaymentEntitlement('none', 'lost'), true)
})

test('canonical lifecycle snapshot validates against payment ledger', () => {
  assert.equal(isPaymentLifecycleSnapshotValid(payment, snapshot()), true)
  assert.equal(isPaymentLifecycleSnapshotValid(payment, snapshot({ amount: 1 })), false)
  assert.equal(isPaymentLifecycleSnapshotValid(payment, snapshot({ customerId: 'cus_2' })), false)
  assert.equal(isPaymentLifecycleSnapshotValid(payment, snapshot({ chargePaid: false })), false)
  assert.equal(isPaymentLifecycleSnapshotValid(payment, snapshot({ amountRefunded: 15000 })), false)
})

test('pseudonymized ledger validates delayed lifecycle without Customer ID', () => {
  assert.equal(isPaymentLifecycleSnapshotValid(
    {
      ...payment,
      stripeCustomerId: null,
      pseudonymizedAt: new Date('2026-08-14T12:00:00.000Z'),
    },
    snapshot()
  ), true)
})

test('stored charge identity rejects a different charge', () => {
  assert.equal(isPaymentLifecycleSnapshotValid(
    { ...payment, chargeId: 'ch_existing' },
    snapshot()
  ), false)
})

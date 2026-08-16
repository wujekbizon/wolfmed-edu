import assert from 'node:assert/strict'
import test from 'node:test'
import { getSubscriptionBillingDate } from '@/helpers/getSubscriptionBillingDate'
import type { BillingSubscription } from '@/types/billingTypes'

const currentPeriodEnd = new Date('2026-09-14T00:00:00Z')
const subscription: BillingSubscription = {
  courseSlug: 'pielegniarstwo',
  accessTier: 'premium',
  status: 'active',
  currentPeriodEnd,
  pendingAccessTier: null,
  pendingChangeAt: null,
  cancelAtPeriodEnd: false,
  cancelAt: null,
}

test('billing summary recognizes renewal and cancellation dates', () => {
  assert.deepEqual(getSubscriptionBillingDate(subscription), {
    date: currentPeriodEnd,
    label: 'odnowienie',
  })
  assert.deepEqual(getSubscriptionBillingDate({
    ...subscription,
    cancelAt: currentPeriodEnd,
  }), {
    date: currentPeriodEnd,
    label: 'dostęp do',
  })
  assert.deepEqual(getSubscriptionBillingDate({
    ...subscription,
    cancelAtPeriodEnd: true,
  }), {
    date: currentPeriodEnd,
    label: 'dostęp do',
  })
  assert.equal(getSubscriptionBillingDate({
    ...subscription,
    status: 'canceled',
  }), null)
})

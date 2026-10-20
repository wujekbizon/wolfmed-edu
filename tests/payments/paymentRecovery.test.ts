import assert from 'node:assert/strict'
import test from 'node:test'
import { getPricingOfferStatuses } from '@/helpers/getPricingOfferStatuses'
import { isSubscriptionPaymentOverdue } from '@/helpers/isSubscriptionPaymentOverdue'
import type { LifetimeUpgradeGrant } from '@/types/paymentTypes'

test('overdue subscriptions offer recovery for monthly and lifetime purchases', () => {
  for (const status of ['past_due', 'unpaid']) {
    const offers = getPricingOfferStatuses([], 'opiekun-medyczny', false, null, status)
    assert.equal(offers.opiekun_basic_monthly, 'payment_required')
    assert.equal(offers.opiekun_premium_monthly, 'payment_required')
    assert.equal(offers.opiekun_basic_lifetime, 'payment_required')
    assert.equal(offers.opiekun_premium_lifetime, 'payment_required')
    assert.equal(offers.pielegniarstwo_basic_monthly, undefined)
  }
})

test('canceled subscriptions allow fresh purchases despite historical enrollments', () => {
  const grants: LifetimeUpgradeGrant[] = [{
    courseSlug: 'opiekun-medyczny',
    accessTier: 'basic',
    sourceType: 'subscription',
    isActive: false,
    enrolledAt: new Date('2026-01-01'),
    startsAt: null,
    expiresAt: new Date('2026-02-01'),
    revokedAt: new Date('2026-02-01'),
  }]
  for (const status of ['canceled', 'incomplete_expired', null]) {
    const offers = getPricingOfferStatuses(grants, 'opiekun-medyczny', true, null, status)
    assert.equal(offers.opiekun_basic_monthly, 'available')
    assert.equal(offers.opiekun_premium_monthly, 'available')
    assert.equal(offers.opiekun_basic_lifetime, 'available')
  }
})

test('payment recovery ends when a paid subscription becomes active', () => {
  const grants: LifetimeUpgradeGrant[] = [{
    courseSlug: 'opiekun-medyczny',
    accessTier: 'basic',
    sourceType: 'subscription',
    isActive: true,
    enrolledAt: new Date('2026-01-01'),
    startsAt: null,
    expiresAt: null,
    revokedAt: null,
  }]
  const offers = getPricingOfferStatuses(grants, 'opiekun-medyczny', true, null, 'active')
  assert.equal(offers.opiekun_basic_monthly, 'current_subscription')
  assert.equal(offers.opiekun_premium_monthly, 'portal_upgrade')
  assert.equal(offers.opiekun_basic_lifetime, 'active_subscription')
})

test('only overdue statuses require payment recovery', () => {
  assert.equal(isSubscriptionPaymentOverdue('past_due'), true)
  assert.equal(isSubscriptionPaymentOverdue('unpaid'), true)
  for (const status of ['active', 'trialing', 'canceled', 'incomplete', null, undefined]) {
    assert.equal(isSubscriptionPaymentOverdue(status), false)
  }
})

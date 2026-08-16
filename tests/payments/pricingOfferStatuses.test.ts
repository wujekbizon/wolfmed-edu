import assert from 'node:assert/strict'
import test from 'node:test'
import { getPricingOfferStatuses } from '@/helpers/getPricingOfferStatuses'
import type { LifetimeUpgradeGrant } from '@/types/paymentTypes'

const grant = (
  overrides: Partial<LifetimeUpgradeGrant> = {}
): LifetimeUpgradeGrant => ({
  courseSlug: 'opiekun-medyczny',
  accessTier: 'basic',
  sourceType: 'lifetime_purchase',
  isActive: true,
  enrolledAt: new Date('2026-01-01T00:00:00Z'),
  startsAt: null,
  expiresAt: null,
  revokedAt: null,
  ...overrides,
})

test('new user can choose subscription or lifetime', () => {
  const statuses = getPricingOfferStatuses([], 'opiekun-medyczny', true)
  assert.equal(statuses.opiekun_basic_monthly, 'available')
  assert.equal(statuses.opiekun_premium_monthly, 'available')
  assert.equal(statuses.opiekun_basic_lifetime, 'available')
  assert.equal(statuses.opiekun_premium_lifetime, 'available')
})

test('inactive historical grant does not affect pricing', () => {
  const statuses = getPricingOfferStatuses(
    [grant({ isActive: false })],
    'opiekun-medyczny',
    true
  )
  assert.equal(statuses.opiekun_basic_monthly, 'available')
  assert.equal(statuses.opiekun_basic_lifetime, 'available')
})

test('lifetime Basic blocks subscriptions and offers lifetime Premium upgrade', () => {
  const statuses = getPricingOfferStatuses([grant()], 'opiekun-medyczny', true)
  assert.equal(statuses.opiekun_basic_monthly, 'lifetime_access')
  assert.equal(statuses.opiekun_premium_monthly, 'lifetime_access')
  assert.equal(statuses.opiekun_basic_lifetime, 'owned_lifetime')
  assert.equal(statuses.opiekun_premium_upgrade, 'available')
})

test('Basic subscription upgrades through configured Portal only', () => {
  const activeSubscription = grant({ sourceType: 'subscription' })
  const configured = getPricingOfferStatuses(
    [activeSubscription],
    'opiekun-medyczny',
    true
  )
  const missingConfiguration = getPricingOfferStatuses(
    [activeSubscription],
    'opiekun-medyczny',
    false
  )
  assert.equal(configured.opiekun_basic_monthly, 'current_subscription')
  assert.equal(configured.opiekun_premium_monthly, 'portal_upgrade')
  assert.equal(configured.opiekun_basic_lifetime, 'active_subscription')
  assert.equal(configured.opiekun_premium_lifetime, 'active_subscription')
  assert.equal(
    missingConfiguration.opiekun_premium_monthly,
    'portal_upgrade_unavailable'
  )
})

test('Premium subscription offers a scheduled Basic downgrade', () => {
  const statuses = getPricingOfferStatuses(
    [grant({ sourceType: 'subscription', accessTier: 'premium' })],
    'opiekun-medyczny',
    true
  )
  assert.equal(statuses.opiekun_basic_monthly, 'portal_downgrade')
  assert.equal(statuses.opiekun_premium_monthly, 'current_subscription')
  assert.equal(statuses.opiekun_premium_lifetime, 'active_subscription')
})

test('scheduled downgrade is shown without reducing Premium access', () => {
  const effectiveAt = new Date('2026-09-14T00:00:00Z')
  const statuses = getPricingOfferStatuses(
    [grant({ sourceType: 'subscription', accessTier: 'premium' })],
    'opiekun-medyczny',
    true,
    {
      courseSlug: 'opiekun-medyczny',
      targetOfferKey: 'opiekun_basic_monthly',
      targetAccessTier: 'basic',
      effectiveAt,
    }
  )
  assert.equal(statuses.opiekun_basic_monthly, 'scheduled_downgrade')
  assert.equal(statuses.opiekun_premium_monthly, 'current_subscription')
})

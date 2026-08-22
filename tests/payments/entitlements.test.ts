import assert from 'node:assert/strict'
import test from 'node:test'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { resolveLifetimeCheckoutEligibility } from '@/helpers/resolveLifetimeCheckoutEligibility'
import { resolveSubscriptionCheckoutEligibility } from '@/helpers/resolveSubscriptionCheckoutEligibility'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import type { EnrollmentGrant, LifetimeUpgradeGrant } from '@/types/paymentTypes'

const now = new Date('2026-08-11T12:00:00Z')

const grant = (overrides: Partial<EnrollmentGrant> = {}): EnrollmentGrant => ({
  courseSlug: 'opiekun-medyczny',
  accessTier: 'basic',
  isActive: true,
  enrolledAt: new Date('2026-01-01T00:00:00Z'),
  startsAt: null,
  expiresAt: null,
  revokedAt: null,
  ...overrides,
})

const upgradeGrant = (
  overrides: Partial<LifetimeUpgradeGrant> = {}
): LifetimeUpgradeGrant => ({
  ...grant(),
  sourceType: 'lifetime_purchase',
  ...overrides,
})

test('highest active tier wins for each course', () => {
  const effective = getEffectiveEnrollmentGrants([
    grant(),
    grant({ accessTier: 'premium', enrolledAt: new Date('2026-02-01T00:00:00Z') }),
    grant({ courseSlug: 'pielegniarstwo' }),
  ], now)

  assert.equal(effective.length, 2)
  assert.equal(
    effective.find((item) => item.courseSlug === 'opiekun-medyczny')?.accessTier,
    'premium'
  )
})

test('revoked, expired, future and inactive grants provide no access', () => {
  const effective = getEffectiveEnrollmentGrants([
    grant({ revokedAt: new Date('2026-08-10T00:00:00Z') }),
    grant({ expiresAt: new Date('2026-08-10T00:00:00Z') }),
    grant({ startsAt: new Date('2026-08-12T00:00:00Z') }),
    grant({ isActive: false }),
  ], now)

  assert.deepEqual(effective, [])
})

test('legacy grants without source fields remain active', () => {
  assert.deepEqual(getEffectiveEnrollmentGrants([grant()], now), [grant()])
})

test('active subscription survives Test Clock dates ahead of app time', () => {
  const subscription = grant({
    sourceType: 'subscription',
    startsAt: new Date('2026-09-14T00:00:00Z'),
    expiresAt: new Date('2026-10-14T00:00:00Z'),
  })

  assert.deepEqual(getEffectiveEnrollmentGrants([subscription], now), [subscription])
})

test('revoked Premium upgrade falls back to lifetime Basic', () => {
  const effective = getEffectiveEnrollmentGrants([
    grant(),
    grant({
      accessTier: 'premium',
      enrolledAt: new Date('2026-02-01T00:00:00Z'),
      revokedAt: new Date('2026-08-10T00:00:00Z'),
    }),
  ], now)

  assert.equal(effective[0]?.accessTier, 'basic')
})

test('lifetime or subscription access blocks duplicate subscription model', () => {
  const offer = PAYMENT_OFFERS.opiekun_basic_monthly

  assert.equal(resolveSubscriptionCheckoutEligibility([], offer), 'ALLOWED')
  assert.equal(resolveSubscriptionCheckoutEligibility([upgradeGrant()], offer), 'ALREADY_OWNED')
  assert.equal(resolveSubscriptionCheckoutEligibility([
    upgradeGrant({ sourceType: 'subscription' }),
  ], offer), 'ALREADY_OWNED')
})

test('active subscription blocks lifetime checkout for same course', () => {
  assert.equal(resolveLifetimeCheckoutEligibility([
    upgradeGrant({ sourceType: 'subscription' }),
  ], PAYMENT_OFFERS.opiekun_premium_lifetime), 'NOT_ELIGIBLE')
})

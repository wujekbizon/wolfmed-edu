import assert from 'node:assert/strict'
import test from 'node:test'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { getEligibleLifetimeUpgradeOfferKey } from '@/helpers/getEligibleLifetimeUpgradeOfferKey'
import { resolveLifetimeCheckoutEligibility } from '@/helpers/resolveLifetimeCheckoutEligibility'
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

test('lifetime Basic grants receive the course upgrade offer', () => {
  const grants = [upgradeGrant()]

  assert.equal(
    getEligibleLifetimeUpgradeOfferKey(grants, 'opiekun-medyczny'),
    'opiekun_premium_upgrade'
  )
  assert.equal(
    getEligibleLifetimeUpgradeOfferKey(grants, 'pielegniarstwo'),
    null
  )
})

test('manual Basic and Premium owners cannot buy a lifetime upgrade', () => {
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    upgradeGrant({ sourceType: 'manual' }),
  ], 'opiekun-medyczny'), null)
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    upgradeGrant({ accessTier: 'premium' }),
  ], 'opiekun-medyczny'), null)
})

test('server permits only the eligible difference-price upgrade', () => {
  const grants = [upgradeGrant()]

  assert.equal(resolveLifetimeCheckoutEligibility(
    grants,
    PAYMENT_OFFERS.opiekun_premium_upgrade
  ), 'ALLOWED')
  assert.equal(resolveLifetimeCheckoutEligibility(
    [],
    PAYMENT_OFFERS.opiekun_premium_upgrade
  ), 'NOT_ELIGIBLE')
  assert.equal(resolveLifetimeCheckoutEligibility(
    [],
    PAYMENT_OFFERS.opiekun_premium_lifetime
  ), 'ALLOWED')
  assert.equal(resolveLifetimeCheckoutEligibility(
    grants,
    PAYMENT_OFFERS.opiekun_premium_lifetime
  ), 'UPGRADE_REQUIRED')
})

test('expired or revoked Basic grants cannot buy a lifetime upgrade', () => {
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    upgradeGrant({ expiresAt: new Date('2026-08-10T00:00:00Z') }),
  ], 'opiekun-medyczny', now), null)
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    upgradeGrant({ revokedAt: new Date('2026-08-10T00:00:00Z') }),
  ], 'opiekun-medyczny', now), null)
})

test('manual Basic does not hide an eligible lifetime Basic grant', () => {
  const grants = [
    upgradeGrant({ sourceType: 'manual' }),
    upgradeGrant({ sourceType: 'legacy_lifetime' }),
  ]

  assert.equal(
    getEligibleLifetimeUpgradeOfferKey(grants, 'opiekun-medyczny', now),
    'opiekun_premium_upgrade'
  )
})

test('active Premium hides the upgrade even when Basic remains', () => {
  const grants = [
    upgradeGrant(),
    upgradeGrant({
      accessTier: 'premium',
      sourceType: 'lifetime_upgrade',
    }),
  ]

  assert.equal(
    getEligibleLifetimeUpgradeOfferKey(grants, 'opiekun-medyczny', now),
    null
  )
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

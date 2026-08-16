import assert from 'node:assert/strict'
import test from 'node:test'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { getEligibleLifetimeUpgradeOfferKey } from '@/helpers/getEligibleLifetimeUpgradeOfferKey'
import { resolveLifetimeCheckoutEligibility } from '@/helpers/resolveLifetimeCheckoutEligibility'
import type { LifetimeUpgradeGrant } from '@/types/paymentTypes'

const now = new Date('2026-08-11T12:00:00Z')
const grant = (overrides: Partial<LifetimeUpgradeGrant> = {}): LifetimeUpgradeGrant => ({
  courseSlug: 'opiekun-medyczny',
  accessTier: 'basic',
  isActive: true,
  enrolledAt: new Date('2026-01-01T00:00:00Z'),
  startsAt: null,
  expiresAt: null,
  revokedAt: null,
  sourceType: 'lifetime_purchase',
  ...overrides,
})

test('lifetime Basic receives only its course upgrade', () => {
  assert.equal(getEligibleLifetimeUpgradeOfferKey([grant()], 'opiekun-medyczny'),
    'opiekun_premium_upgrade')
  assert.equal(getEligibleLifetimeUpgradeOfferKey([grant()], 'pielegniarstwo'), null)
})

test('manual and Premium owners cannot buy a lifetime upgrade', () => {
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    grant({ sourceType: 'manual' }),
  ], 'opiekun-medyczny'), null)
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    grant({ accessTier: 'premium' }),
  ], 'opiekun-medyczny'), null)
})

test('server permits only eligible difference-price upgrade', () => {
  assert.equal(resolveLifetimeCheckoutEligibility([
    grant(),
  ], PAYMENT_OFFERS.opiekun_premium_upgrade), 'ALLOWED')
  assert.equal(resolveLifetimeCheckoutEligibility(
    [], PAYMENT_OFFERS.opiekun_premium_upgrade
  ), 'NOT_ELIGIBLE')
  assert.equal(resolveLifetimeCheckoutEligibility(
    [], PAYMENT_OFFERS.opiekun_premium_lifetime
  ), 'ALLOWED')
  assert.equal(resolveLifetimeCheckoutEligibility([
    grant(),
  ], PAYMENT_OFFERS.opiekun_premium_lifetime), 'UPGRADE_REQUIRED')
})

test('expired or revoked Basic cannot buy upgrade', () => {
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    grant({ expiresAt: new Date('2026-08-10T00:00:00Z') }),
  ], 'opiekun-medyczny', now), null)
  assert.equal(getEligibleLifetimeUpgradeOfferKey([
    grant({ revokedAt: new Date('2026-08-10T00:00:00Z') }),
  ], 'opiekun-medyczny', now), null)
})

test('eligible lifetime grant wins over manual Basic', () => {
  const grants = [grant({ sourceType: 'manual' }), grant({ sourceType: 'legacy_lifetime' })]
  assert.equal(getEligibleLifetimeUpgradeOfferKey(grants, 'opiekun-medyczny', now),
    'opiekun_premium_upgrade')
})

test('active Premium hides upgrade while Basic remains', () => {
  const grants = [grant(), grant({ accessTier: 'premium', sourceType: 'lifetime_upgrade' })]
  assert.equal(getEligibleLifetimeUpgradeOfferKey(grants, 'opiekun-medyczny', now), null)
})

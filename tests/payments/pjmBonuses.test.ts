import assert from 'node:assert/strict'
import test from 'node:test'
import { getPjmBonusGrant } from '@/helpers/getPjmBonusGrant'
import { resolveSubscriptionCheckoutEligibility } from '@/helpers/resolveSubscriptionCheckoutEligibility'
import type { PjmBonusSource } from '@/types/pjmBonusTypes'

const now = new Date('2026-09-13T12:00:00.000Z')

const source = (overrides: Partial<PjmBonusSource> = {}): PjmBonusSource => ({
  userId: 'user_1',
  courseSlug: 'opiekun-medyczny',
  accessTier: 'basic',
  sourceType: 'lifetime_purchase',
  sourceId: 'cs_1',
  isActive: true,
  enrolledAt: new Date('2026-01-01T00:00:00.000Z'),
  startsAt: null,
  expiresAt: null,
  revokedAt: null,
  ...overrides,
})

test('PJM Basic bundle applies to Basic and Premium medical purchases', () => {
  for (const courseSlug of ['opiekun-medyczny', 'pielegniarstwo']) {
    for (const accessTier of ['basic', 'premium'] as const) {
      const bonus = getPjmBonusGrant(source({ courseSlug, accessTier }), now)
      assert.equal(bonus?.courseSlug, 'jezyk-migowy')
      assert.equal(bonus?.accessTier, 'basic')
      assert.equal(bonus?.isActive, true)
    }
  }
})

test('PJM bonus keeps source identity separate from English bonus', () => {
  const bonus = getPjmBonusGrant(source(), now)!
  assert.equal(bonus.sourceType, 'premium_bundle')
  assert.equal(bonus.sourceId, 'jezyk-migowy:lifetime_purchase:cs_1')
  assert.notEqual(bonus.sourceId, 'lifetime_purchase:cs_1')
})

test('PJM bonus follows subscription period and revokes with parent', () => {
  const expiresAt = new Date('2026-10-01T00:00:00.000Z')
  const active = getPjmBonusGrant(source({
    sourceType: 'subscription',
    sourceId: 'sub_1',
    expiresAt,
  }), now)!
  assert.equal(active.startsAt, null)
  assert.equal(active.expiresAt, expiresAt)
  assert.equal(active.isActive, true)

  const ended = getPjmBonusGrant(source({
    sourceType: 'subscription',
    sourceId: 'sub_1',
    expiresAt: now,
  }), now)!
  assert.equal(ended.isActive, false)
  assert.equal(ended.revokedAt, now)
})

test('PJM bonus never derives from another bonus or unrelated course', () => {
  assert.equal(getPjmBonusGrant(source({ sourceType: 'premium_bundle' }), now), null)
  assert.equal(getPjmBonusGrant(source({ courseSlug: 'jezyk-migowy' }), now), null)
})

test('PJM Basic bundle does not block Premium subscription purchase', () => {
  const bonus = getPjmBonusGrant(source(), now)!
  assert.equal(resolveSubscriptionCheckoutEligibility([
    bonus,
  ], {
    key: 'jezyk_migowy_premium_monthly',
    courseSlug: 'jezyk-migowy',
    accessTier: 'premium',
    amount: 0,
    currency: 'pln',
    available: false,
    purchaseModel: 'subscription',
    entitlementSourceType: 'subscription',
    priceEnvName: 'STRIPE_JEZYK_MIGOWY_PREMIUM_MONTHLY_PRICE_ID',
  }), 'ALLOWED')
})

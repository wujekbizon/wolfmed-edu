import assert from 'node:assert/strict'
import test from 'node:test'
import { getEnglishBonusGrant } from '@/helpers/getEnglishBonusGrant'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { getPricingOfferStatuses } from '@/helpers/getPricingOfferStatuses'
import { resolveLifetimeCheckoutEligibility } from '@/helpers/resolveLifetimeCheckoutEligibility'
import { resolveSubscriptionCheckoutEligibility } from '@/helpers/resolveSubscriptionCheckoutEligibility'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import type { EnglishBonusSource } from '@/types/englishBonusTypes'

const now = new Date()
const source = (overrides: Partial<EnglishBonusSource> = {}): EnglishBonusSource => ({
  userId: 'user_1', courseSlug: 'opiekun-medyczny', accessTier: 'premium',
  sourceType: 'lifetime_purchase', sourceId: 'cs_1', isActive: true,
  enrolledAt: new Date('2026-01-01'), startsAt: null, expiresAt: null, revokedAt: null,
  ...overrides,
})

test('both Premium courses and lifetime upgrades include only English Basic', () => {
  for (const courseSlug of ['opiekun-medyczny', 'pielegniarstwo']) {
    for (const sourceType of ['lifetime_purchase', 'lifetime_upgrade', 'legacy_lifetime'] as const) {
      const bonus = getEnglishBonusGrant(source({ courseSlug, sourceType }), now)!
      assert.equal(bonus.courseSlug, 'angielski-medyczny')
      assert.equal(bonus.accessTier, 'basic')
      assert.equal(bonus.isActive, true)
      assert.equal(bonus.expiresAt, null)
    }
  }
  assert.equal(getEnglishBonusGrant(source({ accessTier: 'basic' }))?.isActive, false)
  assert.equal(getEnglishBonusGrant(source({ courseSlug: 'angielski-medyczny' })), null)
})

test('bonus identity is stable and separate for each purchase source', () => {
  const bonus = getEnglishBonusGrant(source(), now)!
  assert.equal(bonus.sourceId, getEnglishBonusGrant(source(), now)?.sourceId)
  assert.notEqual(bonus.sourceId, getEnglishBonusGrant(source({ sourceId: 'cs_2' }))?.sourceId)
  assert.notEqual(bonus.sourceId, getEnglishBonusGrant(source({ sourceType: 'lifetime_upgrade' }))?.sourceId)
})

test('subscription bonus renews, ends and restores with its source', () => {
  const expiresAt = new Date(now.getTime() + 86400000)
  const subscription = source({ sourceType: 'subscription', sourceId: 'sub_1', expiresAt })
  const bonus = getEnglishBonusGrant(subscription, now)!
  assert.equal(bonus.expiresAt, expiresAt)
  const nextPeriodEnd = new Date(expiresAt.getTime() + 86400000)
  const renewed = getEnglishBonusGrant({ ...subscription, expiresAt: nextPeriodEnd }, now)!
  assert.equal(renewed.expiresAt, nextPeriodEnd)
  assert.equal(renewed.sourceId, bonus.sourceId)
  assert.equal(getEnglishBonusGrant({ ...subscription, isActive: false }, now)?.isActive, false)
  assert.equal(getEnglishBonusGrant({ ...subscription, accessTier: 'basic' }, now)?.isActive, false)
  assert.equal(getEnglishBonusGrant(subscription, now)?.isActive, true)
  assert.equal(getEnglishBonusGrant(subscription, expiresAt)?.isActive, false)
})

test('bonus blocks English lifetime and monthly checkout and shows included label', () => {
  const bonus = getEnglishBonusGrant(source(), now)!
  assert.equal(resolveLifetimeCheckoutEligibility([bonus], PAYMENT_OFFERS.angielski_medyczny_basic_lifetime), 'ALREADY_OWNED')
  assert.equal(resolveSubscriptionCheckoutEligibility([bonus], PAYMENT_OFFERS.angielski_medyczny_basic_monthly), 'ALREADY_OWNED')
  const statuses = getPricingOfferStatuses([bonus], 'angielski-medyczny', true)
  assert.equal(statuses.angielski_medyczny_basic_lifetime, 'included_access')
  assert.equal(statuses.angielski_medyczny_basic_monthly, 'included_access')
  assert.equal(statuses.angielski_medyczny_premium_lifetime, 'unavailable')
})

test('ending one bonus preserves purchased English and another qualifying bonus', () => {
  const ended = { ...getEnglishBonusGrant(source(), now)!, isActive: false }
  const purchased = { ...ended, sourceType: 'lifetime_purchase' as const, isActive: true }
  const other = getEnglishBonusGrant(source({ sourceId: 'cs_2', courseSlug: 'pielegniarstwo' }), now)!
  assert.equal(getEffectiveEnrollmentGrants([ended, purchased], now).length, 1)
  assert.equal(getEffectiveEnrollmentGrants([ended, other], now).length, 1)
  assert.equal(resolveLifetimeCheckoutEligibility([ended], PAYMENT_OFFERS.angielski_medyczny_basic_lifetime), 'ALLOWED')
  assert.equal(resolveSubscriptionCheckoutEligibility([ended], PAYMENT_OFFERS.angielski_medyczny_basic_monthly), 'ALLOWED')
})

test('Test Clock future period start does not hide active subscription bonus', () => {
  const bonus = getEnglishBonusGrant(source({
    sourceType: 'subscription', startsAt: new Date(now.getTime() + 86400000),
    expiresAt: new Date(now.getTime() + 172800000),
  }), now)!
  assert.equal(getEffectiveEnrollmentGrants([bonus], now).length, 1)
})

test('migration eligibility excludes inactive, revoked, expired and future lifetime grants', () => {
  for (const overrides of [
    { isActive: false }, { revokedAt: now }, { expiresAt: now },
    { startsAt: new Date(now.getTime() + 86400000) },
  ]) {
    assert.equal(getEnglishBonusGrant(source(overrides), now)?.isActive, false)
  }
})

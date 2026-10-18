import assert from 'node:assert/strict'
import test from 'node:test'
import { hasPracticeEnrollmentAccess } from '@/helpers/hasPracticeEnrollmentAccess'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import type { EnrollmentGrant } from '@/types/paymentTypes'

test('practice requires the category course and required tier', () => {
  assert.equal(hasPracticeEnrollmentAccess('opiekun-medyczny', []), false)
  assert.equal(hasPracticeEnrollmentAccess('opiekun-medyczny', [
    { courseSlug: 'pielegniarstwo', accessTier: 'premium' },
  ]), false)
  assert.equal(hasPracticeEnrollmentAccess('opiekun-medyczny', [
    { courseSlug: 'opiekun-medyczny', accessTier: 'free' },
  ]), false)
  assert.equal(hasPracticeEnrollmentAccess('opiekun-medyczny', [
    { courseSlug: 'opiekun-medyczny', accessTier: 'basic' },
  ]), true)
  assert.equal(hasPracticeEnrollmentAccess('unknown', []), false)
})

test('expired or revoked access cannot resume a practice attempt', () => {
  const now = new Date('2026-10-18T12:00:00Z')
  const grant: EnrollmentGrant = {
    courseSlug: 'opiekun-medyczny', accessTier: 'premium',
    isActive: true, enrolledAt: new Date('2026-01-01'),
    startsAt: null, expiresAt: new Date('2026-10-17'), revokedAt: null,
  }
  for (const invalid of [grant, { ...grant, expiresAt: null, revokedAt: now }]) {
    const active = getEffectiveEnrollmentGrants([invalid], now)
    assert.equal(hasPracticeEnrollmentAccess('opiekun-medyczny', active), false)
    assert.equal(hasPracticeEnrollmentAccess('moje-testy__owned', active), false)
  }
})

test('custom practice requires current premium access', () => {
  assert.equal(hasPracticeEnrollmentAccess('moje-testy__owned', [
    { courseSlug: 'opiekun-medyczny', accessTier: 'basic' },
  ]), false)
  assert.equal(hasPracticeEnrollmentAccess('moje-testy__owned', [
    { courseSlug: 'opiekun-medyczny', accessTier: 'premium' },
  ]), true)
})

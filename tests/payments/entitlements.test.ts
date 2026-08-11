import assert from 'node:assert/strict'
import test from 'node:test'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'
import { getLifetimeEnrollmentMerge } from '@/helpers/getLifetimeEnrollmentMerge'
import type { EnrollmentGrant } from '@/types/paymentTypes'

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

test('lifetime upgrade updates one canonical enrollment', () => {
  assert.deepEqual(getLifetimeEnrollmentMerge([
    { id: 'basic', accessTier: 'basic' },
  ], 'premium'), {
    canonicalId: 'basic',
    staleIds: [],
    shouldApplyPurchase: true,
  })
})

test('duplicate lifetime grants keep highest tier without downgrade', () => {
  assert.deepEqual(getLifetimeEnrollmentMerge([
    { id: 'basic', accessTier: 'basic' },
    { id: 'premium', accessTier: 'premium' },
  ], 'basic'), {
    canonicalId: 'premium',
    staleIds: ['basic'],
    shouldApplyPurchase: false,
  })
})

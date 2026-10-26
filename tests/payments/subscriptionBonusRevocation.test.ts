import assert from 'node:assert/strict'
import test, { after, beforeEach } from 'node:test'
import { bonus, hooks, now, parent, rows, tx, writes } from './fixtures/subscriptionEnrollment'
import { offer, order, snapshot } from './fixtures/subscriptionEnrollmentSnapshot'
import { isSubscriptionAccessActive } from '@/helpers/isSubscriptionAccessActive'
import { getEffectiveEnrollmentGrants } from '@/helpers/getEffectiveEnrollmentGrants'

const { upsertSubscriptionEnrollment } = await import('@/server/payments/upsertSubscriptionEnrollment')
after(() => hooks.deregister())
beforeEach(() => {
  rows.splice(0, rows.length, { ...parent }, { ...bonus })
  writes.length = 0
})

test('failed renewal marks expired and unexpired linked bonuses revoked', async () => {
  for (const expiresAt of [bonus.expiresAt, snapshot.currentPeriodEnd]) {
    rows[1] = { ...bonus, expiresAt }
    await upsertSubscriptionEnrollment(tx, snapshot, order, offer, false, now)
    for (const row of rows) {
      assert.equal(row.isActive, false)
      assert.equal(row.revokedAt, now)
    }
    assert.equal(getEffectiveEnrollmentGrants(rows, now).length, 0)
  }
})

test('revocation preserves purchased English, other bundles and other users', async () => {
  const unrelated = [
    { ...bonus, sourceType: 'lifetime_purchase' as const, sourceId: 'cs_1', expiresAt: null },
    { ...bonus, sourceId: 'subscription:sub_2', expiresAt: null },
    { ...bonus, userId: 'user_2', sourceId: 'subscription:sub_3', expiresAt: null },
  ]
  rows.push(...structuredClone(unrelated))
  await upsertSubscriptionEnrollment(tx, snapshot, order, offer, false, now)
  assert.deepEqual(rows.slice(2), unrelated)
  assert.equal(rows[1]?.isActive, false)
  assert.equal(getEffectiveEnrollmentGrants(rows.filter((row) => row.userId === order.userId), now).length, 1)
})

test('paid recovery restores the same grants and repeated sync adds no duplicates', async () => {
  await upsertSubscriptionEnrollment(tx, snapshot, order, offer, false, now)
  assert.equal(rows[1]?.isActive, false)
  const paid = { ...snapshot, status: 'active', latestInvoicePaid: true, latestInvoiceStatus: 'paid' }
  for (let attempt = 0; attempt < 2; attempt++) {
    await upsertSubscriptionEnrollment(tx, paid, order, offer, isSubscriptionAccessActive(paid), now)
  }
  assert.equal(rows.length, 2)
  for (const row of rows) {
    assert.equal(row.isActive, true)
    assert.equal(row.revokedAt, null)
    assert.equal(row.expiresAt, paid.currentPeriodEnd)
  }
  assert.equal(rows[1]?.sourceId, bonus.sourceId)
  assert.equal(getEffectiveEnrollmentGrants(rows, now).length, 2)
})

test('repeated failed sync updates the existing bonus without creating grants', async () => {
  for (let attempt = 0; attempt < 2; attempt++) {
    await upsertSubscriptionEnrollment(tx, snapshot, order, offer, false, now)
  }
  assert.equal(rows.length, 2)
  assert.deepEqual(writes, ['upsert', 'update', 'upsert', 'update'])
  rows.splice(1)
  await upsertSubscriptionEnrollment(tx, snapshot, order, offer, false, now)
  assert.equal(rows.length, 1)
})

test('scheduled cancellation preserves paid access and terminal cancellation revokes both', async () => {
  const paid = { ...snapshot, status: 'active', latestInvoicePaid: true, cancelAtPeriodEnd: true }
  await upsertSubscriptionEnrollment(tx, paid, order, offer, isSubscriptionAccessActive(paid), now)
  assert.equal(getEffectiveEnrollmentGrants(rows, now).length, 2)
  const canceled = { ...paid, status: 'canceled' }
  await upsertSubscriptionEnrollment(tx, canceled, order, offer, isSubscriptionAccessActive(canceled), now)
  assert.equal(getEffectiveEnrollmentGrants(rows, now).length, 0)
})

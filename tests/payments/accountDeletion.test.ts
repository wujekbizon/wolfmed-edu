import assert from 'node:assert/strict'
import test from 'node:test'
import Stripe from 'stripe'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { canGrantPaymentAccess } from '@/helpers/canGrantPaymentAccess'
import { deleteStripeCustomer } from '@/helpers/deleteStripeCustomer'
import { getAccountDeletionCleanupAfter } from '@/helpers/getAccountDeletionCleanupAfter'
import { getPaymentRetentionDeadline } from '@/helpers/getPaymentRetentionDeadline'
import {
  blogLikes,
  courseEnrollments,
  generatedPracticalExams,
  learningPlanConcepts,
  lectures,
  userCustomCategories,
  userCustomTests,
  users,
} from '@/server/db/schema'

test('deleted owners never regain course access', () => {
  assert.equal(canGrantPaymentAccess('user_1', null), true)
  assert.equal(canGrantPaymentAccess(null, new Date()), false)
  assert.equal(canGrantPaymentAccess('user_1', new Date()), false)
})

test('retention and operational cleanup dates follow current policy', () => {
  const transaction = new Date('2026-08-14T12:00:00.000Z')
  assert.equal(
    getPaymentRetentionDeadline(transaction).toISOString(),
    '2032-12-31T23:59:59.999Z'
  )
  assert.equal(
    getAccountDeletionCleanupAfter(transaction).toISOString(),
    '2026-09-13T12:00:00.000Z'
  )
})

test('Stripe Customer deletion covers all subscriptions and missing Customers', async () => {
  const deleted: string[] = []
  await deleteStripeCustomer('cus_1', async (customerId) => {
    deleted.push(customerId)
  })
  assert.deepEqual(deleted, ['cus_1'])

  const missing = new Stripe.errors.StripeInvalidRequestError({
    message: 'No such customer',
    type: 'invalid_request_error',
    code: 'resource_missing',
  })
  await deleteStripeCustomer('cus_missing', async () => {
    throw missing
  })
  await deleteStripeCustomer(null, async () => {
    assert.fail('delete should not be called')
  })
})

test('all disposable owner tables cascade from users', () => {
  const tables = [
    blogLikes,
    courseEnrollments,
    generatedPracticalExams,
    learningPlanConcepts,
    lectures,
    userCustomCategories,
    userCustomTests,
  ]

  for (const table of tables) {
    const cascades = getTableConfig(table).foreignKeys.some((foreignKey) => (
      foreignKey.reference().foreignTable === users &&
      foreignKey.onDelete === 'cascade'
    ))
    assert.equal(cascades, true, getTableConfig(table).name)
  }
})

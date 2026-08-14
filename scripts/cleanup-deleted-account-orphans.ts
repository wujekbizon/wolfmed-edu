import postgres from 'postgres'
import Stripe from 'stripe'
import { UTApi } from 'uploadthing/server'
import { cleanupBillingOrphans } from './account-deletion/cleanupBillingOrphans'
import { cleanupDisposableOrphans } from './account-deletion/cleanupDisposableOrphans'
import { cleanupMemoryOrphans } from './account-deletion/cleanupMemoryOrphans'
import { getOrphanCounts } from './account-deletion/getOrphanCounts'

const connectionString = process.env.NEON_DATABASE_URL
const stripeKey = process.env.STRIPE_SECRET_KEY
const execute = process.argv.includes('--execute')

if (!connectionString) throw new Error('NEON_DATABASE_URL is not defined')
if (!stripeKey?.startsWith('sk_test_')) {
  throw new Error('Only a Stripe test secret key is allowed')
}

const sql = postgres(connectionString, { max: 1 })
const stripe = new Stripe(stripeKey)

try {
  const users = await sql<{ userId: string }[]>`SELECT "userId" FROM wolfmed_users`
  const userIds = new Set(users.map(({ userId }) => userId))
  const [schemaState] = await sql<{ ready: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'wolfmed_stripe_payments'
        AND column_name = 'pseudonymized_at'
    ) AS ready
  `
  const billingSchemaReady = schemaState?.ready ?? false
  const orphanCounts = await getOrphanCounts(sql)
  const orphanLectureFiles = await sql<{ key: string }[]>`
    SELECT lectures."audioKey" AS key
    FROM wolfmed_lectures lectures
    WHERE NOT EXISTS (
      SELECT 1 FROM wolfmed_users users
      WHERE users."userId" = lectures."userId"
    )
  `
  const orphanCustomers: string[] = []

  for await (const customer of stripe.customers.list({ limit: 100 })) {
    const userId = customer.metadata.userId
    if (userId && !userIds.has(userId)) orphanCustomers.push(customer.id)
  }

  console.log('Database orphans:', Object.fromEntries(orphanCounts))
  console.log('UploadThing lecture files:', orphanLectureFiles.map(({ key }) => key))
  console.log('Stripe test Customers:', orphanCustomers)
  console.log('Billing retention schema ready:', billingSchemaReady)
  if (!execute) {
    console.log('Dry run only. Re-run with --execute after review.')
    process.exitCode = 2
  } else {
    if (orphanLectureFiles.length > 0) {
      const result = await new UTApi().deleteFiles(
        orphanLectureFiles.map(({ key }) => key),
      )
      if (!result.success) throw new Error('UploadThing cleanup failed')
    }

    for (const customerId of orphanCustomers) {
      await stripe.customers.del(customerId)
    }

    await sql.begin(async (tx) => {
      await cleanupDisposableOrphans(tx)
      if (billingSchemaReady) await cleanupBillingOrphans(tx)
      await cleanupMemoryOrphans(tx)
    })
    console.log('Cleanup complete')
  }
} finally {
  await sql.end()
}

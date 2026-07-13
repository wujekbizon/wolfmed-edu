import 'server-only'
import type Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { and, eq, isNull } from 'drizzle-orm'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { users } from '@/server/db/schema'

/**
 * Returns the Stripe Customer id for a user, creating one lazily on first use.
 * The idempotency key guards against duplicate customers when a user
 * double-clicks or two checkout requests race.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const [existing] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1)

  if (existing?.stripeCustomerId) return existing.stripeCustomerId

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || ''

  const params: Stripe.CustomerCreateParams = { metadata: { userId } }
  if (email) params.email = email
  if (name) params.name = name

  const customer = await stripe.customers.create(params, {
    idempotencyKey: `customer-create-${userId}`,
  })

  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.userId, userId))

  return customer.id
}

/**
 * Links a Stripe Customer to a user only if none is stored yet. Used by the
 * webhook to backfill users who paid through a session created before this
 * field existed.
 */
export async function backfillStripeCustomerId(userId: string, customerId: string): Promise<void> {
  try {
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(and(eq(users.userId, userId), isNull(users.stripeCustomerId)))
  } catch (error) {
    console.error(`Failed to backfill stripeCustomerId for user ${userId}:`, error)
  }
}

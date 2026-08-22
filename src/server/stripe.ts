import 'server-only'
import type Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { isMissingStripeCustomer } from '@/helpers/isMissingStripeCustomer'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { users } from '@/server/db/schema'

/**
 * Resolves the Stripe Customer for a user, creating one lazily on first use.
 * A missing or deleted stored Customer is replaced and reported to the caller.
 * The idempotency key guards against duplicate customers when a user
 * double-clicks or two checkout requests race.
 */
async function createStripeCustomer(
  userId: string,
  replacedCustomerId?: string
): Promise<string> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || ''

  const params: Stripe.CustomerCreateParams = { metadata: { userId } }
  if (email) params.email = email
  if (name) params.name = name

  const idempotencyKey = replacedCustomerId
    ? `customer-replace-${replacedCustomerId}`
    : `customer-create-${userId}`
  const customer = await stripe.customers.create(params, { idempotencyKey })

  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.userId, userId))
  return customer.id
}

export async function getOrCreateStripeCustomer(userId: string) {
  const [existing] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1)

  if (!existing?.stripeCustomerId) {
    return {
      customerId: await createStripeCustomer(userId),
      replaced: false,
    }
  }

  try {
    const customer = await stripe.customers.retrieve(existing.stripeCustomerId)
    if (!isMissingStripeCustomer(customer)) {
      return { customerId: existing.stripeCustomerId, replaced: false }
    }
  } catch (error) {
    if (!isMissingStripeCustomer(error)) throw error
  }

  return {
    customerId: await createStripeCustomer(userId, existing.stripeCustomerId),
    replaced: true,
  }
}

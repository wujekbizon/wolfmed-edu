import 'server-only'
import { and, eq, notInArray } from 'drizzle-orm'
import { isMissingStripeCustomer } from '@/helpers/isMissingStripeCustomer'
import { TERMINAL_SUBSCRIPTION_STATUSES } from '@/constants/subscriptionStatus'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'

export async function cancelUserSubscriptions(userId: string): Promise<void> {
  const active = await db.select({ subscriptionId: subscriptions.subscriptionId })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      notInArray(subscriptions.status, [...TERMINAL_SUBSCRIPTION_STATUSES])
    ))

  await Promise.all(active.map(async ({ subscriptionId }) => {
    try {
      await stripe.subscriptions.cancel(subscriptionId, { prorate: false })
    } catch (error) {
      if (!isMissingStripeCustomer(error)) throw error
    }
  }))
}

import 'server-only'
import { desc, eq } from 'drizzle-orm'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'

export async function createBillingPortal(userId: string): Promise<string | null> {
  const [subscription] = await db.select({ customerId: subscriptions.customerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)
  if (!subscription) return null

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/panel#platnosci`,
  })
  return session.url
}

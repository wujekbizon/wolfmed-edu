import 'server-only'
import { eq } from 'drizzle-orm'
import stripe from '@/lib/stripeClient'
import { db } from '@/server/db/index'
import { users } from '@/server/db/schema'

export async function createBillingPortal(userId: string): Promise<string | null> {
  const [user] = await db.select({ customerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1)
  if (!user?.customerId) return null

  const session = await stripe.billingPortal.sessions.create({
    customer: user.customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/kierunki`,
  })
  return session.url
}

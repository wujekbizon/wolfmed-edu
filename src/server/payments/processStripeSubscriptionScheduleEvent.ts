import 'server-only'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import { getStripeScheduleEventSubscriptionId } from '@/helpers/getStripeScheduleEventSubscriptionId'
import { db } from '@/server/db/index'
import { subscriptions } from '@/server/db/schema'
import { syncStripeSubscriptionById } from '@/server/payments/syncStripeSubscriptionById'

export async function processStripeSubscriptionScheduleEvent(
  event: Stripe.Event
): Promise<void> {
  const schedule = event.data.object as Stripe.SubscriptionSchedule
  let subscriptionId = getStripeScheduleEventSubscriptionId(event)
  if (!subscriptionId) {
    const [local] = await db.select({ subscriptionId: subscriptions.subscriptionId })
      .from(subscriptions)
      .where(eq(subscriptions.scheduleId, schedule.id))
      .limit(1)
    subscriptionId = local?.subscriptionId ?? null
  }
  if (!subscriptionId) return

  await syncStripeSubscriptionById(event.id, event.type, subscriptionId)
}

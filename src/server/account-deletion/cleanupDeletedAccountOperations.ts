import 'server-only'
import { lte } from 'drizzle-orm'
import { db } from '@/server/db/index'
import {
  checkoutOrders,
  processedEvents,
  subscriptions,
} from '@/server/db/schema'

export async function cleanupDeletedAccountOperations(now: Date) {
  return db.transaction(async (tx) => {
    const events = await tx.delete(processedEvents)
      .where(lte(processedEvents.cleanupAfter, now))
      .returning({ id: processedEvents.id })
    const subscriptionRows = await tx.delete(subscriptions)
      .where(lte(subscriptions.cleanupAfter, now))
      .returning({ id: subscriptions.id })
    const orders = await tx.delete(checkoutOrders)
      .where(lte(checkoutOrders.cleanupAfter, now))
      .returning({ id: checkoutOrders.id })

    return {
      events: events.length,
      subscriptions: subscriptionRows.length,
      orders: orders.length,
    }
  })
}

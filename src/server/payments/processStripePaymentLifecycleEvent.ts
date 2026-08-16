import 'server-only'
import { getPaymentLifecycleSnapshot } from '@/server/payments/getPaymentLifecycleSnapshot'
import { syncPaymentLifecycle } from '@/server/payments/syncPaymentLifecycle'
import type { StripePaymentLifecycleEventType } from '@/types/paymentTypes'
import type Stripe from 'stripe'

export async function processStripePaymentLifecycleEvent(
  event: Stripe.Event
): Promise<void> {
  const snapshot = await getPaymentLifecycleSnapshot(event)
  await syncPaymentLifecycle(
    event.id,
    event.type as StripePaymentLifecycleEventType,
    snapshot
  )
}

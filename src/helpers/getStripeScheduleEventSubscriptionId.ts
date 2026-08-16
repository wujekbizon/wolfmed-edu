import type Stripe from 'stripe'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'

export function getStripeScheduleEventSubscriptionId(
  event: Stripe.Event
): string | null {
  const schedule = event.data.object as Stripe.SubscriptionSchedule
  return getStripeObjectId(schedule.subscription) ?? schedule.released_subscription
}

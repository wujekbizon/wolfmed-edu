import type Stripe from 'stripe'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'

export function getSubscriptionDowngradePhases(
  schedule: Stripe.SubscriptionSchedule,
  currentPriceId: string,
  targetPriceId: string,
  currentPeriodEnd: Date
): Stripe.SubscriptionScheduleUpdateParams.Phase[] | null {
  if (schedule.status !== 'active' || schedule.phases.length !== 1) return null

  const [phase] = schedule.phases
  const [item] = phase?.items ?? []
  const periodEnd = Math.floor(currentPeriodEnd.getTime() / 1000)
  if (
    !phase ||
    phase.items.length !== 1 ||
    getStripeObjectId(item?.price ?? null) !== currentPriceId ||
    (item?.quantity ?? 1) !== 1 ||
    phase.end_date !== periodEnd ||
    currentPriceId === targetPriceId
  ) return null

  return [
    {
      start_date: phase.start_date,
      end_date: phase.end_date,
      items: [{ price: currentPriceId, quantity: 1 }],
    },
    {
      duration: { interval: 'month', interval_count: 1 },
      items: [{ price: targetPriceId, quantity: 1 }],
      proration_behavior: 'none',
    },
  ]
}

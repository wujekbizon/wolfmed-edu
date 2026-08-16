import type Stripe from 'stripe'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import type { ScheduledSubscriptionChangeSnapshot } from '@/types/paymentTypes'

export function getScheduledSubscriptionChange(
  schedule: Stripe.SubscriptionSchedule | null,
  currentPriceId: string,
  currentPeriodEnd: Date
): ScheduledSubscriptionChangeSnapshot | null {
  if (!schedule || !['active', 'not_started'].includes(schedule.status)) return null

  const periodEnd = Math.floor(currentPeriodEnd.getTime() / 1000)
  const phase = schedule.phases
    .filter((candidate) => candidate.start_date >= periodEnd)
    .sort((left, right) => left.start_date - right.start_date)
    .find((candidate) => {
      const priceId = candidate.items.length === 1
        ? getStripeObjectId(candidate.items[0]?.price ?? null)
        : null
      return priceId && priceId !== currentPriceId
    })
  if (!phase || phase.items.length !== 1) return null

  const [item] = phase.items
  const priceId = getStripeObjectId(item?.price ?? null)
  if (!priceId || (item?.quantity ?? 1) !== 1) return null

  return {
    scheduleId: schedule.id,
    priceId,
    effectiveAt: new Date(phase.start_date * 1000),
  }
}

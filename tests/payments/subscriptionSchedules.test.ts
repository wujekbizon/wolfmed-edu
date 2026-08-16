import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { getScheduledSubscriptionChange } from '@/helpers/getScheduledSubscriptionChange'
import { getStripeScheduleEventSubscriptionId } from '@/helpers/getStripeScheduleEventSubscriptionId'

const phase = (start: number, price: string, quantity = 1) => ({
  start_date: start,
  end_date: start + 2_592_000,
  items: [{ price, quantity }],
}) as Stripe.SubscriptionSchedule.Phase

const schedule = (overrides: Partial<Stripe.SubscriptionSchedule> = {}) => ({
  id: 'sub_sched_1',
  object: 'subscription_schedule',
  status: 'active',
  phases: [
    phase(1_786_742_400, 'price_premium'),
    phase(1_789_334_400, 'price_basic'),
  ],
  subscription: 'sub_1',
  released_subscription: null,
  ...overrides,
}) as Stripe.SubscriptionSchedule

test('future schedule phase becomes a pending price change', () => {
  const change = getScheduledSubscriptionChange(
    schedule(),
    'price_premium',
    new Date(1_789_334_400 * 1000)
  )
  assert.deepEqual(change, {
    scheduleId: 'sub_sched_1',
    priceId: 'price_basic',
    effectiveAt: new Date(1_789_334_400 * 1000),
  })
})

test('same-price and malformed future phases are ignored', () => {
  const periodEnd = new Date(1_789_334_400 * 1000)
  assert.equal(getScheduledSubscriptionChange(
    schedule({ phases: [phase(1_789_334_400, 'price_premium')] }),
    'price_premium',
    periodEnd
  ), null)
  assert.equal(getScheduledSubscriptionChange(
    schedule({ phases: [phase(1_789_334_400, 'price_basic', 2)] }),
    'price_premium',
    periodEnd
  ), null)
})

test('schedule events resolve active and released subscriptions', () => {
  const active = { data: { object: schedule() } } as Stripe.Event
  const released = { data: { object: schedule({
    subscription: null,
    released_subscription: 'sub_2',
  }) } } as Stripe.Event
  assert.equal(getStripeScheduleEventSubscriptionId(active), 'sub_1')
  assert.equal(getStripeScheduleEventSubscriptionId(released), 'sub_2')
})

import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { getScheduledSubscriptionChange } from '@/helpers/getScheduledSubscriptionChange'
import { getStripeScheduleEventSubscriptionId } from '@/helpers/getStripeScheduleEventSubscriptionId'
import { getSubscriptionDowngradePhases } from '@/helpers/getSubscriptionDowngradePhases'
import { isSubscriptionDowngrade } from '@/helpers/isSubscriptionDowngrade'
import { isSubscriptionUpgrade } from '@/helpers/isSubscriptionUpgrade'
import type { VerifiedPaymentOffer } from '@/types/paymentTypes'

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

test('downgrade schedule keeps Premium through renewal then releases from Basic', () => {
  const created = schedule({
    phases: [phase(1_786_742_400, 'price_premium')],
  })
  const phases = getSubscriptionDowngradePhases(
    created,
    'price_premium',
    'price_basic',
    new Date(1_789_334_400 * 1000)
  )

  assert.deepEqual(phases, [
    {
      start_date: 1_786_742_400,
      end_date: 1_789_334_400,
      items: [{ price: 'price_premium', quantity: 1 }],
    },
    {
      duration: { interval: 'month', interval_count: 1 },
      items: [{ price: 'price_basic', quantity: 1 }],
      proration_behavior: 'none',
    },
  ])
})

test('downgrade accepts separate Products only within the same course', () => {
  const current = {
    key: 'opiekun_premium_monthly',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'premium',
    amount: 4999,
    currency: 'pln',
    available: true,
    purchaseModel: 'subscription',
    entitlementSourceType: 'subscription',
    priceEnvName: 'STRIPE_OPIEKUN_PREMIUM_MONTHLY_PRICE_ID',
    priceId: 'price_premium',
    productId: 'prod_premium',
    taxBehavior: 'inclusive',
  } satisfies VerifiedPaymentOffer
  const target = {
    ...current,
    key: 'opiekun_basic_monthly',
    accessTier: 'basic',
    amount: 1999,
    priceEnvName: 'STRIPE_OPIEKUN_BASIC_MONTHLY_PRICE_ID',
    priceId: 'price_basic',
    productId: 'prod_basic',
  } satisfies VerifiedPaymentOffer

  assert.equal(isSubscriptionDowngrade(current, target), true)
  assert.equal(isSubscriptionUpgrade(target, current), true)
  assert.equal(isSubscriptionDowngrade(current, {
    ...target,
    courseSlug: 'pielegniarstwo',
  }), false)
  assert.equal(isSubscriptionDowngrade(current, {
    ...target,
    productId: current.productId,
  }), false)
  assert.equal(isSubscriptionUpgrade(target, {
    ...current,
    taxBehavior: 'exclusive',
  }), false)
})

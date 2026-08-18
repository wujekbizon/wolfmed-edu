import assert from 'node:assert/strict'
import test from 'node:test'
import Stripe from 'stripe'
import { PAYMENT_OFFER_KEYS, PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { isStripePriceValidForOffer } from '@/helpers/isStripePriceValidForOffer'
import { CreateCheckoutSchema } from '@/server/schema'

const stripePrice = (
  overrides: Partial<Stripe.Price> = {}
): Stripe.Price => ({
  active: true,
  currency: 'pln',
  lookup_key: 'opiekun_basic_lifetime',
  type: 'one_time',
  unit_amount: 15999,
  product: { active: true } as Stripe.Product,
  ...overrides,
} as Stripe.Price)

const recurringStripePrice = (
  overrides: Partial<Stripe.Price> = {}
): Stripe.Price => stripePrice({
  type: 'recurring',
  lookup_key: 'opiekun_basic_monthly',
  tax_behavior: 'inclusive',
  unit_amount: 1999,
  recurring: { interval: 'month' } as Stripe.Price.Recurring,
  ...overrides,
})

test('checkout accepts only known offer keys', () => {
  assert.equal(CreateCheckoutSchema.safeParse({
    offerKey: 'opiekun_basic_lifetime',
  }).success, true)
  assert.equal(CreateCheckoutSchema.safeParse({
    offerKey: 'attacker_price',
  }).success, false)
  assert.equal(CreateCheckoutSchema.safeParse({
    offerKey: 'opiekun_premium_upgrade',
  }).success, true)
})

test('every offer key resolves to matching server metadata', () => {
  for (const key of PAYMENT_OFFER_KEYS) {
    assert.equal(PAYMENT_OFFERS[key].key, key)
    assert.equal(PAYMENT_OFFERS[key].available, true)
  }

  assert.deepEqual(PAYMENT_OFFERS.opiekun_basic_lifetime, {
    key: 'opiekun_basic_lifetime',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'basic',
    amount: 15999,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_purchase',
    priceEnvName: 'STRIPE_OPIEKUN_STANDARD_PRICE_ID',
  })
  assert.deepEqual(PAYMENT_OFFERS.opiekun_premium_upgrade, {
    key: 'opiekun_premium_upgrade',
    courseSlug: 'opiekun-medyczny',
    accessTier: 'premium',
    amount: 29000,
    currency: 'pln',
    available: true,
    purchaseModel: 'lifetime',
    entitlementSourceType: 'lifetime_upgrade',
    priceEnvName: 'STRIPE_OPIEKUN_PREMIUM_UPGRADE_PRICE_ID',
  })
  assert.equal(PAYMENT_OFFERS.pielegniarstwo_premium_upgrade.amount, 32000)
  assert.equal(PAYMENT_OFFERS.opiekun_basic_monthly.amount, 1999)
  assert.equal(PAYMENT_OFFERS.opiekun_premium_monthly.amount, 4999)
  assert.equal(PAYMENT_OFFERS.pielegniarstwo_basic_monthly.amount, 4999)
  assert.equal(PAYMENT_OFFERS.pielegniarstwo_premium_monthly.amount, 7999)
})

test('configured recurring Price must be monthly and match the offer', () => {
  const offer = PAYMENT_OFFERS.opiekun_basic_monthly

  assert.equal(isStripePriceValidForOffer(recurringStripePrice(), offer), true)
  assert.equal(isStripePriceValidForOffer(recurringStripePrice({ unit_amount: 1 }), offer), false)
  assert.equal(isStripePriceValidForOffer(recurringStripePrice({ type: 'one_time' }), offer), false)
  assert.equal(isStripePriceValidForOffer(recurringStripePrice({ tax_behavior: 'unspecified' }), offer), false)
  assert.equal(isStripePriceValidForOffer(recurringStripePrice({ lookup_key: 'wrong' }), offer), false)
  assert.equal(isStripePriceValidForOffer(recurringStripePrice({
    recurring: { interval: 'year' } as Stripe.Price.Recurring,
  }), offer), false)
})

test('configured Stripe Price must match active one-time offer', () => {
  const offer = PAYMENT_OFFERS.opiekun_basic_lifetime

  assert.equal(isStripePriceValidForOffer(stripePrice(), offer), true)
  assert.equal(isStripePriceValidForOffer(stripePrice({ active: false }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ currency: 'eur' }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ unit_amount: 1 }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ type: 'recurring' }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ lookup_key: null }), offer), true)
  assert.equal(
    isStripePriceValidForOffer(stripePrice({ product: { active: false } as Stripe.Product }), offer),
    false
  )
})

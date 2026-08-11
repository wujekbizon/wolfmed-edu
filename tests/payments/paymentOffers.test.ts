import assert from 'node:assert/strict'
import test from 'node:test'
import Stripe from 'stripe'
import { PAYMENT_OFFER_KEYS, PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { isStripePriceValidForOffer } from '@/helpers/isStripePriceValidForOffer'
import { CheckoutSessionIdSchema, CreateCheckoutSchema } from '@/server/schema'
import { getCanceledReturnHref } from '@/helpers/getCanceledReturnHref'
import { isStripeInvalidRequestError } from '@/helpers/isStripeInvalidRequestError'
import { isMissingStripeCustomer } from '@/helpers/isMissingStripeCustomer'

const stripePrice = (
  overrides: Partial<Stripe.Price> = {}
): Stripe.Price => ({
  active: true,
  currency: 'pln',
  type: 'one_time',
  unit_amount: 15999,
  product: { active: true } as Stripe.Product,
  ...overrides,
} as Stripe.Price)

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

test('success accepts only Stripe Checkout Session IDs', () => {
  assert.equal(CheckoutSessionIdSchema.safeParse('cs_test_abc123').success, true)
  assert.equal(CheckoutSessionIdSchema.safeParse('pi_test_abc123').success, false)
  assert.equal(CheckoutSessionIdSchema.safeParse(['cs_test_abc123']).success, false)
})

test('Stripe Session request errors are invalid, not temporary outages', () => {
  const missing = new Stripe.errors.StripeInvalidRequestError({
    type: 'invalid_request_error',
    code: 'resource_missing',
    message: 'No such checkout.session',
  })
  const malformed = new Stripe.errors.StripeInvalidRequestError({
    type: 'invalid_request_error',
    message: 'Invalid checkout.session ID',
  })

  assert.equal(isStripeInvalidRequestError(missing), true)
  assert.equal(isStripeInvalidRequestError(malformed), true)
  assert.equal(isStripeInvalidRequestError(new Error('Network unavailable')), false)
})

test('missing or deleted Stripe Customers require replacement', () => {
  const missing = new Stripe.errors.StripeInvalidRequestError({
    message: 'No such customer',
    type: 'invalid_request_error',
    code: 'resource_missing',
  })
  const otherError = new Stripe.errors.StripeInvalidRequestError({
    message: 'Bad request',
    type: 'invalid_request_error',
    code: 'parameter_invalid_empty',
  })

  assert.equal(isMissingStripeCustomer(missing), true)
  assert.equal(isMissingStripeCustomer({ id: 'cus_deleted', deleted: true }), true)
  assert.equal(isMissingStripeCustomer({ id: 'cus_active' }), false)
  assert.equal(isMissingStripeCustomer(otherError), false)
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
    entitlementSourceType: 'lifetime_upgrade',
    priceEnvName: 'STRIPE_OPIEKUN_PREMIUM_UPGRADE_PRICE_ID',
  })
  assert.equal(PAYMENT_OFFERS.pielegniarstwo_premium_upgrade.amount, 32000)
})

test('configured Stripe Price must match active one-time offer', () => {
  const offer = PAYMENT_OFFERS.opiekun_basic_lifetime

  assert.equal(isStripePriceValidForOffer(stripePrice(), offer), true)
  assert.equal(isStripePriceValidForOffer(stripePrice({ active: false }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ currency: 'eur' }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ unit_amount: 1 }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ type: 'recurring' }), offer), false)
  assert.equal(
    isStripePriceValidForOffer(stripePrice({ product: { active: false } as Stripe.Product }), offer),
    false
  )
})

test('canceled checkout returns only to a known course offer', () => {
  assert.equal(
    getCanceledReturnHref('opiekun-medyczny'),
    '/kierunki/opiekun-medyczny#cennik'
  )
  assert.equal(
    getCanceledReturnHref('pielegniarstwo'),
    '/kierunki/pielegniarstwo#cennik'
  )
  assert.equal(getCanceledReturnHref('https://attacker.example'), '/kierunki')
  assert.equal(getCanceledReturnHref(['opiekun-medyczny']), '/kierunki')
})

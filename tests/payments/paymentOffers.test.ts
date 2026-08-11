import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { PAYMENT_OFFER_KEYS, PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { isStripePriceValidForOffer } from '@/helpers/isStripePriceValidForOffer'
import { CreateCheckoutSchema } from '@/server/schema'
import { getCanceledReturnHref } from '@/helpers/getCanceledReturnHref'

const stripePrice = (
  overrides: Partial<Stripe.Price> = {}
): Stripe.Price => ({
  active: true,
  currency: 'pln',
  type: 'one_time',
  unit_amount: 15999,
  ...overrides,
} as Stripe.Price)

test('checkout accepts only known offer keys', () => {
  assert.equal(CreateCheckoutSchema.safeParse({
    offerKey: 'opiekun_basic_lifetime',
  }).success, true)
  assert.equal(CreateCheckoutSchema.safeParse({
    offerKey: 'attacker_price',
  }).success, false)
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
    priceEnvName: 'STRIPE_OPIEKUN_STANDARD_PRICE_ID',
  })
})

test('configured Stripe Price must match active one-time offer', () => {
  const offer = PAYMENT_OFFERS.opiekun_basic_lifetime

  assert.equal(isStripePriceValidForOffer(stripePrice(), offer), true)
  assert.equal(isStripePriceValidForOffer(stripePrice({ active: false }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ currency: 'eur' }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ unit_amount: 1 }), offer), false)
  assert.equal(isStripePriceValidForOffer(stripePrice({ type: 'recurring' }), offer), false)
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

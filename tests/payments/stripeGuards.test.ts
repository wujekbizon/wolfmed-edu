import assert from 'node:assert/strict'
import test from 'node:test'
import Stripe from 'stripe'
import { getCanceledReturnHref } from '@/helpers/getCanceledReturnHref'
import { getStripeEventSubscriptionId } from '@/helpers/getStripeEventSubscriptionId'
import { isMissingStripeCustomer } from '@/helpers/isMissingStripeCustomer'
import { isStripeInvalidRequestError } from '@/helpers/isStripeInvalidRequestError'
import { CheckoutSessionIdSchema } from '@/server/schema'

test('success accepts only Stripe Checkout Session IDs', () => {
  assert.equal(CheckoutSessionIdSchema.safeParse('cs_test_abc123').success, true)
  assert.equal(CheckoutSessionIdSchema.safeParse('pi_test_abc123').success, false)
  assert.equal(CheckoutSessionIdSchema.safeParse(['cs_test_abc123']).success, false)
})

test('Stripe request errors are distinguished from outages', () => {
  const missing = new Stripe.errors.StripeInvalidRequestError({
    type: 'invalid_request_error',
    code: 'resource_missing',
    message: 'No such checkout.session',
  })
  assert.equal(isStripeInvalidRequestError(missing), true)
  assert.equal(isStripeInvalidRequestError(new Error('Network unavailable')), false)
})

test('missing or deleted Stripe Customers require replacement', () => {
  const missing = new Stripe.errors.StripeInvalidRequestError({
    message: 'No such customer',
    type: 'invalid_request_error',
    code: 'resource_missing',
  })
  assert.equal(isMissingStripeCustomer(missing), true)
  assert.equal(isMissingStripeCustomer({ id: 'cus_deleted', deleted: true }), true)
  assert.equal(isMissingStripeCustomer({ id: 'cus_active' }), false)
})

test('canceled checkout returns only to a known course offer', () => {
  assert.equal(getCanceledReturnHref('opiekun-medyczny'), '/kierunki/opiekun-medyczny#cennik')
  assert.equal(getCanceledReturnHref('pielegniarstwo'), '/kierunki/pielegniarstwo#cennik')
  assert.equal(getCanceledReturnHref('https://attacker.example'), '/kierunki')
})

test('only subscription-backed invoice events enter subscription processing', () => {
  const subscriptionInvoice = {
    type: 'invoice.paid',
    data: {
      object: {
        parent: {
          subscription_details: { subscription: 'sub_123' },
        },
      },
    },
  } as unknown as Stripe.Event
  const lifetimeInvoice = {
    type: 'invoice.paid',
    data: { object: { parent: null } },
  } as unknown as Stripe.Event

  assert.equal(getStripeEventSubscriptionId(subscriptionInvoice), 'sub_123')
  assert.equal(getStripeEventSubscriptionId(lifetimeInvoice), null)
})

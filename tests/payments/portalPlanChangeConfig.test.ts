import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { isPortalPlanChangeConfigured } from '@/helpers/isPortalPlanChangeConfigured'

const configuration = (
  conditions: Array<{ type: 'decreasing_item_amount' | 'shortening_interval' }>
) => ({
  features: {
    subscription_update: {
      enabled: true,
      default_allowed_updates: ['price'],
      billing_cycle_anchor: 'unchanged',
      proration_behavior: 'always_invoice',
      schedule_at_period_end: { conditions },
      products: [{
        product: 'prod_course',
        prices: ['price_basic', 'price_premium'],
        adjustable_quantity: { enabled: false, minimum: 1, maximum: 1 },
      }],
    },
  },
}) as Stripe.BillingPortal.Configuration

test('course Portal supports immediate upgrade and scheduled downgrade', () => {
  const configured = configuration([{ type: 'decreasing_item_amount' }])
  assert.equal(isPortalPlanChangeConfigured(
    configured,
    'prod_course',
    'price_basic',
    'price_premium',
    false
  ), true)
  assert.equal(isPortalPlanChangeConfigured(
    configured,
    'prod_course',
    'price_premium',
    'price_basic',
    true
  ), true)
})

test('downgrade requires Stripe period-end scheduling', () => {
  assert.equal(isPortalPlanChangeConfigured(
    configuration([]),
    'prod_course',
    'price_premium',
    'price_basic',
    true
  ), false)
})

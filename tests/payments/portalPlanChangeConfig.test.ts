import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { isPortalSubscriptionUpgradeConfigured } from '@/helpers/isPortalSubscriptionUpgradeConfigured'

const configuration = (
  products: Stripe.BillingPortal.Configuration.Features.SubscriptionUpdate.Product[]
) => ({
  active: true,
  features: {
    subscription_update: {
      enabled: true,
      default_allowed_updates: ['price'],
      billing_cycle_anchor: 'unchanged',
      proration_behavior: 'always_invoice',
      schedule_at_period_end: { conditions: [] },
      products,
    },
  },
}) as unknown as Stripe.BillingPortal.Configuration

const product = (id: string, price: string) => ({
  product: id,
  prices: [price],
  adjustable_quantity: { enabled: false, minimum: 1, maximum: 1 },
})

test('course Portal supports a cross-Product immediate upgrade', () => {
  assert.equal(isPortalSubscriptionUpgradeConfigured(
    configuration([
      product('prod_basic', 'price_basic'),
      product('prod_premium', 'price_premium'),
    ]),
    'prod_basic',
    'price_basic',
    'prod_premium',
    'price_premium',
  ), true)
})

test('upgrade rejects same-Product and extra catalog entries', () => {
  const sameProduct = configuration([{
    ...product('prod_course', 'price_basic'),
    prices: ['price_basic', 'price_premium'],
  }])
  const extraProduct = configuration([
    product('prod_basic', 'price_basic'),
    product('prod_premium', 'price_premium'),
    product('prod_other', 'price_other'),
  ])

  assert.equal(isPortalSubscriptionUpgradeConfigured(
    sameProduct,
    'prod_course',
    'price_basic',
    'prod_course',
    'price_premium'
  ), false)
  assert.equal(isPortalSubscriptionUpgradeConfigured(
    extraProduct,
    'prod_basic',
    'price_basic',
    'prod_premium',
    'price_premium',
  ), false)
})

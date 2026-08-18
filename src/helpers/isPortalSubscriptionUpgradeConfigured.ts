import type Stripe from 'stripe'

export function isPortalSubscriptionUpgradeConfigured(
  configuration: Stripe.BillingPortal.Configuration,
  currentProductId: string,
  currentPriceId: string,
  targetProductId: string,
  targetPriceId: string
): boolean {
  const update = configuration.features.subscription_update
  const currentProduct = update.products?.find(
    (candidate) => candidate.product === currentProductId
  )
  const targetProduct = update.products?.find(
    (candidate) => candidate.product === targetProductId
  )

  return Boolean(
    configuration.active &&
    update.enabled &&
    update.default_allowed_updates.length === 1 &&
    update.default_allowed_updates[0] === 'price' &&
    (update.billing_cycle_anchor === null || update.billing_cycle_anchor === 'unchanged') &&
    update.proration_behavior === 'always_invoice' &&
    update.products?.length === 2 &&
    currentProductId !== targetProductId &&
    currentProduct &&
    !currentProduct.adjustable_quantity.enabled &&
    currentProduct.prices.length === 1 &&
    currentProduct.prices.includes(currentPriceId) &&
    targetProduct &&
    !targetProduct.adjustable_quantity.enabled &&
    targetProduct.prices.length === 1 &&
    targetProduct.prices.includes(targetPriceId)
  )
}

import type Stripe from 'stripe'

export function isPortalPlanChangeConfigured(
  configuration: Stripe.BillingPortal.Configuration,
  productId: string,
  currentPriceId: string,
  targetPriceId: string,
  downgrade: boolean
): boolean {
  const update = configuration.features.subscription_update
  const product = update.products?.find((candidate) => candidate.product === productId)
  const schedulesDowngrades = update.schedule_at_period_end.conditions.some(
    (condition) => condition.type === 'decreasing_item_amount'
  )

  return Boolean(
    update.enabled &&
    update.default_allowed_updates.includes('price') &&
    (update.billing_cycle_anchor === null || update.billing_cycle_anchor === 'unchanged') &&
    update.proration_behavior === 'always_invoice' &&
    product &&
    !product.adjustable_quantity.enabled &&
    product.prices.includes(currentPriceId) &&
    product.prices.includes(targetPriceId) &&
    (!downgrade || schedulesDowngrades)
  )
}

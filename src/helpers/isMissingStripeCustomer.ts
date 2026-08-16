import Stripe from 'stripe'

export function isMissingStripeCustomer(value: unknown): boolean {
  if (value instanceof Stripe.errors.StripeInvalidRequestError) {
    return value.code === 'resource_missing'
  }

  return (
    typeof value === 'object' &&
    value !== null &&
    'deleted' in value &&
    value.deleted === true
  )
}

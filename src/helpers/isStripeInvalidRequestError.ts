import Stripe from 'stripe'

export function isStripeInvalidRequestError(error: unknown): boolean {
  return error instanceof Stripe.errors.StripeInvalidRequestError
}

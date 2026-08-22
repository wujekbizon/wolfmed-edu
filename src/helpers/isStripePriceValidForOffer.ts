import type Stripe from 'stripe'
import type { PaymentOffer } from '@/types/paymentTypes'

export function isStripePriceValidForOffer(
  price: Stripe.Price,
  offer: PaymentOffer
): boolean {
  const product = price.product
  const productIsActive =
    typeof product !== 'string' &&
    !('deleted' in product) &&
    product.active
  const recurringIsValid = offer.purchaseModel === 'subscription'
    ? price.type === 'recurring' &&
      price.recurring?.interval === 'month' &&
      ['exclusive', 'inclusive'].includes(price.tax_behavior ?? '')
    : price.type === 'one_time'
  const lookupKeyIsValid = offer.purchaseModel !== 'subscription' ||
    price.lookup_key === offer.key

  return (
    productIsActive &&
    price.active &&
    recurringIsValid &&
    lookupKeyIsValid &&
    price.currency === offer.currency &&
    price.unit_amount === offer.amount
  )
}

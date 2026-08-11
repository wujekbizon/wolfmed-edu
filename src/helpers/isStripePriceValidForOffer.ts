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

  return (
    productIsActive &&
    price.active &&
    price.type === 'one_time' &&
    price.currency === offer.currency &&
    price.unit_amount === offer.amount
  )
}

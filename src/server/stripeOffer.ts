import 'server-only'
import stripe from '@/lib/stripeClient'
import { PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { isStripePriceValidForOffer } from '@/helpers/isStripePriceValidForOffer'
import type { PaymentOfferKey } from '@/types/paymentTypes'

export async function getVerifiedStripeOffer(offerKey: PaymentOfferKey) {
  const offer = PAYMENT_OFFERS[offerKey]
  if (!offer.available) {
    throw new Error(`Unavailable payment offer: ${offerKey}`)
  }

  const priceId = process.env[offer.priceEnvName]

  if (!priceId) {
    throw new Error(`Missing Stripe Price: ${offer.priceEnvName}`)
  }

  const price = await stripe.prices.retrieve(priceId)
  if (!isStripePriceValidForOffer(price, offer)) {
    throw new Error(`Invalid Stripe Price configuration: ${offer.priceEnvName}`)
  }

  return { ...offer, priceId }
}

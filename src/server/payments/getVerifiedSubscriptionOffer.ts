import 'server-only'
import { PAYMENT_OFFER_KEYS, PAYMENT_OFFERS } from '@/constants/paymentOffers'
import { getVerifiedStripeOffer } from '@/server/stripeOffer'

export async function getVerifiedSubscriptionOffer(priceId: string) {
  const key = PAYMENT_OFFER_KEYS.find((offerKey) => {
    const offer = PAYMENT_OFFERS[offerKey]
    return offer.purchaseModel === 'subscription' && process.env[offer.priceEnvName] === priceId
  })
  if (!key) throw new Error(`Unknown subscription Price ${priceId}`)

  return getVerifiedStripeOffer(key)
}

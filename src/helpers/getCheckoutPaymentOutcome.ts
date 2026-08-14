import type {
  CheckoutPurchaseModel,
  PaymentOffer,
  PaymentResultOutcome,
} from '@/types/paymentTypes'

export function getCheckoutPaymentOutcome(
  purchaseModel: CheckoutPurchaseModel,
  sourceType: PaymentOffer['entitlementSourceType']
): PaymentResultOutcome {
  if (sourceType === 'lifetime_upgrade') return 'lifetime_upgrade'
  return purchaseModel === 'subscription'
    ? 'subscription_purchase'
    : 'lifetime_purchase'
}

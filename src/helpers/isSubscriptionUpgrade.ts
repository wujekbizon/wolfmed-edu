import type { VerifiedPaymentOffer } from '@/types/paymentTypes'

export function isSubscriptionUpgrade(
  currentOffer: VerifiedPaymentOffer,
  targetOffer: VerifiedPaymentOffer
): boolean {
  return (
    currentOffer.purchaseModel === 'subscription' &&
    targetOffer.purchaseModel === 'subscription' &&
    currentOffer.courseSlug === targetOffer.courseSlug &&
    currentOffer.accessTier === 'basic' &&
    targetOffer.accessTier === 'premium' &&
    currentOffer.currency === targetOffer.currency &&
    currentOffer.amount < targetOffer.amount &&
    currentOffer.productId !== targetOffer.productId &&
    currentOffer.taxBehavior !== null &&
    currentOffer.taxBehavior !== 'unspecified' &&
    currentOffer.taxBehavior === targetOffer.taxBehavior
  )
}

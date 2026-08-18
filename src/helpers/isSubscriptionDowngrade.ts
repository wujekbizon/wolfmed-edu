import type { VerifiedPaymentOffer } from '@/types/paymentTypes'

export function isSubscriptionDowngrade(
  currentOffer: VerifiedPaymentOffer,
  targetOffer: VerifiedPaymentOffer
): boolean {
  return (
    currentOffer.purchaseModel === 'subscription' &&
    targetOffer.purchaseModel === 'subscription' &&
    currentOffer.courseSlug === targetOffer.courseSlug &&
    currentOffer.accessTier === 'premium' &&
    targetOffer.accessTier === 'basic' &&
    currentOffer.currency === targetOffer.currency &&
    currentOffer.amount > targetOffer.amount &&
    currentOffer.productId !== targetOffer.productId &&
    currentOffer.taxBehavior !== null &&
    currentOffer.taxBehavior !== 'unspecified' &&
    currentOffer.taxBehavior === targetOffer.taxBehavior
  )
}

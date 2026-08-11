import type { CheckoutPurchaseModel } from '@/types/paymentTypes'

export function getCheckoutOrderDeduplicationKey(
  userId: string,
  courseSlug: string,
  purchaseModel: CheckoutPurchaseModel
): string {
  return `${userId}:${courseSlug}:${purchaseModel}`
}

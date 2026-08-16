import 'server-only'
import { getVerifiedSubscriptionOffer } from '@/server/payments/getVerifiedSubscriptionOffer'
import type {
  SubscriptionSnapshot,
  VerifiedPaymentOffer,
  VerifiedScheduledSubscriptionChange,
} from '@/types/paymentTypes'

export async function getVerifiedScheduledSubscriptionChange(
  snapshot: SubscriptionSnapshot,
  currentOffer: VerifiedPaymentOffer
): Promise<VerifiedScheduledSubscriptionChange | null> {
  if (!snapshot.scheduledChange) return null

  const offer = await getVerifiedSubscriptionOffer(snapshot.scheduledChange.priceId)
  if (
    currentOffer.accessTier !== 'premium' ||
    offer.accessTier !== 'basic' ||
    offer.courseSlug !== currentOffer.courseSlug ||
    offer.productId !== currentOffer.productId
  ) {
    throw new Error(`Subscription ${snapshot.id} has an invalid scheduled change`)
  }

  return { ...snapshot.scheduledChange, offer }
}

import PaymentResultCard from '@/components/payments/PaymentResultCard'
import { requireUser } from '@/helpers/requireUser'
import { getVerifiedCheckoutResult } from '@/server/payments/getVerifiedCheckoutResult'
import { getVerifiedSubscriptionUpgradeResult } from '@/server/payments/getVerifiedSubscriptionUpgradeResult'
import { CheckoutSessionIdSchema, SubscriptionIdSchema } from '@/server/schema'
import type { SuccessSearchParams } from '@/types/paymentTypes'

export default async function VerifiedPaymentResult({
  searchParams,
}: {
  searchParams: SuccessSearchParams
}) {
  const [{ session_id: sessionId, subscription_id: subscriptionId }, { userId }] = await Promise.all([
    searchParams,
    requireUser(),
  ])
  const checkoutSession = CheckoutSessionIdSchema.safeParse(sessionId)
  const subscription = SubscriptionIdSchema.safeParse(subscriptionId)

  if (checkoutSession.success) {
    const result = await getVerifiedCheckoutResult(userId, checkoutSession.data)

    return (
      <PaymentResultCard
        result={result}
        retryHref={`/success?session_id=${encodeURIComponent(checkoutSession.data)}`}
      />
    )
  }

  if (!subscription.success) {
    return (
      <PaymentResultCard
        result={{ status: 'invalid' }}
        retryHref="/kierunki"
      />
    )
  }

  const result = await getVerifiedSubscriptionUpgradeResult(
    userId,
    subscription.data
  )

  return (
    <PaymentResultCard
      result={result}
      retryHref={`/success?subscription_id=${encodeURIComponent(subscription.data)}`}
    />
  )
}

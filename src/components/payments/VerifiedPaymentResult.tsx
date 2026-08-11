import PaymentResultCard from '@/components/payments/PaymentResultCard'
import { requireUser } from '@/helpers/requireUser'
import { getVerifiedCheckoutResult } from '@/server/payments/getVerifiedCheckoutResult'
import { CheckoutSessionIdSchema } from '@/server/schema'
import type { SuccessSearchParams } from '@/types/paymentTypes'

export default async function VerifiedPaymentResult({
  searchParams,
}: {
  searchParams: SuccessSearchParams
}) {
  const [{ session_id: sessionId }, { userId }] = await Promise.all([
    searchParams,
    requireUser(),
  ])
  const parsed = CheckoutSessionIdSchema.safeParse(sessionId)

  if (!parsed.success) {
    return (
      <PaymentResultCard
        result={{ status: 'invalid' }}
        retryHref="/kierunki"
      />
    )
  }

  const result = await getVerifiedCheckoutResult(userId, parsed.data)

  return (
    <PaymentResultCard
      result={result}
      retryHref={`/success?session_id=${encodeURIComponent(parsed.data)}`}
    />
  )
}

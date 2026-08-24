import { Suspense } from 'react'
import VerifiedPaymentResult from '@/components/payments/VerifiedPaymentResult'
import PaymentResultSkeleton from '@/components/skeletons/PaymentResultSkeleton'
import type { SuccessSearchParams } from '@/types/paymentTypes'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function SuccessPage({
  searchParams,
}: {
  searchParams: SuccessSearchParams
}) {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <VerifiedPaymentResult searchParams={searchParams} />
    </Suspense>
  )
}

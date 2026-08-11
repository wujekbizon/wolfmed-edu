import { Suspense } from 'react'
import VerifiedPaymentResult from '@/components/payments/VerifiedPaymentResult'
import PaymentResultSkeleton from '@/components/skeletons/PaymentResultSkeleton'
import type { SuccessSearchParams } from '@/types/paymentTypes'

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

import { Suspense } from 'react'
import CanceledPayment from '@/components/payments/CanceledPayment'
import PaymentResultSkeleton from '@/components/skeletons/PaymentResultSkeleton'

export default function CanceledPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string | string[]; order?: string | string[] }>
}) {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <CanceledPayment searchParams={searchParams} />
    </Suspense>
  )
}

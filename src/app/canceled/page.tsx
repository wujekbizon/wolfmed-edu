import { Suspense } from 'react'
import CanceledPayment from '@/components/payments/CanceledPayment'
import PaymentResultSkeleton from '@/components/skeletons/PaymentResultSkeleton'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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

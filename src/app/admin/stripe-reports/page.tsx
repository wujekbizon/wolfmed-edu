import { Suspense } from 'react'
import StripeReportContent from '@/components/admin/stripe-reports/StripeReportContent'
import StripeReportSkeleton from '@/components/skeletons/StripeReportSkeleton'
import type { StripeReportPageProps } from '@/types/stripeReportTypes'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Raporty Stripe | Wolfmed' }

export default function StripeReportsPage(props: StripeReportPageProps) {
  return (
    <Suspense fallback={<StripeReportSkeleton />}>
      <StripeReportContent {...props} />
    </Suspense>
  )
}

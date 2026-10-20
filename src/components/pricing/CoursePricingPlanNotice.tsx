import Link from 'next/link'
import { formatPlDate } from '@/helpers/formatPlDate'
import type { CoursePricingPlanNoticeProps } from '@/types/paymentTypes'

export default function CoursePricingPlanNotice({
  offerStatus,
  subscriptionPlanChange,
}: CoursePricingPlanNoticeProps) {
  if (offerStatus === 'portal_upgrade') {
    return (
      <p className="mt-2 text-center text-xs text-slate-500">
        Stripe pokaże rozliczenie proporcjonalne przed potwierdzeniem.
      </p>
    )
  }
  if (offerStatus === 'downgrade_available') {
    return (
      <p className="mt-2 text-center text-xs text-slate-500">
        Premium pozostanie aktywny do końca opłaconego okresu.
      </p>
    )
  }
  if (offerStatus !== 'scheduled_downgrade' || !subscriptionPlanChange) return null

  return (
    <p className="mt-2 text-center text-xs text-slate-500">
      Basic od {formatPlDate(subscriptionPlanChange.effectiveAt)}.{' '}
      <Link className="font-medium underline" href="/panel#platnosci">
        Zarządzaj zmianą
      </Link>
    </p>
  )
}

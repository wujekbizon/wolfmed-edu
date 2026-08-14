import { PAYMENT_COURSE_TITLES } from '@/constants/paymentResult'
import { formatPlDate } from '@/helpers/formatPlDate'
import { formatSubscriptionStatus } from '@/helpers/formatSubscriptionStatus'
import { getSubscriptionBillingDate } from '@/helpers/getSubscriptionBillingDate'
import type { BillingSummaryListProps } from '@/types/billingTypes'

export default function BillingSummaryList({ overview }: BillingSummaryListProps) {
  if (overview.subscriptions.length === 0 && overview.lifetime.length === 0) {
    return <p className="text-sm text-zinc-500">Brak zakupów.</p>
  }

  return (
    <div className="space-y-3">
      {overview.lifetime.map((item) => (
        <p key={`lifetime-${item.courseSlug}`} className="text-sm text-zinc-600">
          {PAYMENT_COURSE_TITLES[item.courseSlug]} ·{' '}
          {item.accessTier === 'premium' ? 'Premium' : 'Basic'} · dostęp na zawsze
        </p>
      ))}
      {overview.subscriptions.map((item) => {
        const billingDate = getSubscriptionBillingDate(item)
        return (
          <p key={`subscription-${item.courseSlug}`} className="text-sm text-zinc-600">
            {PAYMENT_COURSE_TITLES[item.courseSlug]} ·{' '}
            {item.accessTier === 'premium' ? 'Premium' : 'Basic'} ·{' '}
            {formatSubscriptionStatus(item.status)}
            {billingDate && (
              <> · {billingDate.label} {formatPlDate(billingDate.date)}</>
            )}
          </p>
        )
      })}
    </div>
  )
}

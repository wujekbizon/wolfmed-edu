import CancelScheduledDowngradeButton from '@/components/billing/CancelScheduledDowngradeButton'
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
        const pendingOfferKey = item.pendingOfferKey
        const pendingChangeAt = item.pendingChangeAt
        const hasScheduledDowngrade = pendingOfferKey &&
          item.pendingAccessTier === 'basic' && pendingChangeAt
        return (
          <div key={`subscription-${item.courseSlug}`} className="space-y-3">
            <p className="text-sm text-zinc-600">
              {PAYMENT_COURSE_TITLES[item.courseSlug]} ·{' '}
              {item.accessTier === 'premium' ? 'Premium' : 'Basic'} ·{' '}
              {formatSubscriptionStatus(item.status)}
              {billingDate && (
                <> · {billingDate.label} {formatPlDate(billingDate.date)}</>
              )}
            </p>
            {hasScheduledDowngrade && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-950">
                  Zaplanowana zmiana na Basic: {formatPlDate(pendingChangeAt)}
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Premium pozostaje aktywny do tego dnia.
                </p>
                <CancelScheduledDowngradeButton offerKey={pendingOfferKey} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

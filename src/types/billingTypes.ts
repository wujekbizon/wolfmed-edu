import type { PaymentOffer, PaymentOfferKey } from '@/types/paymentTypes'

export type BillingSubscription = {
  courseSlug: PaymentOffer['courseSlug']
  accessTier: PaymentOffer['accessTier']
  status: string
  currentPeriodEnd: Date | null
  pendingOfferKey: PaymentOfferKey | null
  pendingAccessTier: PaymentOffer['accessTier'] | null
  pendingChangeAt: Date | null
  cancelAtPeriodEnd: boolean
  cancelAt: Date | null
}

export type BillingDateSummary = {
  date: Date
  label: 'dostęp do' | 'odnowienie'
}

export type BillingLifetime = {
  courseSlug: PaymentOffer['courseSlug']
  accessTier: PaymentOffer['accessTier']
}

export type BillingOverview = {
  subscriptions: BillingSubscription[]
  lifetime: BillingLifetime[]
}

export type BillingSummaryListProps = {
  overview: BillingOverview
}

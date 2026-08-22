interface BasePayment {
  userId: string
  amountTotal: number
  currency: 'pln' | 'usd' | 'eur' | null
  customerEmail: string | null
  paymentStatus: string
  courseSlug?: string | null
  createdAt: Date
}

export interface Subscription extends BasePayment {
  sessionId: string | null
  customerId: string
  invoiceId: string | null
  subscriptionId: string
  offerKey?: string | null
  accessTier?: string | null
  priceId?: string | null
  status?: string
  currentPeriodStart?: Date | null
  currentPeriodEnd?: Date | null
  cancelAtPeriodEnd?: boolean
}

export interface Payment extends BasePayment {
  orderId?: string | null
  offerKey?: string | null
  accessTier?: string | null
  stripeCustomerId?: string | null
  sessionId?: string | null
  paymentIntentId?: string | null
  invoiceId?: string | null
}

export type Supporter = {
  id: string
  userId: string
  username: string
}

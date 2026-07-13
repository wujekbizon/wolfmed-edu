interface BasePayment {
  userId: string
  amountTotal: number
  currency: 'pln' | 'usd' | 'eur' | null
  customerEmail: string
  paymentStatus: string
  courseSlug?: string | null
  createdAt: Date
}

export interface Subscription extends BasePayment {
  sessionId: string
  customerId: string
  invoiceId: string
  subscriptionId: string
}

export interface Payment extends BasePayment {
  stripeCustomerId?: string | null
  sessionId?: string | null
  paymentIntentId?: string | null
}

export type Supporter = {
  id: string
  userId: string
  username: string
}

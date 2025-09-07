interface BasePayment {
  userId: string
  amountTotal: number
  currency: 'pln' | 'usd' | 'eur' | null
  customerEmail: string
  paymentStatus: string
  createdAt: Date
}

export interface Subscription extends BasePayment {
  sessionId: string
  customerId: string
  invoiceId: string
  subscriptionId: string
}

export interface Payment extends BasePayment {}

export type Supporter = {
  id: string
  userId: string
  username: string
}

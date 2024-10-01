interface BasePayment {
  userId: string
  amountTotal: number
  currency: 'pln' | 'usd' | 'eur'
  customerEmail: string
  paymentStatus: string
  createdAt: number
}

export interface Subscription extends BasePayment {
  sessionId: string
  customerId: string
  invoiceId: string
  subscriptionId: string
}

export interface Payment extends BasePayment {}

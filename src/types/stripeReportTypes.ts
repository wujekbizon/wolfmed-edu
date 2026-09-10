import type Stripe from 'stripe'

export type StripeReportPeriod = { month: string; start: number; end: number; label: string }
export type StripeReportPageProps = {
  searchParams: Promise<{
    month?: string | string[]
    gmail?: string | string[]
  }>
}
export type StripeReportIdentity = {
  name: string
  email: string
  address: string
  missingAddress: boolean
  sources: string
  taxIds: string
}
export type StripeReportInvoice = {
  id: string
  number: string
  currency: string
  total: number
  tax: number
  pdf: string | null
}
export type StripeReportBilling = StripeReportIdentity & { invoices: StripeReportInvoice[] }
export type StripeReportRow = StripeReportBilling & {
  id: string
  chargeId: string
  paymentIntentId: string | null
  customerId: string | null
  date: number
  kind: 'payment' | 'refund'
  amount: number
  currency: string
  fee: number
  net: number
  originalAmount: number
  originalCurrency: string
  exchangeRate: number | null
  method: string
  status: string
  included: boolean
  disputed: boolean
}
export type StripeReportTotal = {
  currency: string
  count: number
  payments: number
  refunds: number
}
export type StripeReport = {
  period: StripeReportPeriod
  generatedAt: number
  livemode: boolean
  rows: StripeReportRow[]
  totals: StripeReportTotal[]
  missingAddresses: number
  fingerprint: string
}
export type StripeReportSource = {
  transaction: Stripe.BalanceTransaction
  charge: Stripe.Charge
  refund: Stripe.Refund | null
}
export type StripeReportReader = {
  source: (transaction: Stripe.BalanceTransaction) => Promise<StripeReportSource>
  billing: (charge: Stripe.Charge) => Promise<StripeReportBilling>
}
export type StripeReportPdfSecurity = {
  userPassword: string
  ownerPassword: string
}

import type Stripe from 'stripe'
import type { StripeReportBilling, StripeReportSource } from '@/types/stripeReportTypes'

export const reportCharge = {
  id: 'ch_fixture', object: 'charge', created: 1, amount: 15999, amount_captured: 15999,
  amount_refunded: 0, currency: 'pln', paid: true, captured: true,
  status: 'succeeded', customer: null, payment_intent: null, disputed: false,
  billing_details: { name: 'Żaneta Łącka', email: 'fixture@example.com', address: null },
  payment_method_details: { type: 'blik' }, receipt_email: null, livemode: false,
} as Stripe.Charge

export const reportBilling: StripeReportBilling = {
  name: 'Żaneta Łącka', email: 'fixture@example.com', address: '',
  missingAddress: true, sources: 'Płatność', taxIds: '', invoices: [],
}

export const reportSource: StripeReportSource = {
  charge: reportCharge, refund: null,
  transaction: {
    id: 'txn_fixture', object: 'balance_transaction', type: 'payment',
    created: 1785542400, amount: 15999, currency: 'pln', fee: 199, net: 15800,
    exchange_rate: null, source: reportCharge,
  } as Stripe.BalanceTransaction,
}

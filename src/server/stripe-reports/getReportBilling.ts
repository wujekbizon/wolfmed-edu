import 'server-only'
import type Stripe from 'stripe'
import stripe from '@/lib/stripeClient'
import { STRIPE_REPORT_REQUEST_OPTIONS } from '@/constants/stripeReports'
import { getStripeObjectId } from '@/helpers/getStripeObjectId'
import { resolveStripeReportIdentity } from '@/helpers/resolveStripeReportIdentity'
import type { StripeReportBilling } from '@/types/stripeReportTypes'

export async function getReportBilling(charge: Stripe.Charge): Promise<StripeReportBilling> {
  const paymentIntent = getStripeObjectId(charge.payment_intent)
  const invoices: Stripe.Invoice[] = []
  let session: Stripe.Checkout.Session | null = null
  if (paymentIntent) {
    for await (const payment of stripe.invoicePayments.list({
      payment: { type: 'payment_intent', payment_intent: paymentIntent },
      limit: 100, expand: ['data.invoice'],
    }, STRIPE_REPORT_REQUEST_OPTIONS)) {
      const invoice = payment.invoice
      if (typeof invoice === 'string') throw new Error('Niepełne dane faktury.')
      if (!invoice.deleted && invoice.status !== 'draft' &&
        !invoices.some((item) => item.id === invoice.id)) invoices.push(invoice)
    }
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent, limit: 100,
    }, STRIPE_REPORT_REQUEST_OPTIONS)
    session = sessions.data.find((item) => item.status === 'complete') ?? null
  }
  return {
    ...resolveStripeReportIdentity(charge, invoices, session),
    invoices: invoices.map((invoice) => ({
      id: invoice.id, number: invoice.number ?? invoice.id, currency: invoice.currency,
      total: invoice.total, tax: invoice.total_taxes?.reduce((sum, tax) => sum + tax.amount, 0) ?? 0,
      pdf: invoice.invoice_pdf ?? null,
    })),
  }
}

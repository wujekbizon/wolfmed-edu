import type Stripe from 'stripe'
import type { StripeReportIdentity } from '@/types/stripeReportTypes'

export function resolveStripeReportIdentity(
  charge: Stripe.Charge,
  invoices: Stripe.Invoice[],
  session: Stripe.Checkout.Session | null
): StripeReportIdentity {
  const candidates = [
    { ...charge.billing_details, source: 'Płatność' },
    ...invoices.filter((invoice) => invoice.status !== 'draft').map((invoice) => ({
      name: invoice.customer_name, email: invoice.customer_email,
      address: invoice.customer_address, source: `Faktura ${invoice.number ?? invoice.id}`,
    })),
    { ...session?.customer_details, source: 'Checkout' },
  ]
  const name = candidates.find((item) => item.name?.trim())
  const email = candidates.find((item) => item.email?.trim())
  const address = candidates.find((item) => item.address?.line1?.trim())
    ?? candidates.find((item) => item.address && Object.values(item.address).some(Boolean))
  const value = address?.address
  const taxIds = invoices.flatMap((invoice) => invoice.customer_tax_ids ?? [])
  const checkoutTaxIds = session?.customer_details?.tax_ids ?? []
  return {
    name: name?.name ?? '', email: email?.email ?? charge.receipt_email ?? '',
    address: value ? [value.line1, value.line2,
      [value.postal_code, value.city].filter(Boolean).join(' '), value.state, value.country,
    ].filter(Boolean).join(', ') : '',
    missingAddress: !value?.line1 || !value.city || !value.country ||
      (value.country === 'PL' && !value.postal_code),
    sources: [name?.source, email?.source, address?.source].filter(Boolean)
      .filter((item, index, all) => all.indexOf(item) === index).join(', '),
    taxIds: [...new Set([...taxIds, ...checkoutTaxIds].map((item) => item.value)
      .filter(Boolean))].join(', '),
  }
}

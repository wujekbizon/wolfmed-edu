import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { resolveStripeReportIdentity } from '@/helpers/resolveStripeReportIdentity'
import { reportCharge } from './fixtures/stripeReport'

test('guest and deleted customers retain historical billing fields', () => {
  const identity = resolveStripeReportIdentity(reportCharge, [], null)
  assert.equal(identity.email, 'fixture@example.com')
  assert.equal(identity.missingAddress, true)
  const charge = { ...reportCharge, customer: { id: 'cus_deleted', deleted: true } } as Stripe.Charge
  assert.deepEqual(resolveStripeReportIdentity(charge, [], null), identity)
})

test('finalized invoice address and tax ID fill missing charge fields', () => {
  const invoice = {
    id: 'in_fixture', number: 'FV-2026-08', status: 'paid', customer_name: 'Firma',
    customer_address: { line1: 'Długa 1', city: 'Łódź', postal_code: '90-001', country: 'PL' },
    customer_tax_ids: [{ type: 'eu_vat', value: 'PL1234567890' }],
  } as Stripe.Invoice
  const identity = resolveStripeReportIdentity(reportCharge, [invoice], null)
  assert.equal(identity.address, 'Długa 1, 90-001 Łódź, PL')
  assert.equal(identity.missingAddress, false)
  assert.equal(identity.taxIds, 'PL1234567890')
  assert.equal(identity.name, reportCharge.billing_details.name)
  assert.equal(resolveStripeReportIdentity(reportCharge, [{ ...invoice, status: 'draft' }], null).address, '')
})

test('transaction address wins; current Customer address is never used', () => {
  const charge = { ...reportCharge,
    customer: { id: 'cus_new', address: { line1: 'Nowy adres' } },
    billing_details: { ...reportCharge.billing_details,
      address: { line1: 'Stary adres', city: 'Gdańsk', country: 'PL', postal_code: '80-001' },
    },
  } as Stripe.Charge
  const identity = resolveStripeReportIdentity(charge, [], null)
  assert.match(identity.address, /Stary adres/)
  assert.doesNotMatch(identity.address, /Nowy adres/)
})

test('Checkout fallback preserves partial addresses without guessing', () => {
  const session = { customer_details: { name: 'Gość', email: 'guest@example.com',
    address: { city: 'Warszawa', country: 'PL' }, tax_ids: [],
  } } as unknown as Stripe.Checkout.Session
  const identity = resolveStripeReportIdentity(reportCharge, [], session)
  assert.equal(identity.address, 'Warszawa, PL')
  assert.equal(identity.missingAddress, true)
})

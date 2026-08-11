# Stripe payments and subscriptions plan

Status: implementation active. One-time Checkout hardening, local orders,
idempotency, atomic fulfillment, lifetime Basic-to-Premium updates,
refunds/disputes and success UI are approved and tested in development.
Subscriptions remain pending.

Branch: `codex/practical-exam-next`.

Prepared: 2026-08-11.

## Progress

- [x] Trusted server-owned lifetime offer catalog.
- [x] Required name/address, optional NIP and paid invoices.
- [x] Course-aware canceled return flow.
- [x] Phase 2A: local orders, concurrent-attempt deduplication and Stripe
  idempotency keys.
- [x] Phase 2B: canonical Session validation, atomic ledger/entitlement fulfillment,
  webhook replay safety and DB-authoritative access.
- [x] Card and BLIK development payments.
- [x] Source-aware lifetime grants resolve to the highest active tier.
- [x] Cancel, access and navigation development tests.
- [x] Verified paid/pending/failed success UI.
- [x] Manual paid, pending, invalid-ID and cross-user success-page tests.
- [x] Refund and dispute lifecycle.
- [x] Difference-price lifetime upgrade offers and separate source grants.
- [ ] Monthly subscriptions and Customer Portal.

## Pricing

Wolfmed is the category pioneer. Pricing is based on product value, retention,
and AI cost rather than competitor anchoring.

| Course/tier | Monthly | Lifetime | Lifetime break-even |
|---|---:|---:|---:|
| Opiekun Basic | 19.99 PLN | 159.99 PLN | 8.0 months |
| Opiekun Premium | 49.99 PLN | 449.99 PLN | 9.0 months |
| Pielegniarstwo Basic | 49.99 PLN | 279.99 PLN | 5.6 months |
| Pielegniarstwo Premium | 79.99 PLN | 599.99 PLN | 7.5 months |

Launch with these prices. Review conversion, churn, retention, and Premium AI
margin after 60-90 days. No free tier, trial, coupon, annual plan, or usage billing.

Lifetime and monthly are alternative purchase models. Prevent duplicate
lifetime/subscription billing for the same course.

## Current implementation risks

- Refund, dispute, and subscription events are absent.
- Subscription schema cannot model the required lifecycle or two courses.
- Billing management UI and Stripe Customer Portal are absent.
- Basic materials are not indexed when access later becomes Premium.

## Server-first architecture

- Keep pricing, billing, success, and settings pages as Server Component shells
  with real Suspense skeletons.
- Use Server Actions for Checkout and Customer Portal creation.
- Use small Client Components only for selectors, forms, and interactive status.
- Keep Stripe secrets, catalog validation, payment state, and access decisions
  server-only.
- Keep webhooks and entitlement resolution in server modules.
- Use React Query only for shared client access state that must refresh without a
  navigation.
- Follow the repository form pattern: server Zod, `useActionState`, field errors,
  and toast handling.

## Secure existing one-time payments

- Replace client Price IDs, course, and tier with a server-owned `offerKey`
  catalog. Validate active Stripe Price, Product, PLN currency, amount, and mode.
- Add Zod validation, `stripe:checkout` rate limiting, and local checkout orders.
- Reuse concurrent attempts. Create Stripe Sessions with
  `checkout:<orderId>` idempotency keys.
- Put only local order ID in Stripe metadata. Resolve course, tier, and amount from
  the server catalog during fulfillment.
- Require full name and billing address. Keep company NIP optional through Stripe
  tax-ID collection. Update the Stripe Customer from Checkout.
- Enable paid invoice creation for every one-time payment. Subscriptions generate
  invoices automatically.
- Make `/success` authenticate the user, verify local-order ownership, retrieve
  the Session, and invoke the same idempotent fulfillment routine as the webhook.
  Never grant or claim access from URL parameters.
- Make `/canceled` expire the local attempt and return to the relevant course.

## Stripe catalog

Support ten Prices:

- Four existing lifetime Prices.
- Four monthly recurring Prices at the approved values.
- Opiekun Basic lifetime to Premium lifetime: 290.00 PLN.
- Pielegniarstwo Basic lifetime to Premium lifetime: 320.00 PLN.

Use one recurring Product per course with Basic and Premium Prices under it so
Customer Portal can change tiers. Use stable lookup keys:

- `opiekun_basic_lifetime`
- `opiekun_premium_lifetime`
- `opiekun_premium_upgrade`
- `opiekun_basic_monthly`
- `opiekun_premium_monthly`
- Equivalent `pielegniarstwo_*` keys

Lifetime owners retain permanent access. Lifetime Basic owners receive the
difference-price upgrade only when eligible. Lifetime holders cannot subscribe to
the same course. Active subscribers cannot purchase lifetime for that course until
the subscription ends. Either model may still be used for the other course.

## Subscription lifecycle and UI

- Create monthly subscriptions through hosted Checkout `mode=subscription`.
- Allow one active subscription per user/course and subscriptions to both courses.
- Add billing settings showing course, model, tier, status, renewal/cancellation
  date, lifetime ownership, and a Manage subscription button.
- Create short-lived authenticated Customer Portal Sessions with a fixed return
  URL.
- Configure Portal for payment methods, billing details, NIP, invoices, tier
  changes, and cancellation. Disable quantity changes and promotions.
- Basic to Premium: immediate, prorated, and invoiced.
- Premium to Basic: scheduled for next renewal.
- Cancellation: period end, no automatic refund, access through paid period.
- Failed renewal: revoke access immediately. Later successful invoice restores it.
- Account deletion: cancel active subscriptions immediately and idempotently,
  without automatic refund, before deleting application data.

UI additions:

- Monthly/lifetime pricing selector and cards.
- Eligible lifetime Basic-to-Premium upgrade price.
- Billing overview and Stripe Portal entry point.
- Verified paid, pending, failed, and canceled result states.
- Clear renewal, proration, cancellation, refund, and access-loss copy.
- DB-backed access summary instead of Clerk metadata for authoritative UI state.

## Data model and entitlements

- Add checkout orders with UUID, user, offer, active deduplication key, status,
  unique Stripe Session ID, expiry, and timestamps.
- Expand payments with unique nullable Session, PaymentIntent, and Invoice IDs;
  offer, subscription, customer, amount, refund, dispute, and status fields.
- Expand subscriptions with unique Stripe subscription ID, customer, user,
  course, tier, Price, status, period dates, cancellation state, and latest Invoice.
  Remove the current one-subscription-per-user restriction.
- Evolve enrollments into source-aware grants: `legacy_lifetime`,
  `lifetime_purchase`, `lifetime_upgrade`, `subscription`, or `manual`, with source
  ID, active/revoked state, and start/end timestamps.
- Backfill current enrollments as permanent `legacy_lifetime` grants.
- Resolve effective access from the highest active grant. Refunding a Premium
  upgrade falls back to lifetime Basic.
- Keep full billing PII in Stripe Customer records; store identifiers and
  operational flags locally.
- Remove unused purchase `testLimit` rewards. Ensure storage initialization once
  on first entitlement instead of rewarding renewals.
- On effective Basic-to-Premium activation, enqueue a durable library activation
  job that moves eligible `not_indexed` materials to `pending`. Do not run AI work
  inside the webhook.

## Webhooks and reconciliation

Handle:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- Refund lifecycle events
- Dispute opened and closed events

Insert the processed-event record in the same DB transaction as payment,
subscription, and entitlement mutations. Roll back on failure so Stripe retries.
Use unique Stripe business-object IDs and upserts as a second idempotency layer.

For duplicate or out-of-order delivery, fetch canonical current Stripe Session,
Subscription, or Invoice before syncing local state. Do not call Clerk or run
indexing/model work inside the webhook.

Full refunds and lost disputes revoke the associated grant. Partial refunds update
the ledger without automatic revocation. A refunded Premium upgrade falls back to
its Basic lifetime grant.

## Tests

Automated coverage:

- Offer, Price, course, tier, currency, and amount tampering.
- Concurrent Checkout calls and idempotency reuse.
- Event replay, concurrent delivery, rollback, and out-of-order events.
- One-time, async, subscription, failed-renewal, recovery, and cancellation flows.
- Immediate prorated upgrade and period-end downgrade.
- Full/partial refunds, disputes, and entitlement fallback.
- Success-page ownership and pending state.
- Lifetime-upgrade and duplicate-model eligibility.
- Account deletion with active subscriptions.

Stripe sandbox coverage:

- All ten offers and exact amounts.
- Required name/address, optional NIP, and generated invoice PDFs.
- Customer Portal tier changes, cancellation, and invoices.
- Test Clocks for renewal, failure, recovery, downgrade, and cancellation.

Migration preflight detects duplicate payments, enrollments, and subscriptions
before adding unique constraints.

## Rollout

1. Harden one-time Checkout, invoice collection, fulfillment, and webhooks.
2. Expand/backfill billing and entitlement schema; add lifetime upgrades.
3. Configure and verify recurring Products, Prices, webhooks, and Portal in Stripe
   test mode.
4. Enable subscriptions behind a feature flag.
5. Reconcile Stripe and local billing state before live rollout.

Use a production backup/Neon branch and a versioned expand-backfill-switch-contract
migration. Keep legacy open Checkout Sessions compatible until they expire. Do not
perform destructive contract cleanup in the initial release.

## Documentation and operations

- Update payment flow, API route, schema, forms, testing, and `DB_MIGRATIONS.md`
  after implementation.
- Add billing runbook covering Stripe Dashboard configuration, event matrix,
  reconciliation, refunds, disputes, alerting, and rollback.
- Update pricing, Terms, and Privacy copy for recurring billing, proration,
  cancellation, failed-payment access, refunds, and billing-data processing.
- Stripe invoices are not Polish KSeF submissions. When a Customer supplies a
  company NIP, issue the required KSeF invoice manually. No KSeF/accounting
  integration is included.
- Keep automatic Stripe Tax disabled until accounting requests and configures it.

## Official references

- [Checkout subscriptions](https://docs.stripe.com/payments/checkout/build-subscriptions)
- [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Webhook best practices](https://docs.stripe.com/webhooks?lang=node)
- [Subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Customer Portal integration](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Customer Portal configuration](https://docs.stripe.com/customer-management/configure-portal)
- [Price lookup keys](https://docs.stripe.com/products-prices/manage-prices)
- [Name collection](https://docs.stripe.com/payments/checkout/name-collection.md?payment-ui=stripe-hosted)
- [Tax-ID collection](https://docs.stripe.com/tax/checkout/tax-ids)
- [Receipts and paid invoices](https://docs.stripe.com/receipts)
- [Changing subscription Prices](https://docs.stripe.com/billing/subscriptions/change-price)
- [Prorations](https://docs.stripe.com/billing/subscriptions/prorations)
- [Subscription cancellation](https://docs.stripe.com/billing/subscriptions/cancel)
- [Refunds](https://docs.stripe.com/refunds)
- [Disputes](https://docs.stripe.com/disputes/responding)
- [Test Clocks](https://docs.stripe.com/billing/testing/test-clocks)
- [Official KSeF scope](https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/zakres-obowiazkowego-ksef/)

## Decisions

- Prices listed above are final launch prices.
- No free tier or trial.
- Existing lifetime access remains permanent.
- Monthly cancellation takes effect at period end.
- Failed renewal revokes access immediately.
- Full refund/lost dispute revokes related grant; partial refund does not.
- Stripe Customer is billing-address/NIP source of truth.
- KSeF handling is manual.
- Unresolved questions: none.

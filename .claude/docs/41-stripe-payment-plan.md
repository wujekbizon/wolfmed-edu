# Stripe payments and subscriptions plan

Status: core implementation verified in development. Database migration, Stripe
test configuration and manual lifetime/subscription flows are complete. Remaining
work is listed in **Next session handoff**; this is not production-ready yet.

Branch: `codex/practical-exam-next`.

Prepared: 2026-08-11.

Updated: 2026-08-14.

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
- [x] Monthly offer catalog, Checkout, lifecycle sync and source grants.
- [x] Failed-renewal revocation, recovery and period-end cancellation handling.
- [x] Billing overview, Customer Portal entry and subscription-cancellation safeguard.
- [x] Monthly/lifetime pricing selector.
- [x] Source-aware pricing states and course-scoped Basic-to-Premium Portal flow.
- [x] Shared verified success page for purchases and both upgrade models.
- [x] Dashboard plan and payment summary linking to billing settings.
- [x] Subscription DB migration and Stripe sandbox configuration.
- [x] Monthly purchase, upgrade, cancel, resume and terminal cleanup flows.
- [x] Lifetime purchase, difference-price upgrade and invoice event routing.
- [x] TypeScript check, 194 automated tests and `git diff --check`.
- [x] Permanent Clerk/Stripe account deletion and RODO retention workflow.
- [ ] Stripe Test Clock renewal, failure, recovery, downgrade and cancellation.
- [ ] Premium-to-Basic scheduled downgrade implementation and UI.
- [ ] Durable Premium library activation job.

## Next session handoff

Start the next session from this section. Preserve all completed work above.

### Priority 0: permanent account deletion and RODO

Accepted in dev 2026-08-14: M12 cleanup/migration/backfill and TC-7 passed. The
test deleted one Customer with lifetime access, one local Subscription and one
Stripe-only Subscription; both canceled. Disposable rows and the UploadThing
material disappeared, memory tombstones were erased, retained billing was
pseudonymized through 2032, Clerk replay was idempotent, and same-email
registration restored no access and created a different Customer at checkout.
Lecture-specific UploadThing deletion was manually skipped; it uses the same
batched deletion path as the verified material. Static checks and 194 tests pass.

Approved product policy:

- Account deletion is immediate and permanent; there is no grace period.
- Delete all course access, including lifetime access.
- A later registration, even with the same email and name, creates a new Clerk and
  Wolfmed user. The next checkout lazily creates a new Stripe Customer. Purchases
  are not restored automatically.
- Delete the Stripe Customer. Stripe removes reusable payment details and cancels
  every active subscription, including subscriptions missing from local state.
- Keep financial history only for accounting, refunds and disputes. Never use it
  for access restoration or marketing.

Implementation plan:

1. Audit every user-owned table. Add `onDelete: "cascade"` to disposable data
   currently missing it, including course enrollments, custom tests/categories and
   blog likes. Do not cascade the retained financial ledger.
2. Replace subscription-only cleanup with one idempotent account-deletion
   coordinator. Load the local Stripe Customer ID, delete the Stripe Customer,
   treat an already-missing Customer as success, erase personal memory and delete
   the Wolfmed user last.
3. Delete `wolfmed_course_enrollments` immediately. Delete or erase profile,
   learning, uploads, limits and AI-memory data. Remove the original Clerk user ID
   from tombstoned memory/audit rows.
4. Retain `wolfmed_stripe_payments` as the minimal pseudonymized financial ledger.
   Keep amount, currency, transaction date, offer/course and Stripe
   PaymentIntent/Charge/Invoice/refund/dispute identifiers and states. Remove the
   Clerk user ID, email/name and Stripe Customer ID when no longer operationally
   required.
5. Add a retention deadline to retained payment rows. Polish tax documentation is
   generally retained for five years from the end of the calendar year in which
   the related tax-payment deadline occurred; suspension/interruption extends it.
   Example: a 2026 sale whose annual tax is due in 2027 is normally retained
   through 2032. Confirm the final calculation with Wolfmed's accountant.
6. Pseudonymize and temporarily retain `wolfmed_stripe_checkout_orders`,
   `wolfmed_stripe_subscriptions` and `wolfmed_processed_events` so delayed Stripe
   events can validate and return `200`. Stripe supports manual CLI resend for up
   to 30 days, so use at least a 30-day operational cleanup window after deletion.
7. Mark deleted-owner orders. Checkout, subscription, refund and dispute handlers
   may update retained financial state but must never recreate enrollments,
   storage limits or other access for a deleted owner.
8. Override the existing Clerk `plPL` localization in `ClerkProviderWrapper`:
   `userProfile.deletePage.messageLine1` must warn that all purchased course
   access, including lifetime, is permanently lost; `messageLine2` must warn that
   purchases are not restored after registration. Keep Clerk's typed `Usuń konto`
   confirmation; do not build a separate deletion UI.
9. Add tests for lifetime deletion, active/multiple/out-of-sync subscriptions,
   missing Stripe Customer, webhook retry, delayed Stripe events, retained payment
   pseudonymization, cascade cleanup and same-email registration without access.
10. Prepare a one-time orphan cleanup for the current test database and old Stripe
    test Customers. Show the exact command/query and wait for Greg to run it.

Required documentation updates: privacy policy, schema, auth/payment flow,
migration guide and deletion test guide.

### Priority 1: Stripe Test Clock verification

Do not use an existing Stripe Customer: a Test Clock accepts only new Customers.

1. Run the Clerk webhook relay:

   ```text
   npx clerk webhooks listen --forward-to http://localhost:3000/api/webhooks/clerk
   ```

   Configure its public relay URL for `user.created` and `user.deleted`, copy the
   endpoint signing secret to `CLERK_WEBHOOK_SECRET`, and restart Wolfmed.
2. Create a fresh Wolfmed test user and sign in once so `wolfmed_users` exists.
3. Stripe sandbox -> Billing -> Subscriptions -> Simulations -> New simulation.
   Set frozen time to now, add a new Customer with the test user's email, but do
   not create the Subscription in the Dashboard.
4. Link that new `cus_...` to the fresh Wolfmed user's `stripeCustomerId` in the
   development database. Then buy Basic monthly through Wolfmed with test card
   `4242 4242 4242 4242`; Checkout will create the clock-bound Subscription.
5. Successful renewal: record existing row IDs, advance slightly beyond
   `current_period_end`, wait for `Ready`, then advance another hour so the draft
   Invoice finalizes. Expect all webhooks `200`, the same subscription/enrollment,
   a period moved by one month and one new Invoice payment with `sessionId = NULL`.
6. Failed renewal: make `4000 0000 0000 0341` the default payment method, advance
   to the next renewal plus one hour, and expect `invoice.payment_failed`, failed
   payment state and immediate access revocation.
7. Recovery: replace the card with `4242 4242 4242 4242`, retry the failed Invoice,
   and expect `invoice.paid`, the same payment row updated and access restored.
8. After downgrade work below is implemented, schedule Premium-to-Basic and
   advance the clock. Premium remains active through the paid period; Basic becomes
   active at renewal without duplicate subscription or enrollment rows.
9. Schedule cancellation and advance past the end date. Expect
   `customer.subscription.deleted`, inactive access and lifetime offers available.
10. Inspect DB before finishing the simulation. Finishing deletes the clock's
    Stripe Customer and Subscription.

Accepted in dev 2026-08-15: successful renewal, failed renewal and recovery
passed. Webhooks returned `200`; renewal reused the subscription/enrollment rows,
failure created one failed Invoice payment and revoked access, and recovery
updated that same payment to `paid` and restored access. Downgrade and
cancellation remain pending.

### Priority 1: Premium-to-Basic downgrade

Basic-to-Premium immediate prorated upgrade is complete. The reverse direction is
not implemented in Wolfmed UI/server flow.

1. For a Premium monthly subscriber, show a clear Basic-card action such as
   `Przejdź na Basic od następnego okresu` instead of disabled `Masz Premium`.
2. Extend the course-scoped Portal action to accept Premium-to-Basic only for the
   same course and current Subscription. Keep cross-course switching impossible.
3. Configure/verify that downgrade is scheduled for the next renewal with no
   immediate refund or access reduction.
4. Represent the pending downgrade in local billing state and show its effective
   date in pricing, dashboard and billing settings.
5. Return to the shared result/status UI with copy saying the downgrade is
   scheduled, not already active.
6. Verify with a Test Clock that Premium remains available until renewal, then
   changes once to Basic. Test canceling/changing the scheduled downgrade.

### Priority 2: durable Premium library activation

When effective access changes from Basic to Premium, enqueue a durable job that
moves eligible personal-library materials from `not_indexed` to `pending`. Do not
run extraction, embeddings or model work inside Checkout or webhook transactions.
Make the transition idempotent across lifetime upgrades, subscription upgrades,
renewal recovery and duplicate webhooks.

### Final production work

- Reconcile Stripe Customers, payments, subscriptions and local grants.
- Add the billing/deletion operational runbook and alerting.
- Confirm payment-record retention with Wolfmed's accountant and privacy reviewer.
- Test migrations on a Neon branch/backup before production.
- Configure live Products, Prices, Portal configurations and webhook endpoint.
- Run the full sandbox checklist again, then perform a controlled live smoke test.

Next-session unresolved questions:

- Accountant confirmation of the exact payment-record retention deadline.

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

- Basic materials are not indexed when access later becomes Premium.
- Stripe Test Clock downgrade and cancellation remain unverified.
- Premium-to-Basic scheduled downgrade is not implemented.
- Payment retention deadline still requires accountant confirmation before prod.

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
- Account deletion: permanently delete the Stripe Customer and all access
  immediately and idempotently, without automatic refund. Retain only the minimum
  pseudonymized financial ledger required for accounting/refunds/disputes.

UI additions:

- Monthly/lifetime pricing selector and cards.
- Eligible lifetime Basic-to-Premium upgrade price.
- Billing overview and Stripe Portal entry point.
- Verified paid, pending, failed, and canceled result states.
- Outcome-specific success copy for lifetime, subscription, and upgrades.
- Dashboard plan summary with renewal date and billing-settings link.
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
- Keep billing PII in Stripe while the account exists. On account deletion, delete
  the Stripe Customer and remove local identity fields while retaining only the
  required pseudonymized financial ledger.
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
4. Start the app and verify subscriptions in Stripe test mode.
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
- Account deletion is immediate, permanent and removes lifetime/subscription
  access. There is no grace period or automatic restoration after re-registration.
- Delete the Stripe Customer on account deletion. Retain only pseudonymized local
  payment records through the applicable Polish tax-retention deadline.
- KSeF handling is manual.
- Remaining external confirmation: accountant approval of the exact retention
  deadline calculation.

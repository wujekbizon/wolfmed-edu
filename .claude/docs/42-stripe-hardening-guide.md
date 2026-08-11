# Stripe one-time payment hardening guide

Status: Phase 2A and 2B implemented in code. Dev migration and combined Stripe
test pending. Subscriptions remain out of scope.

Parent plan: [`41-stripe-payment-plan.md`](./41-stripe-payment-plan.md).

## Reused flow

Keep the current user journey and working integration:

- Existing course pricing cards and Buy buttons.
- Server Action redirect to Stripe-hosted Checkout.
- Existing Stripe Customer creation.
- Existing webhook route and signature verification.
- Existing success/canceled routes and enrollment checks.

Only replace unsafe internals. Do not rebuild Checkout UI or add subscriptions in
this phase.

## Approval workflow

Each checkpoint follows the same gate:

1. Implement only that checkpoint.
2. Run focused tests, full tests, TypeScript, lint, and build as appropriate.
3. Greg runs listed Stripe test-mode checks.
4. Record evidence and defects here.
5. Continue only after Greg approves.

Repository scripts and database commands require Greg's explicit approval before
the agent runs them.

## Checkpoint 1 - trusted Checkout input

Status: approved by Greg on 2026-08-11.

Changes:

- Replace client-submitted Price ID, course, and tier with one public `offerKey`.
- Resolve Price ID, course, tier, amount, currency, and availability server-side.
- Reject unknown and unavailable offers.
- Retrieve the configured Stripe Price and require active, one-time, exact PLN
  amount before creating Checkout.
- Add server Zod validation and `stripe:checkout` rate limiting.
- Require individual name and full billing address.
- Keep business NIP optional through Stripe tax-ID collection.
- Enable paid invoice creation.
- Keep resolved course/tier metadata temporarily so the current webhook continues
  to enroll users unchanged.
- Enable all four current lifetime offers, including both Premium tiers.

Automated acceptance:

- Known offer keys pass; forged keys fail.
- Every offer key maps to canonical server metadata.
- Inactive, recurring, wrong-currency, and wrong-amount Prices fail validation.
- `pnpm test`, TypeScript, lint, and production build pass.

Greg's Stripe test-mode acceptance:

Environment note (2026-08-11): Stripe CLI is not installed on this workstation.
Install/authenticate it before step 3, or test against a deployed test webhook.

1. Confirm all Stripe keys and four Price IDs use test mode.
2. Start the app with `pnpm dev`.
3. Forward events:

   ```text
   stripe listen --events checkout.session.completed --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Put the listener's `whsec_...` value in `STRIPE_WEBHOOK_SECRET`, then restart
   the app.
5. Signed out: click Buy and confirm sign-in returns to the correct course.
6. Signed in: click all four Buy buttons and confirm hosted Checkout opens.
7. Confirm exact PLN amounts: Opiekun 159.99/449.99; Pielegniarstwo
   279.99/599.99.
8. Confirm full name and complete billing address are required.
9. Confirm business purchase can provide NIP, while individual purchase can omit
   it.
10. Pay with `4242 4242 4242 4242`, any future date, any CVC.
11. Confirm one paid Invoice exists in Stripe test Dashboard.
12. Confirm redirect to success and existing course enrollment still works.
13. Try `4000 0000 0000 9995`; confirm decline and no enrollment.
14. Change hidden `offerKey` to `attacker_price`; confirm no Checkout Session is
    created and the form reports an error.
15. Cancel each course Checkout; confirm `/canceled` opens and “Powrót do oferty”
    returns to that course's `#cennik` section.

Do not use real card details. Stripe's official test values are documented at
[Test card numbers](https://docs.stripe.com/testing).

Approval evidence:

- [x] Automated checks passed: 144 tests, TypeScript, lint, production build.
- [ ] Opiekun Basic success passed.
- [ ] Opiekun Premium success passed.
- [ ] Pielegniarstwo Basic success passed.
- [ ] Pielegniarstwo Premium success passed.
- [ ] Required billing data and optional NIP passed.
- [ ] Paid Invoice passed.
- [ ] Decline passed with no enrollment.
- [ ] Forged offers rejected.
- [ ] Cancel returns to the same course offer.
- [ ] Greg approved checkpoint 1.

## Checkpoint 2 - checkout orders and idempotency (Phase 2A)

Status: implemented in code; waiting for combined Phase 2A+2B dev test.

Changes:

- Add an additive `stripe_checkout_orders` table.
- Store UUID, user, offer, status, active deduplication key, Stripe Session ID,
  expiry, and timestamps.
- Snapshot Price ID, amount, currency, course and tier on the local order.
- Reuse one active order per user/course/purchase model.
- Create Checkout with `checkout:<orderId>` as Stripe idempotency key.
- Reuse the existing Session URL for concurrent double-click/tab requests.
- Mark canceled and expired attempts terminal without granting access.
- Temporarily keep legacy course/tier metadata until Phase 2B is deployed with it.

Acceptance:

- Double-click and two concurrent tabs produce one local order and one Session.
- Retrying the same operation returns the same Session.
- Canceling creates no payment or enrollment.
- A terminal/expired attempt permits a new Checkout.
- Existing Checkout behavior remains unchanged.

## Checkpoint 3 - atomic ledger and entitlement fulfillment (Phase 2B)

Status: implemented in code; waiting for migration and combined dev test.

Changes:

- Add unique Stripe Session, PaymentIntent, and event identifiers.
- Add source-aware lifetime entitlements and backfill existing enrollments as
  `legacy_lifetime`.
- Move payment, entitlement, storage initialization, order state, and event marker
  into one DB transaction.
- Validate webhook Session/line item against the local order and server catalog.
- Remove the unused `testLimit` purchase reward.
- Remove Clerk API calls from the transaction/webhook path.
- Keep DB access authoritative.
- Handle completed, asynchronous success and asynchronous failure events.
- Store no new billing email locally; Stripe Customer remains the PII source.

Acceptance:

- Replaying one event changes nothing.
- A second event for the same Session changes nothing.
- Forced transaction failure grants nothing; Stripe retry later succeeds once.
- First payment creates one lifetime entitlement; an upgrade updates it in place.
- Backfilled owners keep identical access.

### Combined Phase 2A+2B dev test

Prerequisite: execute M9 from `DB_MIGRATIONS.md` against dev only.

1. Forward `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, and
   `checkout.session.async_payment_failed` to the local webhook.
2. Double-click one offer and open the same offer in two tabs. Expect one local
   active order and one Stripe Session ID; both requests reuse the Session.
3. Start Basic, then request Premium for the same course. Expect the active-order
   conflict until Basic is canceled or expires.
4. Cancel Checkout. Expect Stripe Session `expired`, local order `CANCELED`, no
   payment and no entitlement. A new attempt must create a new order.
5. Pay each of the four offers. Expect one order and payment per Session, one
   `lifetime_purchase` entitlement per user/course updated to the highest paid
   tier, plus one user limits row.
6. Resend the same event and then send another paid event for the same Session.
   Counts must not change.
7. Confirm amount, currency, Price, Customer or user mismatch returns webhook
   `500` and writes nothing.
8. Force a DB failure inside fulfillment. Expect no event, payment, entitlement,
   order-state or storage partial write; retry succeeds once after restoring DB.
9. Confirm no `testLimit` increase and no Clerk API request from Stripe webhook.
10. Confirm course page and panel access reflect DB grants. Navbar/Drawer must
    not depend on Clerk course metadata.

## Checkpoint 4 - verified result UI

Status: blocked on checkpoint 3 approval.

Changes:

- Keep `/success` as a Server Component shell with Suspense.
- Authenticate, verify Session/order ownership, retrieve Stripe state, and call the
  same idempotent fulfillment service used by the webhook.
- Render paid, processing, failed, and invalid-owner states.
- Never claim access from URL parameters.
- Update canceled order state safely.

Acceptance:

- Success works whether browser redirect or webhook arrives first.
- Refresh and duplicate tabs remain idempotent.
- Another user's Session ID reveals nothing and grants nothing.
- Pending/failed payments never claim active access.
- Navbar/panel state matches DB access after payment.

## Checkpoint 5 - refunds and disputes

Status: blocked on checkpoint 4 approval.

Changes:

- Handle refund lifecycle and dispute opened/closed events.
- Fetch canonical Stripe state for duplicate/out-of-order events.
- Full successful refund or lost dispute revokes only its source entitlement.
- Partial refund updates the ledger without revoking access.
- Won dispute restores access when the payment remains valid.

Acceptance:

- Full refund revokes access once.
- Partial refund preserves access.
- Lost dispute revokes; won dispute restores.
- Replayed and out-of-order events converge to Stripe state.
- Other course/lifetime grants remain unaffected.

## Phase 1 completion gate

- [ ] All five checkpoints approved.
- [ ] Full automated suite, TypeScript, lint, and build pass.
- [ ] Stripe CLI replay and Dashboard refund/dispute tests pass.
- [ ] Dev DB reconciles one-to-one with Stripe Sessions and payments.
- [ ] Payment flow, schema, API, forms, testing, and migration docs updated.
- [ ] No subscription Product, Price, Portal, or lifecycle code introduced.
- [ ] Greg approves beginning subscription implementation.

## Official baseline

- [Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Webhook testing and delivery behavior](https://docs.stripe.com/webhooks?lang=node)
- [Name collection](https://docs.stripe.com/payments/checkout/name-collection.md?payment-ui=stripe-hosted)
- [Tax-ID collection](https://docs.stripe.com/tax/checkout/tax-ids)
- [Receipts and paid invoices](https://docs.stripe.com/receipts)
- [Refunds](https://docs.stripe.com/refunds)
- [Disputes](https://docs.stripe.com/disputes/responding)

Unresolved questions: none.

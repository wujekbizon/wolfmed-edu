# Stripe one-time payment hardening guide

Status: Checkpoints 1-4 and difference-price lifetime upgrades approved by Greg on
2026-08-11. Refunds and disputes are next. Subscriptions remain out of scope.

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

Environment note (2026-08-11): Stripe CLI is installed, authenticated and used to
forward signed card and BLIK events to the local webhook.

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

- [x] Automated checks passed: 155 tests and TypeScript. Earlier checkpoint build
  and lint passed.
- [x] Opiekun Basic success passed.
- [x] Opiekun Premium success passed.
- [ ] Pielegniarstwo Basic success passed.
- [ ] Pielegniarstwo Premium success passed.
- [x] Required billing data and optional NIP passed.
- [x] Paid Invoice passed.
- [ ] Decline passed with no enrollment.
- [x] Forged offers rejected by automated coverage.
- [x] Cancel returns to the same course offer.
- [x] Greg approved checkpoint 1.

## Checkpoint 2 - checkout orders and idempotency (Phase 2A)

Status: approved by Greg on 2026-08-11.

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

Evidence:

- [x] Concurrent order integration check produced one winner and one stored order.
- [x] Stripe idempotency key and active-order reuse covered by automated tests.
- [x] Canceled attempt returned to the correct course and granted no access.
- [x] Greg approved Phase 2A.

## Checkpoint 3 - atomic ledger and entitlement fulfillment (Phase 2B)

Status: approved by Greg on 2026-08-11.

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
- Each paid Session creates one source grant; effective access uses the highest
  active tier.
- Backfilled owners keep identical access.

Evidence:

- [x] Card and BLIK payments returned successful signed webhook responses.
- [x] Concurrent BLIK completed/async-success events both returned `200`.
- [x] Real event replay kept one event, payment and enrollment.
- [x] Forced rollback left no event row; synthetic rows were cleaned.
- [x] Tampered owner, Customer, Price, amount, currency and mode are rejected.
- [x] Payment history retained separate Basic and Premium payment rows.
- [x] Separate entitlement-source acceptance passed with the lifetime upgrade.
- [x] No Clerk metadata dependency remains in webhook or navigation access state.
- [x] Greg approved Phase 2B.

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
5. Pay each of the four offers. Expect one order, payment and source grant per
   Session. Effective access uses the highest active tier. Expect one user limits
   row.
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

Status: approved by Greg on 2026-08-11.

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

Evidence:

- [x] Paid, pending, failed, malformed-ID and unavailable states passed.
- [x] Cross-user Session showed the invalid state and revealed no purchase data.
- [x] Refresh and retry remained idempotent.
- [x] Greg approved checkpoint 4.

## Difference-price lifetime upgrades

Status: approved by Greg on 2026-08-11.

Changes:

- Add active one-time PLN offers `opiekun_premium_upgrade` (290.00) and
  `pielegniarstwo_premium_upgrade` (320.00).
- Show the difference price only to an active lifetime Basic owner for that course.
- Recheck eligibility server-side before Checkout and atomically before granting.
- Store Basic and Premium upgrade as separate source grants. Revoking the upgrade
  later leaves Basic effective without reconstructing it.
- No database schema change or migration.

Environment:

- `STRIPE_OPIEKUN_PREMIUM_UPGRADE_PRICE_ID`
- `STRIPE_PIELEGNIARSTWO_PREMIUM_UPGRADE_PRICE_ID`

Acceptance:

1. Create both active, one-time PLN Prices in Stripe test mode and set the two env
   values above.
2. Lifetime Basic owner sees the regular Premium price struck through, the
   290.00/320.00 upgrade price and `Ulepsz do Premium`.
3. User without lifetime Basic sees the normal Premium offer. Forging an upgrade
   `offerKey` is rejected before Stripe Checkout.
4. Complete an upgrade. Expect the Basic grant plus one `lifetime_upgrade` Premium
   grant and effective Premium access.
5. Refresh `/success`. Expect no duplicate payment or grant.
6. Cancel an upgrade. Expect no grant and a retry link to the same course.
7. Delete the stored test Customer in Stripe and retry Checkout. Expect a new
   Customer, updated local Customer ID and a working Checkout Session.

Evidence:

- [x] Eligible Basic owner saw the difference price and completed the upgrade.
- [x] Basic and `lifetime_upgrade` grants remained separate; Premium became effective.
- [x] Success refresh and synchronous/asynchronous webhook delivery stayed idempotent.
- [x] Deleted Stripe Customer was replaced automatically and Checkout recovered.
- [x] Non-owner full Premium eligibility and forged-upgrade rejection passed in terminal.
- [x] Greg approved lifetime upgrades.

## Checkpoint 5 - refunds and disputes

Status: ready to implement; lifetime upgrades approved.

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

- [ ] All five checkpoints approved; checkpoints 1-4 complete.
- [x] Current full automated suite (166 tests), TypeScript, lint and production
  build pass after lifetime upgrades.
- [ ] Final lint and production build after checkpoints 4-5.
- [ ] Stripe CLI replay and Dashboard refund/dispute tests pass.
- [ ] Dev DB reconciles one-to-one with Stripe Sessions and payments.
- [x] Payment flow, schema, API, forms, testing, and migration docs updated through
  lifetime-upgrade implementation.
- [x] No subscription Product, Price, Portal, or lifecycle code introduced.
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

# Stripe subscription testing guide

Status: sandbox setup and full subscription lifecycle acceptance complete.

Parent flow: [`30-flows-auth-payments.md`](./30-flows-auth-payments.md).

Use Stripe sandbox/test mode and the development database only.

## Acceptance scope

The full pass covers:

- Basic monthly Checkout and initial access.
- Basic-to-Premium immediate prorated upgrade.
- Premium-to-Basic period-end downgrade.
- Releasing and recreating a scheduled downgrade.
- Paid renewal through a Test Clock.
- Failed renewal, immediate access loss and payment recovery.
- Period-end cancellation.
- Idempotent webhook/database behavior.
- Course isolation and both dedicated upgrade Portal configurations.

Do not reuse an old Test Clock Customer after changing Products or Prices. Create a
fresh Clerk user, Test Clock, Customer and Subscription.

## 1. Database

Create a Neon development backup/branch before schema work. Apply the development
schema:

```text
pnpm db:push
```

Never run `db:push` against production.

Verify the scheduled-change columns exist on
`wolfmed_stripe_subscriptions`:

- `schedule_id`
- `pending_offer_key`
- `pending_access_tier`
- `pending_price_id`
- `pending_change_at`

## 2. Stripe sandbox catalog

Use one flat-rate recurring Product per course tier. Basic and Premium must be
separate Products because Customer Portal rejects two Prices with the same
Product and recurring interval:

| Product | Price | Amount | Lookup key | Default |
|---|---|---:|---|---|
| Opiekun Medyczny — Basic | Basic | 19.99 PLN/month | `opiekun_basic_monthly` | yes |
| Opiekun Medyczny — Premium | Premium | 49.99 PLN/month | `opiekun_premium_monthly` | yes |
| Pielęgniarstwo — Basic | Basic | 49.99 PLN/month | `pielegniarstwo_basic_monthly` | yes |
| Pielęgniarstwo — Premium | Premium | 79.99 PLN/month | `pielegniarstwo_premium_monthly` | yes |

The default Price does not affect Wolfmed because Checkout always sends an
explicit Price ID. Keep all lifetime Products, Prices and environment variables
unchanged.

Give every recurring Price its exact lookup key from the table. Set the same
explicit tax behavior on Basic and Premium (`inclusive` or `exclusive`); never
leave it `unspecified`, because Stripe Portal then blocks subscription updates.
Stripe Prices cannot move between Products, so create new Prices and transfer the
lookup keys from the superseded recurring Prices. Do not delete a Price used by an
existing Subscription; archive it only after migration/testing no longer needs it.

Set the current sandbox IDs in the active local environment:

```ini
STRIPE_OPIEKUN_BASIC_MONTHLY_PRICE_ID=price_...
STRIPE_OPIEKUN_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PIELEGNIARSTWO_BASIC_MONTHLY_PRICE_ID=price_...
STRIPE_PIELEGNIARSTWO_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_OPIEKUN_PORTAL_CONFIGURATION_ID=bpc_...
STRIPE_PIELEGNIARSTWO_PORTAL_CONFIGURATION_ID=bpc_...
```

## 3. Customer Portal

The default Portal configuration is for billing management:

- Payment-method and billing-detail updates enabled.
- Invoice history enabled.
- Period-end cancellation enabled.
- Plan switching disabled.

Create one dedicated upgrade configuration per course. Each must satisfy:

1. Subscription plan switching enabled.
2. Only that course's Basic and Premium recurring Products are included.
3. Each Product includes only its current monthly Price.
4. Price changes enabled and quantity changes disabled.
5. Prorated charges and credits enabled.
6. Prorations invoiced immediately.
7. Billing-cycle anchor unchanged.
8. Manage downgrades disabled; Wolfmed schedules them through the Subscription
   Schedule API.

Wolfmed validates these settings before opening an upgrade Portal. A configuration
failure usually means the wrong `bpc_...`, an extra/missing Product or Price,
quantity enabled, or non-immediate proration.

Stripe returns the configuration's Product catalog only when
`features.subscription_update.products` is expanded. An empty `products` value
from a plain CLI retrieve command does not mean the catalog is missing.

## 4. Local processes

Run each process in a separate terminal.

Clerk listener:

```text
npx clerk webhooks listen --forward-to http://localhost:3000/api/webhooks/clerk
```

Copy its signing secret to `CLERK_WEBHOOK_SECRET`.

Stripe listener:

```text
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.paid,invoice.payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,subscription_schedule.created,subscription_schedule.updated,subscription_schedule.released,subscription_schedule.canceled,subscription_schedule.completed,subscription_schedule.aborted,charge.refunded,refund.created,refund.updated,refund.failed,charge.dispute.created,charge.dispute.closed --forward-to http://localhost:3000/api/webhooks/stripe
```

Copy its `whsec_...` to `STRIPE_WEBHOOK_SECRET`. A new listener can issue a new
secret.

Restart Wolfmed after every environment or signing-secret change:

```text
pnpm dev
```

Every accepted webhook must show `<-- 200 POST`. A `400` usually means the
listener secret and local environment do not match.

## 5. Fresh clock-bound user

1. With the Clerk listener running, create a fresh Clerk user and sign in once.
2. Record the Clerk `user_...` ID and confirm one `wolfmed_users` row exists.
3. Stripe sandbox -> Billing -> Subscriptions -> Simulations -> New simulation.
4. Set the frozen time to now.
5. Add a new Customer inside the simulation with the same email.
6. Do not create the Subscription in Stripe Dashboard.
7. Record the new `clock_...` and `cus_...` IDs.
8. Link the Customer to the fresh Wolfmed user in the development database:

```sql
UPDATE wolfmed_users
SET "stripeCustomerId" = 'cus_...'
WHERE "userId" = 'user_...';
```

Verify the link:

```sql
SELECT "userId", "stripeCustomerId"
FROM wolfmed_users
WHERE "userId" = 'user_...';
```

Verify the Customer belongs to the Test Clock:

```powershell
(stripe customers retrieve cus_... | ConvertFrom-Json).test_clock
```

It must return the expected `clock_...`. Stop if it is blank or different.

## 6. Reusable database checks

Replace `user_...` before running these queries.

```sql
SELECT
  id,
  "subscriptionId",
  offer_key,
  access_tier,
  price_id,
  status,
  "paymentStatus",
  current_period_start,
  current_period_end,
  schedule_id,
  pending_offer_key,
  pending_access_tier,
  pending_price_id,
  pending_change_at,
  cancel_at_period_end
FROM wolfmed_stripe_subscriptions
WHERE "userId" = 'user_...';

SELECT
  id,
  invoice_id,
  "paymentStatus",
  offer_key,
  access_tier,
  "sessionId",
  "createdAt"
FROM wolfmed_stripe_payments
WHERE "userId" = 'user_...'
ORDER BY "createdAt";

SELECT
  id,
  course_slug,
  access_tier,
  source_type,
  source_id,
  is_active,
  starts_at,
  expires_at,
  revoked_at
FROM wolfmed_course_enrollments
WHERE "userId" = 'user_...'
ORDER BY enrolled_at;
```

Record the initial subscription and enrollment row IDs. Plan changes, renewals,
failure and recovery must reuse them.

## 7. Initial Basic subscription

1. Open Opiekun Medyczny pricing in Wolfmed.
2. Select monthly billing and buy Basic.
3. Use `4242 4242 4242 4242`, any future expiry and any CVC.
4. Confirm the success page and all webhook responses are `200`.
5. Record the `sub_...` ID and current period end.
6. Refresh the success page. Replay of an existing webhook must not add rows.

Expected:

- One local subscription with `active`, `paid`, Basic and the Basic Price.
- One active `subscription` enrollment with Basic access.
- One paid initial Invoice payment.
- Basic card says `Twój plan`.
- Premium card offers the Stripe upgrade.
- Lifetime offers for this course are blocked.
- The other course remains purchasable.

## 8. Immediate Basic-to-Premium upgrade

1. Choose Premium from the Opiekun pricing page.
2. Confirm Portal displays an immediate prorated charge before approval.
3. Approve the change.
4. Confirm `/success` says Premium is active.
5. Confirm pricing and `/panel#platnosci` show Premium.

Expected:

- `invoice.paid` and `customer.subscription.updated` return `200`.
- Same subscription and enrollment row IDs.
- Subscription and enrollment become Premium.
- A paid proration Invoice payment exists.
- No pending schedule fields exist.

## 9. Schedule, release and recreate downgrade

1. From Premium, choose Basic.
2. Wolfmed creates the Stripe Subscription Schedule and returns to `/success`.
3. Confirm `/success` says the downgrade is scheduled, not already active.
4. Verify pricing and `/panel#platnosci` show the effective date.

Expected before renewal:

- Premium access remains active.
- Subscription and enrollment remain Premium.
- `schedule_id`, `pending_offer_key`, `pending_access_tier`,
  `pending_price_id` and `pending_change_at` are populated.
- The pending tier is Basic.
- Schedule webhooks return `200`.

Cancel the scheduled downgrade from `/panel#platnosci` in Wolfmed.

Expected:

- `subscription_schedule.released` returns `200`.
- Pending fields clear.
- Premium remains active.

Schedule Basic again and leave it pending for the Test Clock transition.
Confirm Stripe created a new `sub_sched_...` ID and `/success` reports the
scheduled Basic change rather than the current Premium state.

## 10. Advance through the downgrade renewal

1. Read `current_period_end` from Stripe or the database.
2. Advance the Test Clock slightly past it.
3. Wait until the simulation is `Ready`.
4. If Stripe shows the renewal Invoice as Draft, advance another hour.
5. Wait for `invoice.paid` and all schedule/subscription webhooks to return
   `200`.
6. Refresh Wolfmed only after the Invoice is paid.

Expected:

- Same subscription and enrollment row IDs.
- Subscription and enrollment now show Basic.
- Current Price and offer are Basic.
- Pending fields clear.
- Wolfmed releases the completed downgrade schedule after `invoice.paid`.
- One new paid renewal Invoice payment has `sessionId = NULL`.
- No duplicate subscription or enrollment exists.
- Premium features are no longer available.

Do not judge access while a Test Clock renewal Invoice is still Draft. The final
state is checked after Stripe finalizes and pays it.

## 11. Failed renewal

1. Add test card `4000 0000 0000 0341` to the simulated Customer.
2. Copy its attached `pm_...` ID.
3. Make it the Subscription's default payment method:

```powershell
stripe subscriptions update sub_... -d "default_payment_method=pm_..."
```

4. Advance slightly past the next `current_period_end`.
5. Wait for `Ready`, then advance another hour if the Invoice is Draft.

Expected:

- `invoice.payment_failed` and `customer.subscription.updated` return `200`.
- Stripe Subscription is `past_due`.
- Local Invoice payment is `failed`.
- Enrollment is inactive and course access is revoked immediately.
- Subscription and enrollment rows are not duplicated.

The PaymentMethod must be attached to the same Customer before it can be selected.

## 12. Payment recovery

1. Add `4242 4242 4242 4242` to the same simulated Customer.
2. Copy its attached `pm_...` ID.
3. Set it as the Subscription default:

```powershell
stripe subscriptions update sub_... -d "default_payment_method=pm_..."
```

4. Open the failed Invoice in Stripe and select Retry payment.

Expected:

- `invoice.paid` and `customer.subscription.updated` return `200`.
- Stripe and local Subscription return to `active`.
- The existing failed Invoice payment row changes to `paid`.
- Enrollment and course access reactivate.
- No duplicate payment for that Invoice exists.

Remove the failing card only after the valid card is attached and selected.

## 13. Period-end cancellation

1. Open billing settings and the default Customer Portal.
2. Cancel the Subscription at period end.
3. Confirm Wolfmed shows the cancellation/end date and access remains active.
4. Advance the Test Clock slightly past `current_period_end`.
5. Wait for `Ready` and webhook processing.

Expected:

- `customer.subscription.deleted` returns `200`.
- Local Subscription is ended/canceled.
- Enrollment is inactive and course access is gone.
- Lifetime and monthly offers become available again.
- No automatic refund is created.

## 14. Second-course isolation

Choose one setup before testing:

- Pielęgniarstwo-only smoke test: use a fresh user/Test Clock and run steps 1-5.
  The cross-course state check does not apply because the user owns no Opiekun
  access.
- Cross-course isolation test: use one user who owns both courses. Record both
  courses' subscription/enrollment/payment state before testing, run steps 1-5,
  then confirm the Opiekun records did not change.

Pielęgniarstwo smoke test:

1. Basic monthly Checkout at 49.99 PLN.
2. Immediate Premium upgrade at 79.99 PLN with proration.
3. Premium-to-Basic scheduled downgrade.
4. Release the downgrade once.
5. Retrieve the dedicated Pielęgniarstwo upgrade configuration through the API
   with `features.subscription_update.products` expanded. Confirm it contains
   only the Basic and Premium Products, each with its current Price and quantity
   adjustment disabled. Users don't open this configuration directly; Wolfmed
   applies it only to the upgrade confirmation session.

```powershell
$configId = 'bpc_...' # STRIPE_PIELEGNIARSTWO_PORTAL_CONFIGURATION_ID
(stripe get "/v1/billing_portal/configurations/$configId" `
  -d "expand[]=features.subscription_update.products" |
  ConvertFrom-Json).features.subscription_update.products |
  ConvertTo-Json -Depth 6
```

Expected: exactly two entries. Their Price IDs match
`STRIPE_PIELEGNIARSTWO_BASIC_MONTHLY_PRICE_ID` and
`STRIPE_PIELEGNIARSTWO_PREMIUM_MONTHLY_PRICE_ID`; both entries show
`adjustable_quantity.enabled: false`.
6. For the cross-course setup only, confirm Wolfmed still shows the same Opiekun
   tier and pricing status. Confirm its enrollment and payment records retain the
   same IDs, tier, active/payment state and source. Pielęgniarstwo actions must not
   create or update an Opiekun subscription, schedule or Invoice.

If Opiekun access was purchased only after steps 1-5, first confirm that purchase
did not alter the existing Pielęgniarstwo subscription. Then schedule and release
one Pielęgniarstwo downgrade and confirm the Opiekun lifetime enrollment remains
unchanged. This verifies isolation in both directions.

One full clock lifecycle can be run for Opiekun and a plan-change smoke test for
Pielęgniarstwo. Repeat the full lifecycle for both only when validating production
Stripe configuration.

## 15. Finish and report

Before finishing the simulation, save:

- `clock_...`, `cus_...` and `sub_...` IDs.
- Webhook event IDs and any non-`200` response.
- Database results after each checkpoint.
- Screenshots of upgrade proration, scheduled downgrade and cancellation.

Finishing a simulation deletes its clock-bound Customer and Subscription. Inspect
Stripe and the database first.

Acceptance passes when:

- Every handled event returns `200`.
- Subscription/enrollment IDs stay stable through lifecycle changes.
- Invoice IDs remain unique and recovery updates the failed row.
- Premium remains active until the downgrade date.
- Scheduled change can be released and recreated.
- Renewal activates Basic exactly once.
- Failure revokes access and recovery restores it.
- Cancellation removes access only at period end.
- Both course upgrade Portal configurations stay course-scoped.

## Development acceptance record

Accepted 2026-08-18:

- Opiekun: Basic purchase, prorated Premium upgrade, downgrade scheduling,
  release, recreation, renewal transition to Basic, failed renewal, automatic
  retry recovery and period-end cancellation passed.
- Releasing and recreating a downgrade produced a new Schedule; stale
  idempotency responses no longer reused the released Schedule.
- The Basic transition releases the completed Schedule, so later upgrades remain
  available.
- Failed-payment recovery updated the same Invoice payment row from `failed` to
  `paid` and reactivated the same enrollment.
- Pielęgniarstwo: purchase, upgrade, downgrade/release and course-scoped Portal
  isolation passed. A later Opiekun lifetime purchase did not alter
  Pielęgniarstwo state.
- All observed handled Stripe webhooks returned `200`; static checks and 203 tests
  passed.

Open product decision: immediate failed-payment revocation blocks guarded
`/panel#platnosci`. Choose a recovery CTA, separate authenticated recovery route
or retry grace period before production. Course content must stay blocked while
unpaid.

## Troubleshooting

- Upgrade button fails: verify the dedicated `bpc_...`, separate Basic/Premium
  Products, one current Price each, quantity disabled and immediate proration.
- Downgrade button fails: verify both Prices are active flat-rate monthly Prices
  for separate Products and restart Wolfmed after changing their environment IDs.
- Customer has no Test Clock: create a new Customer inside the simulation and
  relink the fresh Wolfmed user.
- Webhook `400`: replace the signing secret and restart Wolfmed.
- Invoice remains Draft: wait for `Ready`, advance another hour, then recheck.
- UI appears stale: wait for `<-- 200 POST`, then refresh.
- PaymentMethod error: attach it to the same Customer before selecting it.
- Unexpected existing access: use a fresh Clerk user with no lifetime enrollment.

## Automated checks

```text
pnpm exec tsc --noEmit
pnpm lint
pnpm test
```

Unresolved questions: failed-payment recovery UX.

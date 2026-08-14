# Stripe subscription testing guide

Status: required setup before starting Wolfmed with subscription code.

Parent plan: [`41-stripe-payment-plan.md`](./41-stripe-payment-plan.md).

## Required order

Do not start the development server before steps 1-3 are complete. Subscription
tables and monthly Stripe Prices are required at runtime.

### 1. Migrate the development database

Create a Neon backup/branch. Run the M11 preflight queries from
[`DB_MIGRATIONS.md`](../../DB_MIGRATIONS.md). Every duplicate query must return
zero rows.

Apply the schema to development only:

```text
pnpm db:push
```

Do not use `db:push` on production.

### 2. Configure Stripe test mode

Create one recurring Product per course. Add Basic and Premium monthly Prices:

| Price | Amount | Lookup key |
|---|---:|---|
| Opiekun Basic | 19.99 PLN/month | `opiekun_basic_monthly` |
| Opiekun Premium | 49.99 PLN/month | `opiekun_premium_monthly` |
| Pielegniarstwo Basic | 49.99 PLN/month | `pielegniarstwo_basic_monthly` |
| Pielegniarstwo Premium | 79.99 PLN/month | `pielegniarstwo_premium_monthly` |

Set the four test Price IDs:

```ini
STRIPE_OPIEKUN_BASIC_MONTHLY_PRICE_ID=price_...
STRIPE_OPIEKUN_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PIELEGNIARSTWO_BASIC_MONTHLY_PRICE_ID=price_...
STRIPE_PIELEGNIARSTWO_PREMIUM_MONTHLY_PRICE_ID=price_...
```

Configure the default Customer Portal for payment methods, billing details,
invoices and period-end cancellation. Keep plan switching disabled there.

Create two dedicated Customer Portal configurations: one per course. For each:

1. Enable plan switching.
2. Add only that course's Basic and Premium monthly Prices.
3. Keep quantity changes disabled.
4. Select prorated charges and credits.
5. Invoice prorations immediately at update time.

Set their `bpc_...` IDs:

```ini
STRIPE_OPIEKUN_PORTAL_CONFIGURATION_ID=bpc_...
STRIPE_PIELEGNIARSTWO_PORTAL_CONFIGURATION_ID=bpc_...
```

The app uses these configurations only for a direct, course-scoped Basic to
Premium confirmation flow. It never exposes unrestricted cross-course switching.

### 3. Start the local webhook listener

```text
stripe listen --events checkout.session.completed,invoice.paid,invoice.payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/webhooks/stripe
```

Copy its `whsec_...` value to `STRIPE_WEBHOOK_SECRET`.

### 4. Start Wolfmed

```text
pnpm dev
```

The pricing page must now show `Miesięcznie` and `Na zawsze` without any feature
flag.

## First sandbox test

1. Open each course and verify all four monthly amounts.
2. Buy Opiekun Basic monthly with Stripe test card `4242 4242 4242 4242`.
3. Confirm success page, one subscription row, one invoice payment and one active
   `subscription` enrollment grant.
4. Refresh success and replay the webhook. Counts must not increase.
5. Confirm Basic shows `Twój plan`, lifetime is blocked, and Premium shows
   `Ulepsz w Stripe`.
6. Open Premium upgrade. Confirm Stripe shows the proration before approval.
7. Approve it. Confirm `/success` shows `Plan Premium jest aktywny`, then opens
   `/panel/nauka`. Confirm one subscription and enrollment changed to Premium;
   no duplicate grant was created. Webhooks must return `200`.
8. Confirm the other course remains purchasable.
9. Open `/panel`; verify the plan card, renewal date and billing-settings link.
10. Open `/panel/ustawienia`; verify status, renewal date and Portal button.
11. Cancel in Portal; access must remain until period end.
12. After period end, confirm lifetime offers become available again.
13. Use a Stripe Test Clock to verify renewal, payment failure and recovery.

Refunds on old subscription invoices remain out of scope.

## Automated checks

```text
pnpm exec tsc --noEmit
pnpm lint
pnpm test
```

Unresolved questions: none.

## Wolfmed

Edukacja medyczna może być jeszcze łatwiejsza.

# Local Development

Use Clerk Development and Stripe sandbox/test mode only. The app already
contains the Clerk user sync, Stripe Checkout, subscriptions, Customer Portal,
course entitlements, and signed webhook handlers.

Copy `.env.example` to `.env`, then fill the Clerk and Stripe values. Required
monthly-test values are the four `*_MONTHLY_PRICE_ID` variables, both Portal
configuration IDs, and both webhook secrets.

Full setup and acceptance flow:

- [Stripe subscription testing guide](.claude/docs/43-stripe-subscription-testing-guide.md)
- [Auth and payments flow](.claude/docs/30-flows-auth-payments.md)

### Test Clerk and Stripe webhooks

Run each process in a separate terminal.

1. Start Wolfmed:

```bash
pnpm dev
```

2. Forward Clerk `user.created` and `user.deleted` events:

```bash
npx clerk webhooks listen --forward-to http://localhost:3000/api/webhooks/clerk
```

Set the listener endpoint's signing secret as `CLERK_WEBHOOK_SECRET`, then restart
Wolfmed if the value changed.

3. Forward every Stripe event handled by Wolfmed:

```bash
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.paid,invoice.payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,subscription_schedule.created,subscription_schedule.updated,subscription_schedule.released,subscription_schedule.canceled,subscription_schedule.completed,subscription_schedule.aborted,charge.refunded,refund.created,refund.updated,refund.failed,charge.dispute.created,charge.dispute.closed --forward-to http://localhost:3000/api/webhooks/stripe
```

Copy the listener's `whsec_...` value to `STRIPE_WEBHOOK_SECRET`, then restart
Wolfmed if the value changed. Use Stripe sandbox/test mode only.

A successful delivery appears in the listener as `<-- 200 POST`. A `400` usually
means the local signing secret is missing or does not match the active listener.
   
## Database Management

### Working with Neon Database Branches

1. Create a new branch:
```bash
neonctl branches create --name [branch-name]
```

2. Get connection string for the branch:
```bash
neonctl connection-string --branch [branch-name]
```

3. Update your `.env.local`:
```env
NEON_DATABASE_URL="your-new-branch-connection-string"
```

## Important Notes

- Keep `.env.local` synchronized with the active Neon branch and webhook secrets.
- A new Stripe listener can issue a new `whsec_...`; restart Wolfmed after updates.
- The CLI relays do not require Ngrok.

## Troubleshooting

- If webhooks aren't working, verify:
  1. Wolfmed is running on port 3000.
  2. Both CLI listeners are still running.
  3. `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` match those listeners.
  4. Stripe CLI is using the intended sandbox account.

### Create a test user

1. Start both listeners and Wolfmed.
2. Open `/sign-up` and create a fresh user with a test email.
3. Confirm the Clerk listener shows `user.created` with HTTP `200` and that the
   user appears in `wolfmed_users`.
4. Open the course pricing page and buy Basic or Premium with Stripe card
   `4242 4242 4242 4242`.
5. Use `/panel#platnosci` to verify the active plan, upgrade to Premium, or
   schedule a Premium-to-Basic downgrade.

For renewals, failed payments, recovery, cancellations, Test Clocks, and
cross-course isolation, follow the full guide above. Do not create a Stripe
subscription manually; let Wolfmed Checkout create it so local ownership and
entitlements are linked correctly.

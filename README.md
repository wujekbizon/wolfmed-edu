## Wolfmed

Edukacja medyczna może być jeszcze łatwiejsza.

# Local Development

## Test Clerk and Stripe webhooks

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

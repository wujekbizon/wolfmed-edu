# English Basic bonus

Opiekun Medyczny and Pielęgniarstwo Premium include Angielski medyczny Basic.
Lifetime purchases and Basic-to-Premium lifetime upgrades grant a permanent bonus.
Premium subscriptions grant the bonus for their paid period. Scheduling cancellation
keeps access until that period ends. Downgrade, cancellation or paid-period expiry
removes only that subscription's bonus; paid renewal restores it. Failed invoices
do not revoke an existing bonus early or extend its paid period.
Lifetime bonus grants are not changed by the refund/dispute handler.

The database remains the sole access source. Bonus rows use `premium_bundle` with
source ID `<parent source type>:<parent source ID>`. Existing source uniqueness
makes webhook retries idempotent. Multiple bonus sources and independently bought
English remain separate. Existing effective-access queries and checkout guards
block duplicate English Basic purchases and subscriptions. Pricing shows
`W pakiecie Premium`; the course hero links to learning.

No schema change or new Stripe Product/Price is required.

## Existing users

Deploy bonus-aware code first. Confirm the English course is active in the target
database and `.env` points to that database. Prepare a database backup before apply.

Preview:

```text
pnpm exec tsx --env-file=.env scripts/migrate-english-bonuses.ts --dry-run
```

Apply after reviewing the preview:

```text
pnpm exec tsx --env-file=.env scripts/migrate-english-bonuses.ts --apply
```

Default is dry-run. It reports eligible users/grants, existing/missing bonuses and
inserted rows. Apply also repairs timestamps on previously migrated bundle rows
from their parent enrollment (important for PostgreSQL timestamps without timezone).
It covers active Premium purchases, upgrades, legacy and manual
grants plus paid, unexpired subscription enrollments. Revoked, inactive, expired
and future lifetime grants are excluded. Missing legacy source fields use the
original enrollment UUID. Apply locks source rows during backfill, uses the same
eligibility helper as webhooks and inserts only missing bonuses. Reruns add no
duplicates. Existing English grants, payments and subscriptions are untouched.

Verify English Basic appears in eligible users' courses and both billing models
show the included label. Cancel one subscription and confirm only its bonus ends;
another valid bonus or English purchase still permits learning. English Premium
remains unavailable.

If a user already pays for English separately, the bonus does not cancel or change
that subscription. Billing remains managed through the existing Stripe Portal.

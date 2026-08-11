# Business Flow: Auth & Payments

[← Back to index](./README.md)

Each flow below is traced end-to-end: what the user does, what UI/hook fires, what server code runs, what gets written to the DB, and what the user sees back. File paths point at the exact implementation. Structural/page-level context lives in the `1x-pages-*` docs — this doc is the "what actually happens when..." narrative on top of it.

---

## Flow 1 — User registers an account

There is **no custom registration form**. Account creation is entirely delegated to Clerk and happens as a side effect of Clerk's own sign-up flow, picked up asynchronously by a webhook.

1. User visits `/sign-up` (`src/app/sign-up/[[...sign-up]]/page.tsx`) — a thin wrapper around Clerk's `<SignUp path="/sign-up" fallbackRedirectUrl="/" />`. All credential collection, email verification, and OAuth are handled entirely by Clerk's hosted component; the app has no form, no schema, no validation of its own here.
2. Clerk creates the account and fires a `user.created` webhook to `POST /api/webhooks/clerk` (`src/app/api/webhooks/clerk/route.ts`).
3. The route verifies the webhook is genuinely from Clerk via **Svix signature verification** (`svix-id`/`svix-timestamp`/`svix-signature` headers + `CLERK_WEBHOOK_SECRET`) — this is a different trust boundary than user-session auth, since no user is "logged in" to this request.
4. On `user.created`: calls `insertUserToDb()` (`src/server/db.ts:9`) inside a transaction, inserting the `users` row with:
   - `userId` = the Clerk id (the app's user identity is always the Clerk id, never its own generated one, for this table's FK purposes)
   - `username` = `User-${randomUUID().slice(0,8)}` (a throwaway default, changeable later via `updateUsername`)
   - `motto` = `generateRandomMotto()` (`src/helpers/generateRandomMotto.ts`) — a random starter motto
5. No Clerk course metadata is initialized; PostgreSQL is the enrollment source of truth.
6. User is redirected to `/` (`fallbackRedirectUrl`). At this point they have an account but **zero course enrollments**, so `/panel` redirects them to `/kierunki?from=panel` (see `panel/layout.tsx`, [`00-architecture.md`](./00-architecture.md)). Dismissing that banner removes the query parameter; no global banner state survives navigation.

**Files**: `src/app/sign-up/[[...sign-up]]/page.tsx`, `src/app/api/webhooks/clerk/route.ts`, `src/server/db.ts`, `src/helpers/generateRandomMotto.ts`.

## Flow 2 — User signs in

1. User visits `/sign-in` (`src/app/sign-in/[[...sign-in]]/page.tsx`) — same pattern, wraps Clerk's `<SignIn path="/sign-in" fallbackRedirectUrl="/" />`.
2. Clerk handles credential verification, session cookie issuance, and (if configured) MFA entirely client-side/via its own backend. The app never sees a password.
3. No `user.signed_in` webhook handling exists in this codebase — nothing server-side reacts to a sign-in event itself. Every subsequent request simply carries a valid Clerk session, read via `auth()`/`currentUser()` (Clerk's Next.js SDK) wherever a page or action needs the user.
4. Many flows redirect **to** `/sign-in` when they hit an unauthenticated request mid-action, always with a `redirect_url` back to where the user was headed — e.g. `createCheckoutSession` (Flow 3 below) does `redirect('/sign-in?redirect_url=...')` if `userId` is missing.

**Files**: `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/helpers/requireUser.ts` (the server-side guard every gated layout calls).

## Flow 3 — User purchases/enrolls in a course (Stripe)

The full loop: client-initiated checkout → Stripe-hosted payment → asynchronous webhook completes the purchase. Two separate requests, at two separate times, on two separate trust levels.

**Part A — starting checkout** (`src/app/kierunki/[slug]/page.tsx` → pricing form):
1. Form submits only a server-known `offerKey`. Zod, authentication and rate
   limiting run before Stripe or DB mutation.
2. Server validates the configured Stripe Product/Price and checks DB access.
   An active lifetime Basic owner receives only the course's difference-price
   Premium upgrade; forged upgrade requests are rejected.
3. A local `stripe_checkout_orders` row snapshots owner, offer, course, tier,
   Price, amount and currency. A unique active key permits one lifetime attempt
   per user/course.
4. Concurrent requests reuse the same order. Checkout creation uses
   `checkout:<orderId>` as Stripe's idempotency key, so they also reuse one Session.
5. Session metadata carries `orderId`. Course/tier metadata remains temporarily
   for already-open legacy Sessions only and is not trusted by the new webhook.
6. Cancel redirects with the order UUID. The authenticated canceled page expires
   the Stripe Session and releases the local active-order key.

**Part B — completing the purchase** (`POST /api/webhooks/stripe`):
1. Route verifies the raw-body Stripe signature and handles completed,
   asynchronous success and asynchronous failure Checkout events.
2. Handler retrieves the canonical Session and line items from Stripe, resolves
   owner through local `orderId`, and compares Session, user, Customer, Price,
   amount, currency, mode and quantity with the immutable order snapshot.
3. One DB transaction locks fulfillment per user/course, inserts the unique event
   marker, upserts the payment, updates order state, creates one source grant per
   paid Session and initializes storage once. A lifetime upgrade also rechecks its
   active Basic grant. Any failure rolls everything back and returns `500` for retry.
4. Event, Session, PaymentIntent, Invoice and entitlement-source uniqueness make
   replay, concurrent and out-of-order delivery idempotent. Effective access uses
   the highest active grant, so revoking an upgrade later falls back to Basic.
5. The webhook performs no Clerk call, email identity lookup, metadata mirror,
   model work or `testLimit` reward. Stripe keeps billing PII; DB access is
   authoritative.

**What the user experiences**: the hosted Checkout journey is unchanged. The
actual panel access reads DB grants. Navbar/Drawer do not read Clerk course metadata.

**Files**: `src/actions/stripe.ts`, `src/server/payments/*`,
`src/app/api/webhooks/stripe/route.ts`, `src/server/db/schema.ts`.

**Part C — refunds and disputes** (`POST /api/webhooks/stripe`):
1. Signed Charge, Refund, and Dispute events trigger a fresh canonical Stripe read.
2. Successful refunds are summed across the PaymentIntent. Pending/failed refunds
   do not count; a partial refund updates the ledger without access loss.
3. A full refund or aggregate lost dispute deactivates only the entitlement whose
   source matches that paid Checkout Session. Other grants remain active, so a
   refunded Premium upgrade falls back to its lifetime Basic grant.
4. Won/resolved disputes restore that grant unless a full refund still requires
   revocation. Event marker, payment state and grant state commit together.

## Flow 4 — User deletes their account

1. Triggered entirely from **Clerk's side** (user deletes their account via Clerk's account UI, or an admin removes them in the Clerk dashboard) — there is no in-app "delete my account" button in this codebase.
2. Clerk fires `user.deleted` to the same `POST /api/webhooks/clerk` handler as Flow 1.
3. `deleteUserFromDb(id)` (`src/server/db.ts:29`):
   - `eraseUserMemory(id)` (`src/server/memory/erase.ts`) runs **first and explicitly** — the per-user memory tables (`memPreferences`, `memFacts`, `memEpisodes`, `memTraces`) are **not** foreign-keyed to `users`, so they would silently survive a `users` row deletion otherwise. This is called out in the source as a GDPR requirement, not an optimization. **Correction (round 14 doc-test, simulating a "was memPolicies actually erased too" compliance question)**: an earlier version of this doc listed `memPolicies` alongside these four as if it received the same treatment — it does not, and shouldn't: `memPolicies` (`src/server/db/memory-schema.ts`) has no `userId` column at all, only a `tenantId` (default `'wolfmed'`) — it's global pedagogical/product configuration, not personal data, so there's nothing user-scoped in it to erase. `memDeletionEvents` (the erasure audit log itself) is also deliberately not erased, for the obvious reason. Facts/episodes are tombstoned in place (content wiped, `status: 'revoked'`) rather than hard-deleted, to keep the self-referential supersession FK valid; preferences/traces are hard-deleted.
   - `db.delete(users).where(eq(users.userId, id))` — every other user-owned table (`notes`, `materials`, `flashcardDecks`, `forumPosts`, `diagnozyProgress`, `learningPlans`, `libChunks`, etc.) cascades automatically via `onDelete: "cascade"` FKs — see [`01-database-schema.md`](./01-database-schema.md) → "Cascade ownership" for the full list.
4. No confirmation step or grace period exists **in this codebase** for this path — the webhook is the single trigger, and it deletes immediately. (Any "are you sure?" UX would live entirely on Clerk's side of the account-deletion flow, outside this app.)

**Files**: `src/app/api/webhooks/clerk/route.ts`, `src/server/db.ts`, `src/server/memory/erase.ts`.

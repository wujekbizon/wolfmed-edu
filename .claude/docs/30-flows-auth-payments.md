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
5. Also sets Clerk `publicMetadata.ownedCourses = []` on the user — this is the fast-path signal the Navbar reads to decide whether to gray out the `/panel` nav link (see [`10-pages-public.md`](./10-pages-public.md)); it is **not** the access-control source of truth (that's the DB `courseEnrollments` table, checked separately).
6. User is redirected to `/` (`fallbackRedirectUrl`). At this point they have an account but **zero course enrollments**, so `/panel` will redirect them to `/kierunki?from=panel` if they try to enter it (see `panel/layout.tsx`, [`00-architecture.md`](./00-architecture.md)).

**Files**: `src/app/sign-up/[[...sign-up]]/page.tsx`, `src/app/api/webhooks/clerk/route.ts`, `src/server/db.ts`, `src/helpers/generateRandomMotto.ts`.

## Flow 2 — User signs in

1. User visits `/sign-in` (`src/app/sign-in/[[...sign-in]]/page.tsx`) — same pattern, wraps Clerk's `<SignIn path="/sign-in" fallbackRedirectUrl="/" />`.
2. Clerk handles credential verification, session cookie issuance, and (if configured) MFA entirely client-side/via its own backend. The app never sees a password.
3. No `user.signed_in` webhook handling exists in this codebase — nothing server-side reacts to a sign-in event itself. Every subsequent request simply carries a valid Clerk session, read via `auth()`/`currentUser()` (Clerk's Next.js SDK) wherever a page or action needs the user.
4. Many flows redirect **to** `/sign-in` when they hit an unauthenticated request mid-action, always with a `redirect_url` back to where the user was headed — e.g. `createCheckoutSession` (Flow 3 below) does `redirect('/sign-in?redirect_url=...')` if `userId` is missing.

**Files**: `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/helpers/requireUser.ts` (the server-side guard every gated layout calls).

## Flow 3 — User purchases/enrolls in a course (Stripe)

The full loop: client-initiated checkout → Stripe-hosted payment → asynchronous webhook completes the purchase. Two separate requests, at two separate times, on two separate trust levels.

**Part A — starting checkout** (`src/app/kierunki/[slug]/page.tsx` → `PricingSection` → a per-tier "Buy" form):
1. Form submits `createCheckoutSession` (`src/actions/stripe.ts:10`) with `priceId`, `courseSlug`, `accessTier` in `FormData`.
2. If not signed in: `redirect('/sign-in?redirect_url=/kierunki/<slug>')` — the purchase resumes once they're back.
3. `getOrCreateStripeCustomer(userId)` (`src/server/stripe.ts:14`) — looks up `users.stripeCustomerId`; if absent, fetches the user's email/name from Clerk and creates a Stripe Customer with an **idempotency key** (`customer-create-<userId>`) so a double-click or race can't create two Stripe customers for one user, then persists the id back onto `users.stripeCustomerId`.
4. Creates a Stripe Checkout Session (`mode: 'payment'`, Polish locale, tax ID collection, `client_reference_id: userId`, `metadata: { courseSlug, accessTier }`, `success_url=/success?session_id=...`, `cancel_url=/canceled`). **Unlike the customer-creation call one line above, this `stripe.checkout.sessions.create()` call has no idempotency key** — verified by grepping `stripe.ts`/`actions/stripe.ts` for `idempotencyKey`, only one hit. A rapid double-submit of the "Buy" form (double-click before the first `redirect()` navigates away, or two tabs racing) can create **two distinct Checkout Sessions**. This is lower-severity than it sounds — completing a payment still requires the user to separately pay on each session's hosted page, so it's not an automatic double-charge — but if a user *did* complete both (e.g. two tabs, pays in each), each produces its own `checkout.session.completed` event with its own event id, so the webhook's `processedEvents` idempotency check (step 2 below) does **not** catch this: two `payments` rows and two rounds of `processPurchaseRewards` (a second `+1000 testLimit` bump) would both land. `enrollUserAction` itself is safe either way (update-if-exists, not insert-only), so course access wouldn't double-grant incorrectly — the exposure is specifically financial/reward double-counting, not access-control.
5. `redirect(session.url)` — the user leaves the app entirely for Stripe's hosted checkout page. Nothing has been written to `courseEnrollments` yet.
6. User lands on `/success` or `/canceled` (both static pages, see [`10-pages-public.md`](./10-pages-public.md)) — **neither page itself grants access**; they're purely informational. `/success` can render before the webhook below has even landed, since Stripe redirects the browser immediately on payment success while the webhook fires as a separate, out-of-band server-to-server call.

**Part B — completing the purchase** (`POST /api/webhooks/stripe`, `src/app/api/webhooks/stripe/route.ts`):
1. Verifies the webhook signature via `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`.
2. On `checkout.session.completed`:
   - **Idempotency check**: looks up `event.id` in `processedEvents` — if already processed, does nothing (Stripe redelivers webhooks; this makes redelivery safe).
   - **Resolves the user**: primarily via `client_reference_id` set in Part A step 4; if somehow absent, falls back to a live Clerk API lookup by the checkout session's email. No resolvable user → returns `500` so Stripe retries later rather than silently losing the payment.
   - `backfillStripeCustomerId()` (`src/server/stripe.ts:46`) — links the Stripe customer id onto `users` even on the email-fallback path, but only if `users.stripeCustomerId` is still `NULL` (won't clobber an existing link).
   - If `mode === 'payment'`: `insertPayment()` (`src/server/db.ts:133`) records the `payments` row (amount, currency, status, Stripe ids).
   - If `courseSlug` is present and `payment_status === 'paid'`: `enrollUserAction(userId, courseSlug, accessTier)` (`src/actions/course-actions.ts:89`) — inserts or reactivates a `courseEnrollments` row (**this is the actual access grant** — everything downstream that checks `checkCourseAccessAction`/`checkPremiumAccessAction` reads this table). Also mirrors the course slug into Clerk `publicMetadata.ownedCourses` for the Navbar's fast-path UI check.
   - `processPurchaseRewards(userId, event.id)` (`src/server/db.ts:80`) — inside one transaction: bumps `users.testLimit` by `+1000`, ensures a `userLimits` row exists (`storageLimit: 20_000_000` / 20 MB, `onConflictDoNothing` so a repeat purchase doesn't reset an existing quota), and records the event in `processedEvents` for the idempotency check above.
3. Returns `{ received: true }`. If any step before this throws, Stripe will retry the webhook — so a transient DB error becomes an automatic retry rather than a silently lost purchase (aside from the `insertPayment` failure path, which returns `500` explicitly rather than continuing to enroll on an unrecorded payment).

**What the user actually experiences**: click "Buy" → redirected to Stripe → pay → redirected back to `/success` — typically the webhook has already landed by the time they navigate back and check `/panel/kursy`, but there's no hard guarantee of ordering, so `/success` deliberately doesn't claim "you now have access," it's just a thank-you page.

**Files**: `src/actions/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/server/stripe.ts`, `src/server/db.ts`, `src/actions/course-actions.ts`.

## Flow 4 — User deletes their account

1. Triggered entirely from **Clerk's side** (user deletes their account via Clerk's account UI, or an admin removes them in the Clerk dashboard) — there is no in-app "delete my account" button in this codebase.
2. Clerk fires `user.deleted` to the same `POST /api/webhooks/clerk` handler as Flow 1.
3. `deleteUserFromDb(id)` (`src/server/db.ts:29`):
   - `eraseUserMemory(id)` (`src/server/memory/erase.ts`) runs **first and explicitly** — the memory tables (`memPolicies`, `memPreferences`, `memFacts`, `memEpisodes`, `memTraces`) are **not** foreign-keyed to `users`, so they would silently survive a `users` row deletion otherwise. This is called out in the source as a GDPR requirement, not an optimization.
   - `db.delete(users).where(eq(users.userId, id))` — every other user-owned table (`notes`, `materials`, `flashcardDecks`, `forumPosts`, `diagnozyProgress`, `learningPlans`, `libChunks`, etc.) cascades automatically via `onDelete: "cascade"` FKs — see [`01-database-schema.md`](./01-database-schema.md) → "Cascade ownership" for the full list.
4. No confirmation step or grace period exists **in this codebase** for this path — the webhook is the single trigger, and it deletes immediately. (Any "are you sure?" UX would live entirely on Clerk's side of the account-deletion flow, outside this app.)

**Files**: `src/app/api/webhooks/clerk/route.ts`, `src/server/db.ts`, `src/server/memory/erase.ts`.

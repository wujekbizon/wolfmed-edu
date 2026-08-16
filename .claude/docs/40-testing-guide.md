# Manual Testing Guide

[← Back to index](./README.md)

A growing set of manual QA test cases, derived directly from the flow docs (`3x-flows-*`) — each case cites the doc section it came from, so if a test fails, that's exactly where to start reading the implementation. This guide is a byproduct of the documentation-testing cycle (see [`reports/`](./reports/)): every round that traces a flow to check the docs' findability also produces the test case for that flow, so the two efforts share the same work.

**How to add to this guide**: when tracing a new flow for a doc-test report, write the manual test case here at the same time — preconditions, steps, expected result, and at least one edge case pulled from the "why" details the flow doc captured (race conditions, idempotency, access gates). A flow doc that doesn't yield a testable edge case here is a signal it may be under-detailed.

---

## TC-1 — Take a timed theory test (happy path + time-expiry race)

**Source**: [`31-flows-testing.md`](./31-flows-testing.md) → Flow 1.

**Preconditions**: signed-in user, enrolled in at least one course, no other `ACTIVE` test session.

**Happy path**:
1. Go to `/panel/testy`, pick a category.
2. Confirm a new session starts (`startTestAction`) and you land on `/panel/testy/[category]?sessionId=...` with a visible countdown.
3. Answer all questions, submit before time runs out.
4. Expect: redirected/shown a result, `/panel/wyniki` shows the new completed test, dashboard aggregate stats (`testsAttempted`, average score) updated.

**Edge case A — double session**: while a session is active, open `/panel/testy` in a second tab and try to start another test in the *same category or a different one*. Expect: rejected with "Masz już aktywną sesję testową..." (per `startTestAction`'s active-session check).

**Edge case B — expiry race**: start a test, let the visible countdown hit zero **without submitting**, then submit anyway (e.g. by re-enabling a disabled submit button via devtools, or just waiting past `durationMinutes` and submitting a queued request). Expect: submission is rejected server-side ("czas się skończył") and the session is marked `EXPIRED` — the client-side timer must not be the only thing preventing a late submit. This is the single highest-value test in this guide, since it's the one case where a client-only bug would be invisible in normal use but exploitable.

**Edge case C — abandoned tab**: start a test, close the tab without submitting. Expect: `useBeaconCleanup` fires `POST /api/session/expire` immediately (verify via network tab before closing, or check `testSessions.status` in DB shortly after) — should not require waiting for the 5-minute cron sweep.

---

## TC-2 — Purchase a course via Stripe

**Source**: [`30-flows-auth-payments.md`](./30-flows-auth-payments.md) → Flow 3.

**Preconditions**: signed-in user, not yet enrolled in the target course. Stripe test mode.

**Steps**:
1. Go to `/kierunki/[slug]`, click "Buy" on a pricing tier.
2. Complete Stripe's hosted checkout with a test card.
3. Land on `/success`.
4. Check `/panel/kursy` — the course should now show as enrolled.

**Expected DB state after webhook lands**: a `courseEnrollments` row (`isActive: true`, correct `accessTier`), a `payments` row, `users.testLimit` bumped by 1000, a `userLimits` row present (20 MB default if this was the user's first purchase), a `processedEvents` row keyed by the Stripe event id.

**Edge case A — webhook replay**: manually redeliver the same `checkout.session.completed` event from the Stripe dashboard (test mode supports this). Expect: no duplicate `payments` row, no double `testLimit` bump — the `processedEvents` idempotency check should make replay a no-op.

**Edge case B — cancel mid-checkout**: start checkout, click "back"/cancel on Stripe's page. Expect: land on `/canceled`, **no** `courseEnrollments` row created, no charge.

**Edge case C — sign-in interruption**: start the purchase flow while signed out (if reachable via a public entry point) — or simulate an expired session mid-click. Expect: redirected to `/sign-in?redirect_url=/kierunki/<slug>`, and the purchase can be resumed after signing in.

**Edge case D — double-submit the Buy form (regression test)**: rapidly double-click "Buy" or submit the same course from two tabs. Expect one active local order and one Stripe Checkout Session: both requests use the same `checkout:<orderId>` idempotency key and redirect to the same Session. Completing it creates one payment and one source entitlement; replaying the webhook changes no counts and never increases `testLimit`.

---

## TC-3 — Like/unlike a blog post

**Source**: [`34-flows-social-admin.md`](./34-flows-social-admin.md) → Flow 2.

**Preconditions**: signed-in user (the entire `/blog` segment requires auth — a signed-out visitor should never reach a blog post page at all; verify this redirect too as part of this case).

**Steps**:
1. Open any published post at `/blog/[slug]`.
2. Click the like button. Expect: count increments by 1, button shows "liked" state.
3. Click again. Expect: count decrements by 1, button returns to "not liked".
4. Reload the page. Expect: like state persists correctly (this exercises `getBlogLikeState` hydration, not just the toggle).

**Edge case — double-click race**: click the like button twice in rapid succession (faster than the round-trip). Expect: net effect is either 0 or 1 like, never 2 — the toggle is a delete-if-present/insert-if-absent, which should make this safe, but a rapid double-submit racing two reads of "does a like exist" is exactly the scenario worth stress-testing.

---

## TC-4 — Complete a procedure challenge and earn a badge

**Source**: [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 5.

**Preconditions**: enrolled in a course with procedures, a procedure with all 5 challenge types available, none yet completed for that procedure.

**Steps**:
1. Complete challenge types 1 through 4 for one procedure (via `/panel/procedury/[course]/[slug]/wyzwania/[type]`). After each, confirm a `challengeCompletions` row exists but **no** badge yet.
2. Complete the 5th and final challenge type.
3. Expect: a badge now appears (dashboard `BadgeWidget` and/or the procedure page) — this is the all-5-complete transaction firing.

**Edge case — order-steps score manipulation**: attempt to submit an order-steps challenge with a tampered `stepOrder` payload that doesn't match what was actually dragged (e.g. via devtools network replay with edited JSON). Expect: server-side scoring against the real `procedure.data.algorithm` still produces the correct (likely lower) score — the score must not be trusted from the client.

---

## TC-5 — AI tutor: source-required command with nothing to ground on

**Source**: [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md) → Flow A, Flow C.

**Preconditions**: premium account.

**Steps**:
1. In the tutor chat, ask a `/command` that requires a source (e.g. a test/quiz-generation command) about a topic **not covered by the curriculum** (something clearly out of scope, e.g. an unrelated general-knowledge topic).
2. Expect: the tutor **declines** with a message naming what's missing, rather than generating content anyway from the model's general knowledge (the `requiresSource` gate + "No source, no output" rule).
3. Repeat as a free-form question (no `/command`) on the same out-of-scope topic.
4. Expect: `getNoDataFoundMessage()` — same refusal behavior, different code path (`context.hasCanonical === false && chunks.length === 0`).

**Edge case — `@resource` overrides a corpus miss**: attach a personal note (`@notatka`) on that same out-of-scope topic and ask again. Expect: the tutor **does** answer, grounded in the attached note (`explicit_resource` mode bypasses the corpus-miss refusal, since the attachment is now the primary source) — this confirms the attachment tier is genuinely primary, not just supplementary.

---

## TC-6 — Post on the forum and see notifications clear

**Source**: [`34-flows-social-admin.md`](./34-flows-social-admin.md) → Flow 1.

**Steps**:
1. As User A, create a forum post.
2. As User B (different account), visit `/forum` — expect an unread indicator if one exists in the UI for new posts since B's last visit.
3. As User B, open the post list (triggers `markForumSeenAction('posts')`). Expect the "new posts" indicator to clear.
4. As User A, comment on their own post from a different account... (swap: as User B, comment on A's post).
5. As User A (the post's author), revisit the post. Expect the "new comments" indicator to have been showing before this visit, and clear after (`markForumSeenAction('comments')`).

**Edge case — first-ever visit seeds both columns correctly**: for a brand-new account with no `forumReadState` row yet, trigger only the "posts" seen-marker (view `/forum` but not a post detail). Expect: `lastSeenPostsAt` is set to now, but `lastSeenCommentsAt` is seeded to the epoch constant (not "now") — i.e. the comments-unread badge should still correctly reflect that this user has never looked at any comments, not silently show as caught-up. This is the exact bug the `FORUM_NOTIFICATIONS_EPOCH` trick in the source is defending against.

---

## TC-7 — Permanent account deletion and retained ledger

**Source**: [`30-flows-auth-payments.md`](./30-flows-auth-payments.md) → Flow 4.

**Preconditions**: a fresh Clerk/Stripe test account with lifetime access for one
course, one active local subscription for the other course, one active Stripe-only
subscription, uploads, memory and learning data.

**Setup**:
1. Record the fresh account's Clerk `userId` and Stripe Customer ID.
2. Through Wolfmed, buy lifetime access for one course.
3. Through Wolfmed, buy Premium monthly access for the other course using a reusable
   test card. Both purchases must belong to the same Stripe Customer.
4. In Stripe test Dashboard, open that Customer and create another active monthly
   Subscription directly. Do not use Wolfmed Checkout. Confirm it creates no new
   Wolfmed checkout-order, subscription or enrollment row; its webhook returns
   `200` as an intentionally ignored Stripe-only Subscription.
5. Create one material, lecture, note, custom test/category, like and learning plan.
   Complete one theory test and wait for its post-response memory extraction to
   create a fact and episode. Record UploadThing keys and relevant DB row counts.

**Steps**:
1. Open Clerk user profile deletion. Confirm both warnings and typed `Usuń konto`.
2. Delete the account and confirm the Clerk webhook returns `200`.
3. Expect Stripe Customer deleted and both subscriptions canceled, including the
   Stripe-only one. Re-deliver the Clerk webhook; expect `200` and no new rows.
4. Expect zero rows under the original Clerk ID in users, grants, limits, uploads,
   notes, custom tests/categories, likes, learning data and all memory tables.
   UploadThing material/lecture keys must also be gone.
5. Facts/episodes and the deletion audit may remain only under random `deleted:*`
   IDs with erased content. Preferences/traces remain absent.
6. Payment rows remain with amount/currency/date/offer and Stripe transaction,
   refund/dispute identifiers, but `userId`, email, Customer and `orderId` are null;
   `pseudonymizedAt` and `retentionUntil` are set.
7. Orders/subscriptions/events have null `userId`, deletion timestamps and a
   `cleanupAfter` at least 30 days later. Re-deliver an already processed Stripe
   event: expect `200`, no duplicate rows and no grants or limits. A genuinely
   withheld event may update only retained ledger state, never access.
8. Register again with the same email. Expect a new Clerk/Wolfmed user with no
   course access and no automatic purchase restoration. `stripeCustomerId` remains
   null until needed. Start and cancel a checkout; expect a new Stripe Customer,
   different from the deleted one, and still no course access.

---

## TC-8 — Upload a study material within the storage quota

**Source**: [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 2.

**Preconditions**: signed-in, enrolled user close to (or exactly at) their 20 MB `userLimits.storageLimit`.

**Steps**:
1. Upload a file that fits within the remaining quota. Expect: succeeds, `userLimits.storageUsed` increases by exactly the file's size.
2. Upload a file that would **exceed** the remaining quota. Expect: rejected with the "Przekroczono limit 20MB" message, and — check this specifically — the file is **not** left behind in UploadThing storage (the action deletes the orphaned upload on this failure path; a lingering file with no DB row would be an easy-to-miss leak).
3. Delete a previously uploaded material. Expect: `storageUsed` decreases by exactly that file's size, never below zero even if run concurrently with another delete (`GREATEST(0, ...)` floor).

**Edge case — premium toggled mid-session (confirmed gap, not just a test)**: upload a file on a basic plan, then upgrade to premium, then wait for/trigger the `library-index` cron sweep. Expect, per the current code: the material **stays unindexed forever** — it's saved with `indexStatus: 'not_indexed'` (`UNINDEXED_STATUS`, `src/server/library/config.ts:43`), and the cron sweep only picks up `'pending'`/`'failed'` rows (`src/app/api/cron/library-index/route.ts`), never `'not_indexed'`. Unlike notes (where `updateNoteContentAction` re-checks premium status on every edit and indexes retroactively), **there is no edit action for materials at all** — `src/actions/materials.ts` only has `uploadMaterialAction`/`deleteMaterialAction` — so a basic-plan upload has no path to ever become searchable after a later upgrade short of deleting and re-uploading it. Confirm this behavior matches the intended product design (it may be intentional — "upgrade, then re-upload" is a defensible policy) rather than an oversight; if unintentional, this is a real product bug, not just a doc gap.

## TC-9 — Cron endpoints reject unauthenticated calls

**Source**: [`14-api-routes.md`](./14-api-routes.md) → Cron jobs.

**Steps**:
1. `curl` (or hit directly in a browser) each of `GET /api/cron/cleanup-sessions`, `GET /api/cron/library-index`, `GET /api/cron/memory-retention` with no `Authorization` header.
2. Expect: `401 {"error":"Unauthorized"}` from all three — these must never be reachable by a normal, non-scheduler request, since they operate across **all users**, not just the caller.
3. Repeat with `Authorization: Bearer <wrong-secret>`. Expect: still `401`.
4. Repeat with the real `CRON_SECRET`. Expect: `200` with a summary payload (`expiredCount`/`processed`/`traces` etc. depending on the route).

---

## TC-10 — Any user (not just admins) can disable comments on their own forum post

**Source**: [`34-flows-social-admin.md`](./34-flows-social-admin.md) → Flow 1 (corrects an earlier documentation error that called this "admin-lockable").

**Steps**:
1. As a **regular, non-admin** user, click "Dodaj temat" on `/forum`, check the "Wyłącz komentarze" checkbox, and submit.
2. As a **different** user, open that post and try to comment. Expect: rejected server-side ("Ten post ma wyłączone komentarze"), not just hidden in the UI.
3. As the **author**, revisit the post later and look for any control to turn comments back on. Expect: **none exists** — confirm there is genuinely no toggle-after-creation anywhere (author view or admin view), matching the code (`readonly` is only ever set once, at insert, in `createForumPostAction`).

**Product question worth raising, not just a test**: if comment-locking is meant to be a moderation tool, it currently isn't one — any user can lock their own thread's comments off, and nothing (including an admin) can unlock it after the fact. Worth confirming this matches intent.

## TC-11 — Deleting one bad document from the RAG corpus requires rebuilding the whole store

**Source**: [`13-pages-admin.md`](./13-pages-admin.md) → `/admin/rag`.

**Steps**:
1. Upload two documents to the corpus.
2. Look for a per-document delete control in `DocumentListTable`. Expect: none — it's read-only.
3. Confirm the only deletion path (`deleteFileSearchStoreAction`) removes the **entire** store, both documents, and requires recreating the store and re-uploading everything else that should stay. This is a real operational cost worth knowing before an admin uploads anything they might later want to retract individually — not a bug, just a workflow trap.

## TC-12 — Search filter resets on reload; display prefs don't

**Source**: [`27-state-stores.md`](./27-state-stores.md) → "Which stores persist."

**Steps**:
1. On any page using `useSearchTermStore` (a test-category browsing list), type a search term, expand the panel (`isExpanded`), and change items-per-page (`perPage`) if that control exists.
2. Hard-refresh the page.
3. Expect: the **typed search term is gone** (empty again), but `isExpanded` and `perPage` (and per-category page bookmarks) **persisted** — this is a deliberate `partialize` split in the store, not a bug if the search term resets, but *would* be a bug if it persisted (a stale filter silently hiding results on a fresh visit) or if the display prefs didn't.

## TC-14 — Rate limit actually triggers at the documented threshold

**Source**: [`00-architecture.md`](./00-architecture.md) → Rate limiting.

**Steps**:
1. Pick a low-threshold bucket to make this fast — `testimonial:create` (2/hour) is the lowest in the config.
2. Submit two testimonials in quick succession. Expect: both succeed.
3. Submit a third within the same hour. Expect: rejected with the "Zbyt wiele żądań... Spróbuj ponownie za N minut" message, and `N` should roughly match time remaining in the hour window (sliding window, not a fixed clock-hour boundary).
4. **Fail-open check (needs a way to simulate a Redis outage — e.g. temporarily point `REDIS_URL`/Upstash env vars at an unreachable host in a local/staging environment only, never production)**: with Redis unreachable, repeat step 3 past the limit. Expect: the request **succeeds anyway** — per the source's explicit fail-open design, an unreachable Redis must not block legitimate traffic. This is a deliberate design choice, not a test looking for a bug — confirm it behaves as documented, since a rate limit that fails *closed* during a real Redis outage would take down the whole app's write path.

## TC-15 — Material upload is quota-checked before the file finishes transferring

**Source**: [`14-api-routes.md`](./14-api-routes.md) → `/api/uploadthing`.

**Preconditions**: an account at or near its 20 MB `userLimits.storageLimit`.

**Steps**:
1. Attempt to upload a file that would exceed the remaining quota.
2. Expect: rejected **during the upload itself** (UploadThing's `materialUploader` middleware throws before the transfer completes) — not accepted, then rejected afterward when `uploadMaterialAction` runs. Watch the network tab: the upload request itself should fail, not succeed followed by a separate failed save.
3. Confirm no partial file is left behind in storage and no `materials` row was created.

## TC-16 — The two independent category-access filters agree with each other

**Source**: [`25-helpers.md`](./25-helpers.md), README audit note #14.

**Steps**:
1. As a user enrolled in one course at `basic` tier (not premium), open `/panel/testy` (uses `populateCategories.ts`'s `getAccessibleCategories`) and `/panel/nauka` (uses `buildAccessibleCategories.ts` via `NaukaCategoriesSection`).
2. Compare the category lists shown on each page for that course. Expect: **identical** sets of accessible categories, since both are supposed to implement the same access rule.
3. Repeat after upgrading to premium, and again while enrolled in a second course. If the two lists ever disagree, that's the duplication in audit note #14 having drifted into an actual bug (one copy of the filter logic changed without the other) — not just a code-cleanliness issue anymore.

## TC-17 — `getIsPremium()`/`getCurrentUser()` dedupe within a request, not just cache stale data

**Source**: [`00-architecture.md`](./00-architecture.md) → Small server utility modules.

**Steps**:
1. Load `/panel/nauka` (renders several independent Suspense boundaries — categories, cells, lectures, notes, flashcards, materials — several of which call `getIsPremium()`/`getCurrentUser()` independently).
2. With server-side logging temporarily added to `getCurrentUser()`/`getIsPremium()` (or DB query logging), confirm the underlying `auth()`/DB lookup fires **once per request**, not once per Suspense boundary that needs it — that's the whole point of wrapping them in React's `cache()`.
3. Load the page again (new request). Expect: fires again — this is **request-scoped** dedup, not cross-request caching. A premium upgrade should be reflected on the very next page load, not stuck behind a stale cache.

## TC-18 — A timed test session expires on tab-switch, not just on tab-close

**Source**: [`31-flows-testing.md`](./31-flows-testing.md), README audit note #16. This is intentional anti-cheat behavior.

**Steps**:
1. Start a timed test (`/panel/testy/[value]`), leave `testSessions.status` at `ACTIVE`.
2. Without closing the tab, switch to a different browser tab (or minimize the window) for a few seconds, then switch back.
3. Check `testSessions.status` in the DB (or watch the network tab for `POST /api/session/expire`). Expect: `EXPIRED` **immediately** on visibility loss.
4. Confirm this is reachable on mobile too: locking the phone screen mid-test triggers the same `visibilitychange` → `document.hidden` path.
5. Start another session, submit with missing answers, and trigger a development Fast Refresh without hiding/reloading the page. Expect: validation preserves answers and the session stays `ACTIVE`; React cleanup alone must not send expiry.

## TC-19 — Board/cells stale save is blocked

**Source**: [`21-server-actions.md`](./21-server-actions.md), README audit note #17.

**Steps**:
1. Open `/panel/nauka` (or wherever the board renders — `DynamicBoard`/`NaukaCellsSection`) in two separate sessions (two browser tabs is enough; a second device makes the scenario more realistic).
2. In tab A, add or edit a cell but **don't** click Save yet.
3. In tab B, add a different cell and click **Save**.
4. Back in tab A, click **Save** (without first clicking `SyncCellsButton` to pull tab B's change).
5. Expect: tab A's save is rejected and the conflict banner appears. Tab A's local edit remains visible; tab B's server data is unchanged.
6. Click **Wczytaj wersję serwera**. Expect tab B's saved board to replace tab A's local state.
7. Repeat, then click **Zachowaj wersję lokalną** and Save. Expect the explicit local choice to overwrite the still-current server version; if another save landed meanwhile, conflict appears again.

---

*(Rounds 9+ append more cases here as further flows get doc-tested — see the "How to add to this guide" note above.)*

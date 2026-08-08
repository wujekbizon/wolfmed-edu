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

## TC-7 — Account deletion erases AI memory (GDPR)

**Source**: [`30-flows-auth-payments.md`](./30-flows-auth-payments.md) → Flow 4.

**Preconditions**: a test account that has interacted with the AI tutor enough to have generated memory data (facts/episodes — e.g. completed a few tests to trigger `onQuizCompleted`, or had a few tutor conversations).

**Steps**:
1. Note the account's `userId`.
2. Delete the account via Clerk (dashboard or the app's own account-deletion UI, wherever that lives on the Clerk side).
3. Confirm the `user.deleted` webhook fires (check server logs / webhook delivery log).
4. Query the DB directly for that `userId` across `wolfmed_users`, `wolfmed_mem_facts`, `wolfmed_mem_episodes`, `wolfmed_mem_preferences`, `wolfmed_mem_traces`.
5. Expect: **zero rows** in all of them, including the memory tables — those aren't FK'd to `users`, so this specifically tests that `eraseUserMemory()` actually ran and isn't a no-op left over from an interrupted deletion.

---

*(Rounds 2+ append more cases here as further flows get doc-tested — see the "How to add to this guide" note above.)*

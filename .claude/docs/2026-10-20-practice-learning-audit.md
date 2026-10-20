# Practice learning audit — 2026-10-20

Scope: `/panel/nauka` category discovery, `/panel/nauka/[category]`, custom-category browsing, progress GET, card answer/reveal/review, reset, prepared/typed Wolfek help, and their auth/cache/persistence boundaries. The separate timed test-taking workflow is outside this audit.

## Findings fixed

- P2: A progress GET returning 403 left the deck interactive. `usePracticeSession` now exposes access denial; `AllTests` hides controls and offers category navigation. Late mutation results cannot update that denied view.
- P2: Custom-category browsing lacked the deck's account-identity guard. `AllTestsBrowse` now compares Clerk's active identity with the server-provided owner, disables queries until auth loads, and hides the old view after an account change. Its local query caches are released on unmount.
- P2: `CategoryContent` caught every authorization exception and redirected to the hub, disguising database/provider failures as missing access. Only expected `PracticeError` failures now redirect; unexpected failures reach Next.js error handling.
- P3: Three identity-only learning hooks subscribed to Clerk's full user resource. They now use `useAuth()` and `userId`; server data access still uses `auth()` and enrollment checks.
- P3: Each premium check invoked three course-access actions. Outside a React render, `cache()` does not deduplicate those enrollment reads. The server-only premium helper now authenticates once and reads enrollments once. The existing public action delegates to it; the permitted courses and tier rules are unchanged.
- P3: The category component waited for questions before starting independent progress/premium reads. They now run together after access validation. Question data is still parsed server-side, without casting unknown database content to validated test data.
- P3: Custom browse cards used question text as their React key. They now use database IDs, avoiding duplicate-key/state-reuse problems for identical question text.
- Progress access exceptions now carry an explicit 401/403 status rather than having the route classify every `PracticeError` as 403.

## Flow checked

| Stage | Findings |
| --- | --- |
| Entry/render | Server page shell and Suspense boundaries; auth and course access checked before protected category data. The practice deck receives question/options DTOs without answer-key flags; custom browse displays the owner's own test content. |
| Refresh | Authenticated GET, viewer identity match, category validation, course access, private/no-store response, abort signal, user/category query key, no automatic retry. 401 and 403 have separate UI outcomes. |
| Answer/reveal/review | `useActionState` dispatch is passed to the form. No additional `useTransition` is required. Zod, rate limits and server grading remain authoritative. |
| Persistence | Session reads/writes are scoped by owner/category. Mutations lock the session, compare versions and replay committed event IDs. Late client results use the newest-version merge. |
| Reset | Server validates ownership/version and event ID; client clears selection only after success. Reset remains a form action. |
| Wolfek | Typed help uses a form action; prepared clicks dispatch inside `startTransition`. Server verifies Premium, category, owner, revision and current session. No model call occurs merely from rendering the learning page. |
| Late responses | Wolfek hides stale response text while preserving committed progress. Deck updates check mount, viewer and category; version merging prevents rollback. |
| Auth | `useAuth` controls client presentation/loading/account changes. It does not replace `auth()` or enrollment checks at server entry points. No learning identity check needs Clerk's `currentUser()` API. |

## Validation

- All 374 regular tests passed, including 113 form, companion and category tests and new premium lookup/account-isolation coverage.
- Progress route integration test passed, including 401, account mismatch, bad input, 403 and authorized reads; auth/database services mocked.
- TypeScript and ESLint for changed source/tests passed.
- Live signed-out GET against the final local production build returned 401 JSON with `private, no-store`, without an uncaught application error. Test server stopped afterward.
- Production build passed outside the sandbox. The initial sandboxed compile stalled and was stopped before retrying. Existing Sentry configuration deprecations and Node localStorage warnings remain.

## Limits

No full signed-in browser session-expiry/account-switch exercise or live answer/reset mutation was performed. No database migrations or test writes to production were run. The production incident's original reason for missing Clerk authentication remains unknown; this audit does not establish expired tokens versus lost cookies or revocation.

Do not replace form mutations with GET or remove server auth to avoid auth failures. Client imports of exported Server Actions are supported Next.js references; their implementations remain on the server.

References: installed Next.js `server-actions.md`, `authentication.md` and `route.md`; [React useActionState](https://react.dev/reference/react/useActionState); [Clerk useAuth](https://clerk.com/docs/nextjs/reference/hooks/use-auth).

# API Routes, Webhooks & Cron Jobs

[← Back to index](./README.md)

All under `src/app/api/`. These are Next.js Route Handlers (`route.ts`), not Server Actions — reached by direct HTTP call (webhooks, `fetch()` from client hooks, or Vercel Cron), not by a `<form action>`.

---

## Cron jobs

All three cron routes share the same guard: `Authorization: Bearer ${CRON_SECRET}` header check, returning `401` otherwise — this is how Vercel Cron (or any external scheduler) authenticates instead of user auth. Minor, low-severity note: the comparison is a plain `!==`, not a constant-time comparison — a common and generally accepted pattern for this kind of bearer-token check (timing attacks over real HTTP/TLS jitter are hard to exploit in practice), not flagged as a numbered audit item since the risk is more theoretical than the other findings in this doc set.

### `GET /api/cron/cleanup-sessions`
`src/app/api/cron/cleanup-sessions/route.ts`. Bulk-expires **every** user's stale `testSessions` rows (not just one user's, unlike the per-user cleanup inside `startTestAction` — see [`11-pages-panel-core.md`](./11-pages-panel-core.md)): `status = 'ACTIVE'` AND (`expiresAt` passed OR no heartbeat in `INACTIVITY_THRESHOLD_MINUTES = 5`) → `status = 'EXPIRED'`.

### `GET /api/cron/library-index`
`src/app/api/cron/library-index/route.ts`. **Backstop, not the primary path** — the primary extraction path runs synchronously after upload via `after()`. This sweep catches what that path can't: a function torn down mid-call, a transient Gemini failure, or a material uploaded before the indexing feature existed. Two phases:
1. Selects `materials` rows with `indexStatus IN ('pending', 'failed')` (never `'unindexable'` — that status is terminal), oldest first, capped at `EXTRACTION_SWEEP_BATCH` (`@/server/library/config`). Runs `syncMaterialChunks(userId, materialId)` **sequentially** (each call is a model call against up to a 4 MB file — parallelizing exhausts the function's memory, per the inline comment).
2. `embedPendingChunks()` — embeds any `libChunks` row still missing a vector (visible via trigram search already, this just improves ranking).

### `GET /api/cron/memory-retention`
`src/app/api/cron/memory-retention/route.ts`. Nightly GDPR/storage hygiene on the memory layer ([`01-database-schema.md`](./01-database-schema.md) → memory tables), driven by `RETENTION` config (`@/server/memory/config`):
- Deletes `memTraces` older than `RETENTION.traceDays` (90 days).
- Deletes `memEpisodes` where `status = 'revoked'` and older than `RETENTION.revokedFactDays`.
- Deletes `memFacts` that are either expired (`expiresAt` passed) or revoked-and-old, **but only if nothing else still points to them** (`NOT EXISTS ... WHERE superseded_by = f.fact_id`) — the self-referential fact-revision chain clears from the tail across multiple runs rather than breaking a FK.

---

## Session lifecycle beacons

Both are `POST`, Clerk-auth-checked (`auth()`, `401` if no `userId`), and scope every mutation to `(sessionId, userId, status = 'ACTIVE')` so a request can't touch another user's session.

### `POST /api/session/heartbeat`
`src/app/api/session/heartbeat/route.ts`. Bumps `testSessions.lastActivityAt` to now. Called periodically by a client hook while a timed test is in progress — this is what `cleanup-sessions` and `startTestAction`'s inline cleanup check against (`lastActivityAt` older than 5 min ⇒ treated as abandoned).

### `POST /api/session/expire`
`src/app/api/session/expire/route.ts`. Explicitly marks a session `EXPIRED` (e.g. on tab close / navigation away via `navigator.sendBeacon`) rather than waiting for the cron sweep or the next `startTestAction` call to notice it's stale.

---

## `/api/uploadthing` — File upload endpoint

`src/app/api/uploadthing/route.ts` — a 5-line wrapper: `createRouteHandler({ router: ourFileRouter })` from the `uploadthing` package. The actual router is `./core.ts` (44 lines), with two upload endpoints:

- **`materialUploader`** — accepts `pdf` (max 4 MB), `video/mp4` (max 8 MB), `application/json` (max 1 MB), one file each. Its `.middleware()` runs **before the file is even accepted**: requires `auth()`, then calls `getUserStorageUsage(userId)` and throws `UploadThingError` if `storageUsed >= storageLimit`. This is a **second, earlier quota gate** in addition to the one inside `uploadMaterialAction`'s own DB transaction (see [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 2) — UploadThing itself refuses oversized-for-quota uploads before they finish transferring, and the action's transactional check is the authoritative backstop in case of a race between the two. `.onUploadComplete()` deliberately does nothing — the comment notes the `materials` row and its indexing are created by `uploadMaterialAction`, called by the client once the upload resolves, not by this hook.
- **`lectureAudio`** — accepts `audio/mpeg` up to 32 MB. Simpler: just an `auth()` check, `.onUploadComplete()` returns `{ url, key }` for the caller (`generateLectureAction`, see [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md)) to persist.

## `/api/rag/progress` — SSE progress stream

`src/app/api/rag/progress/route.ts`, `GET`. Server-Sent-Events endpoint for long-running AI generation jobs (mind maps, quizzes, etc. — anything tracked by `jobId` in `@/server/progress-store`). Supports SSE reconnection via `Last-Event-ID` (replays missed events from `getEvents(jobId, lastEventId)` before switching to live polling), keep-alive pings (`KEEP_ALIVE_INTERVAL`), and a `JOB_WAIT_TIMEOUT` in case the job never appears (e.g. client raced the job's creation). Closes the stream once the job's status is `complete`/`error`. If the job is already finished when the request arrives, returns `204` immediately instead of opening a stream.

## `/api/mcp/resources` — List attachable resources

`src/app/api/mcp/resources/route.ts`, `GET`. Returns the current user's notes + materials as a flat `Resource[]` (`name: "note://<id>"` / `"material://<id>"`, `displayName`, `type`, `metadata`) plus counts. This is what powers the `@resource` attachment picker described in root `CLAUDE.md` → Data Sources tier 3 — the UI needs a list of "things the student could attach" before they've typed `@`. Returns an empty list (not an error) for signed-out requests.

---

## Webhooks

### `POST /api/webhooks/clerk`
`src/app/api/webhooks/clerk/route.ts`. Verifies the Svix signature (`svix-id`/`svix-timestamp`/`svix-signature` headers + `CLERK_WEBHOOK_SECRET`) before trusting the payload — standard webhook-authenticity pattern, distinct from user-session auth. Dispatch is a sequence of `if (eventType === '...')` blocks, not a `switch` — a new event type is a new `if` block alongside the two below.
- **`user.created`** (`:56`) → `insertUserToDb()` (`@/server/db`) creates the `wolfmed_users` row with a random username and motto. It does not initialize course metadata in Clerk; PostgreSQL owns enrollment state.
- **`user.deleted`** (`:89`) → `deleteUserFromDb(id)`; the cascade-delete FKs throughout the schema (see [`01-database-schema.md`](./01-database-schema.md)) clean up everything owned by that user automatically.

### `POST /api/webhooks/stripe`
`src/app/api/webhooks/stripe/route.ts`. Verifies the raw body with
`stripe.webhooks.constructEvent`, then delegates completed/asynchronous Checkout
events to `src/server/payments/*`.

1. Retrieves the canonical Session with expanded line items.
2. Resolves ownership from local `orderId`; legacy open Sessions may use their
   server-issued `offerKey` plus `client_reference_id`. Email is never identity.
3. Validates Session, user, Customer, Price, amount, currency, mode and quantity
   against the immutable local order snapshot/server catalog.
4. One transaction inserts the unique event marker, upserts payment, updates the
   order, creates/reactivates the source-aware entitlement and initializes storage.
5. Duplicate events/business IDs are no-ops. Any failure rolls back and returns
   `500`, allowing Stripe retry.

No Clerk API call, Clerk metadata update, `testLimit` reward or AI/indexing work
runs in this webhook.

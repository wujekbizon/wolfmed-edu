# Wolfek audit — 2026-10-20

Branch: `codex/wolfek-audit`. Audited commit: `665a3f25ab26f06839006be4f866fd4d1d82cb77`.
Read-only application audit. Only this report added. No application code, database, provider, deployment or configuration changes.

Follow-up: the streaming progress endpoint, Redis job store, progress hooks/events and artificial stage delays were removed on 2026-10-21, retiring the infrastructure behind F01 and F06. Tutor and lecture loaders now use browser-only pending text. See [current system flows](../flows.md). Findings and line references below describe the original audited commit; other findings remain open.

## Summary

Architecture broadly sound; not an all-clear. Two high-priority security/cost-control defects confirmed offline. Largest optimization opportunities: fetch facts per prepared question, remove repeated practice reads, aggregate analytics in SQL, simplify tutor progress and logging. Existing checks pass.

Scope includes the new prepared/typed companion plus the existing tutor cells branded Wolfek. Tutor findings are identified explicitly; they are not all regressions from the latest feature work.

## Validation and limits

- `pnpm exec tsc --noEmit --incremental false`: passed.
- `pnpm run lint`: passed.
- `pnpm exec tsx --test "tests/**/*.test.ts"`: 372 passed, zero failures.
- `node --experimental-test-module-mocks --import tsx --test tests/forms/practiceProgressRoute.integration.ts`: one passed. Experimental/deprecation warnings only.
- Four temporary, in-memory probes: public progress disclosure, concurrent rate-limit bypass, mismatched typed route acceptance, incorrect storage-full candidate. No files or tests added for these probes.
- Read installed Next.js 16.4.2 guides for actions, server/client boundaries and `after`; checked React and Vercel primary documentation.
- No production build, live browser flow, live SQL profiling, provider calls, load test or billing inspection. Query counts below describe source paths, not measured production traces. External schedulers and deployed indexes/settings remain unverified.

P1 = prioritize before wider use. P2 = correctness, reliability or material efficiency improvement. P3 = smaller cleanup.

## Findings

### F01 · P1 · Tutor progress has no authentication or ownership boundary

Evidence: `src/app/api/rag/progress/route.ts:5`, `src/server/progress-store.ts`, `src/types/progressTypes.ts`. GET accepts any nonempty job ID, reads its events and streams technical messages without auth. Job records have no owner. `src/proxy.ts` initializes Clerk but does not protect this endpoint. Both tutor actions create the caller-supplied job before authentication (`src/actions/rag-actions.ts:168`, `:700`).

Impact: someone possessing an active job ID can read another student's progress, question excerpts and resource identifiers. UUIDs limit guessing but do not establish authorization. Anonymous callers can also create waiting streams; no stream rate limit exists.

Offline proof: mocked progress storage containing a synthetic private message; invoked GET without cookies/auth. Result: HTTP 200, private event present.

Recommendation: authenticate first; validate ID; bind job creation/read to viewer; reject foreign jobs; bound concurrent streams and waiting time. Include private/no-store response policy. Test anonymous, foreign-owner, expired and malformed IDs.

### F02 · P1 · Expensive AI rate limit is non-atomic and fails open

Evidence: `src/lib/rateLimit.ts:125` reads cardinality before adding a request in separate Redis calls. `rag:query` is ten/hour. Used by learning generation and tutor cells. The error branch permits requests after Redis failure. Typed Jev's separate Lua limiter is atomic; this finding concerns the generic limiter, especially Gemini.

Impact: concurrent requests with different submission IDs can all observe remaining budget, then all invoke paid generation. During partial Redis failures, budget enforcement can disappear. If Redis is entirely unconfigured, learning's submission guard still rejects; tutor uses the per-process fallback.

Offline proof: 20 simultaneous calls against an asynchronous in-memory Redis mock, configured budget ten: all 20 accepted.

Recommendation: one atomic reservation, following `reserveCompanionJevCall`; explicit fail policy for paid AI; separate cache/replay allowances from generation budget. Verify concurrent requests and partial failures, not just sequential calls.

### F03 · P2 · Every prepared dashboard question loads the entire route context

Status: fixed after approved reproduction. Prepared execution/replay derive fact groups from mapped answer dependencies; typed context remains broad. Offline integration confirmed static help's 7 unrelated loader calls drop to 0, with no unrelated billing wait; 104 answer comparisons, authorization and replay checks pass. Access reads remain; these counts are mocked boundary calls, not measured production SQL/cost savings. Run `pnpm exec tsx tests/integration/wolfekPreparedContext.integration.ts`.

Evidence: `executeWolfekPreparedQuestion.ts` always calls `getWolfekAppContext`; `src/server/companion/getWolfekAppContext.ts:27` always loads test facts on panel routes and all home facts on the dashboard. Even username/motto/feedback help loads analytics, plan, billing, storage and badges.

Impact: unnecessary DB work and latency for static answers; a slow unrelated service delays the answer. Promise parallelism does not eliminate the work. Pool capacity is three (`src/server/db/index.ts`), so broad fan-out can queue locally.

Recommendation: map prepared IDs/response requirements to minimal fact groups. Static help needs authorization, not every dashboard query. Keep the broader context for genuinely open typed routing. Avoid globally caching private authorization to hide this cost.

### F04 · P2 · Test summaries repeatedly download full history for tiny answers

Status: count-only prepared answers/replays optimized after approved reproduction. Exact answer fact paths select one user-scoped count aggregate; existing session join, zero/unavailable behavior and authorization remain. Offline F04 integration: 3 queries → 1, 2,001 rows → 1 and 40,000 raw answer entries → 0 for 1,000 synthetic tests. Category/difficult-question aggregation and broader typed summaries still need separate optimization; F04 is not fully closed. Run `pnpm exec tsx tests/integration/wolfekTestFacts.integration.ts`.

Evidence: `src/server/companion/getWolfekTestFacts.ts:8`, `src/server/queries.ts:2170`, `:2214`. It requests totals, category results and difficult questions together. Difficult-question analytics downloads every completed test's result JSON, aggregates/sorts in Node, then Wolfek uses only its length. Category analytics also aggregates raw history in Node.

Impact: egress, CPU and response size grow with student history, including for a simple completed-test count or unrelated dashboard question.

Recommendation: SQL aggregates for counts/categories; SQL or maintained rollups for difficult-question counts; fetch only the requested aggregate. Preserve zero versus unavailable semantics. Benchmark large histories and legacy malformed JSON before changing shared query behavior.

### F05 · P2 · Learning help repeats broad card reads and unused review scans

Status: help read path optimized after approved reproduction. A request-local reader shares a narrow question/item/support snapshot within each phase; delivery performs fresh authorization/card validation on generated, cached and no-source responses. Reveal confirmation refreshes after mutation; typed routing keeps its distinct post-Jev validation phase. Removed help-only count/navigation/review scans and full-session transfer; the existing locked assistance commit/view path is preserved. Offline F05 integration: 4 → 2 card loads and 20/416 → 6 read queries for 1/100 stale revealed cards; no review-question reads, identical dummy help and passing freshness/access controls. Persistence is mocked in this measurement; its real locked checks/view-building remain unmeasured. Run `pnpm exec tsx tests/integration/wolfekPracticeReads.integration.ts`.

Evidence: `getWolfekPracticeContext.ts`, `src/server/companion/generateWolfekLearningHelp.ts:15`, `:42`, `src/server/companion/deliverWolfekLearningHelp.ts:37`. An ordinary uncached prepared hint/comparison reads the card four times; typed help adds a fresh routing-context read. Each active-session load selects the question, full session/items JSON, saved item and review state. `loadWolfekPracticeCard.ts:38` calls `hasPracticeReviewCard`, which loads saved items and may issue one question query per revealed candidate.

Impact: multiple transactions, redundant session transfers and an N+1 path whose results neither context construction nor generation consumes. A bad set of old revealed revisions makes the scan especially expensive.

Recommendation: a narrow authorized card snapshot; explicit pre/post-inference checks; share the snapshot within a phase. Remove total/remaining/review calculations from this path. Keep the final locked revision/version check before assistance writes. Never hold a transaction open during inference.

### F06 · P2 · Tutor progress causes excessive Redis traffic and artificial waiting

Evidence: `src/app/api/rag/progress/route.ts:59`, `:74`, `:97`, `src/constants/progress.ts`; interval 150 ms. Each active tick reads the same job twice through `getJob` and `getEvents`: approximately 13.3 Redis GETs/second/stream. A 30-second generation implies roughly 400 polling reads, excluding setup/writes. Async interval ticks can overlap.

`src/actions/rag-actions.ts:54` emits three events sequentially per progress step; each event reads/writes the growing job. It also sleeps 200 ms per step. Progress-store failures can fail the real answer, including after successful generation, because telemetry is awaited throughout and error reporting itself can throw.

Recommendation: one read per tick; slower/adaptive polling or push; no overlapping polls; one atomic/batched progress update per stage; remove synthetic sleeps; make progress failures nonfatal. Measure invocations and memory lifetime as well as Redis commands.

### F07 · P2 · Typed responses wait for five telemetry writes

Status: mitigated by the explicitly requested code constant `WOLFEK_ADMIN_LOGGING_ENABLED = false` in `src/constants/wolfekAdmin.ts` (no environment setting). Provider audit/usage, interactions/metrics and delivery updates are skipped. The guard performs no DB/Redis lookup. Existing logs remain readable; mandatory business writes/quotas are unaffected. Re-enabling restores the original awaited logging path, so its cost still needs evaluation before the planned admin toggle ships. See [Admin feature plan](../admin-feature-plan.md). The previously proposed F07 reproduction integration was not written; Greg requested the flag directly instead.

Evidence: `src/server/jev/callJev.ts:41`, `writeJevAuditLog.ts`, `recordWolfekInteraction.ts`, `src/server/jev/completeWolfekAudit.ts:14`. Provider audit plus aggregate, interaction plus aggregate, then delivery update: five DML statements in two transactions plus the final update, excluding transaction control. Prepared app help still waits for its interaction transaction.

Impact: optional logging extends visible latency and competes with business queries for the small pool. A DB stall still delays a response even though logging errors are eventually caught. Delivery UPDATE also runs when no provider call occurred.

Recommendation: preserve mandatory submission completion and learning writes; consolidate optional telemetry, return/carry an audit-row ID, and consider `after` for noncritical writes. Background work still uses resources: moving it alone is a latency improvement, not a guaranteed billing saving.

### F08 · P2 · Application deadlines are missing on learning retrieval/generation

Evidence: `src/server/companion/generateWolfekLearningHelp.ts:29`, `src/server/vertex-rag/generate.ts:83`, `client.ts:89`, `src/server/retrieval/readCorpus.ts`. Learning uses distance relevance, whose corpus request has no supplied timeout; the explicit candidate timeout exists only for model-relevance retrieval. Gemini calls have no application-configured timeout/abort budget here. Jev does have a one-second HTTP deadline.

Impact: slow Google/auth/network work can occupy an action until downstream/platform limits, retaining memory and blocking subsequent client-dispatched actions. Submission reservation expires after 300 seconds; work is not tied to an explicit shorter deadline. Actual platform duration/default SDK behavior was not measured.

Recommendation: bounded retrieval/generation/total budgets, cancellation where supported, and clear retry responses. Keep the reservation longer than the maximum allowed work. Do not increase Vercel max duration as the first fix. Tune Jev's deadline from measured p95/p99 rather than assuming one second is sufficient or insufficient.

### F09 · P2 · Typed route/practice validation is asymmetric

Evidence: `src/server/schema.ts:14` requires practice for learning but allows it on every other route. `src/server/companion/executeWolfekQuestion.ts:24` lacks the bidirectional check present in prepared execution. Authorization follows route, but context loading follows presence of practice.

Impact: a crafted public/panel typed request can enter practice reads without the learning-route Premium/category authorization. Existing session reads still scope ownership; no cross-user answer-key disclosure was demonstrated. This remains an authorization-boundary defect and unnecessary private-content/provider work.

Offline proof: a valid practice reference with typed origin passes schema validation for `kierunki`, `panel.home` and `panel.results`.

Recommendation: enforce `Boolean(practice) === (route === 'learning.practice')` at the common input boundary for both origins. Test rejection before DB/provider access.

### F10 · P2 · A false storage-full answer is eligible

Evidence: `src/content/wolfek/panel-home.json:389`: `storage_full` has no conditions, only a printable usage string. `getWolfekHomeFacts.ts` supplies no fullness flag. Jev can choose it when ample capacity remains; server-side selection cannot reject the false claim.

Offline proof: 1 MB used / 20 MB quota produces eligible text saying the limit is exhausted, immediately followed by `1 MB z 20 MB`.

Recommendation: derive a server-owned fullness flag from numeric usage and quota; condition this response on it. Test under quota, equal quota, over quota and unavailable usage.

### F11 · P2 · Expiry timestamps do not enforce audit retention

Evidence: audit/interactions store `expiresAt`, but repository Vercel crons never prune these tables. `scripts/prune-jev-audit-logs.ts` exists; its documentation explicitly says no schedule was created. Admin list/detail/export queries do not reject expired rows.

Impact: unless separately scheduled outside this repository, full questions/raw responses grow indefinitely and remain readable after the UI's stated 30 days. Daily aggregates are already separate and can survive pruning.

Recommendation: verify the external scheduler; otherwise schedule bounded cleanup and apply expiry constraints to full-content reads. This audit did not execute pruning or inspect external schedules.

### F12 · P2 · Learning caches can outlive source corrections

Evidence: `src/server/companion/generateWolfekLearningHelp.ts:22`, `src/hooks/useWolfekLearningQuestions.ts:21`, `src/store/useWolfekLearningStore.ts`. Keys include question revision/manual cache version, but no corpus/support revision. Redis TTL is 14 days; browser entries have `updatedAt` but replay checks no age at all.

Impact: correcting curriculum or changing reviewed support without changing the question can leave old explanations/sources served for 14 days server-side and indefinitely in a recently retained browser entry. Existing account/category/question/selection/reveal gates are useful and should remain.

Recommendation: explicit source/prompt version in both caches, browser expiry and invalidation policy. Test same-question corpus updates, old browser cache and hidden-answer restoration. A fresh submission ID only deduplicates transport; it does not refresh these caches.

### F13 · P2 · Tutor resource resolution overfetches and reloads content

Evidence: `src/actions/rag-actions.ts:69`, `:307`; `getAllUserNotes` (`queries.ts:1550`) and `getMaterialsByUser` (`:1795`) select complete records just to match names. Called per resource. Selected content is then loaded, and ordinary tutor retrieval loads attached text again via `src/server/library/attached-source.ts`. Extracted text can reach the generation prompt both as retrieved context and additional user context.

Impact: all note bodies/material extracted text can cross the DB connection for a single name lookup. Repeated resources multiply work; duplicate prompt content adds model input tokens.

Recommendation: batch narrow ID/title lookup, resolve once, read selected content once, then reuse the owned result through retrieval/generation without duplicating its text. Keep exact-name and per-user restrictions.

### F14 · P2 · Tutor PDF fallback downloads bytes that ordinary chat never uses

Evidence: `fetchResourceContent` in `src/actions/rag-actions.ts` returns `pdfFiles` when extraction is unavailable. The tool path passes those files to `executeToolWithContent`, but ordinary tutor calls `generateGroundedAnswer` with text context only (`:648`). Explicit-resource retrieval excludes materials without extracted text.

Impact: asking about a newly uploaded/unextracted PDF can download and base64-encode the whole file, then produce no-source output because the PDF bytes never reach ordinary generation. With mixed attachments, only the extracted subset may ground the answer.

Recommendation: either report indexing status before downloading, or implement a bounded multimodal tutor fallback. Test pending, failed and unindexable extraction, and mixed PDF/note requests.

### F15 · P2 · Tool success pays for an avoidable confirmation model call

Evidence: `src/server/vertex-rag/generate.ts:251` sends the entire tool result to another Flash-Lite request solely for confirmation, after dispatch and tool generation have already completed. No-cell prose results already bypass this step.

Impact: extra latency and input/output tokens for notes/tests/diagrams/etc.; failure of confirmation turns already generated content into an action error and encourages another paid attempt.

Recommendation: deterministic confirmation from tool metadata. If model wording is required, make failure nonfatal and cap its payload/output. Separately assess dispatch necessity only where optional arguments actually require inference.

### F16 · P2 · Admin reads and exports become expensive before safety limits apply

Evidence: `src/server/wolfek-admin/getWolfekMetrics.ts:11` runs six aggregates per report, including lifetime totals; pagination/search also repeats them. Non-usage views add list and count: eight statements. Audit filters/order use `startedAt`, but declared composite indexes use `createdAt`. `completeWolfekAudit` locates a row using route/user/JSON submission ID without a matching declared index.

Exports select up to 5,001 full raw audit rows; JSON/CSV is fully constructed before the route checks its 16 MB byte cap (`getWolfekExport.ts`, export route). Raw and parsed provider output duplicate much of the payload.

Impact: repeated scans, sorts, unnecessary aggregates, and potentially large memory/egress spikes for exports that are ultimately rejected. Actual deployed indexes and query plans remain unverified.

Recommendation: separate metrics cache/query from list pagination; query only needed panels; use audit-row ID for updates. Inspect actual EXPLAIN plans before choosing indexes. Bound bytes while fetching/serializing or stream a capped export; select only CSV columns.

### F17 · P2 · Floating layout math disagrees with actual width; mobile sources disappear

Evidence: `src/hooks/useFloatingPanelPosition.ts:42` positions a 344 px panel, while `src/styles/globals.css:399` sets up to 380 px. Without an anchor, at viewport 1280 px the chosen left is 912 px, placing the CSS right edge at 1292 px. At compact widths the mismatch can reach 24 px. This is a static layout calculation; browser appearance remains unverified.

Separately, `globals.css:1427` hides `.wolfek-inline .wolfek-sources` entirely. Learning switches to inline mode at <=1024 px, so mobile/tablet students cannot open the source list even when sources exist.

Recommendation: measure actual panel width, account for visual viewport offsets, and keep a usable sources affordance inline. Test 1024/1025/1279/1280 widths, browser zoom, keyboard viewport and long responses.

### F18 · P2 · Current metrics cannot quantify total Wolfek cost or latency

Evidence: learning generation discards Gemini usage at delivery; prepared learning records the same generic prepared interaction as a cheap app answer. Admin provider totals cover Jev, as its UI correctly states. No separate learning cache-hit/retrieval/generation timing is recorded. `actionLatencyMs` is sampled before the delivery update, submission completion and `after` memory work.

Impact: admin numbers cannot tell whether costs come from Gemini, retrieval, DB fan-out, Redis polling or Vercel lifetime. They cannot establish savings or bottlenecks by themselves.

Recommendation: sampled spans/counters by route, origin, learning mode and cache result; include DB counts, total action time, Gemini usage and background duration. Avoid another per-step DB write for measurement. Correlate with Vercel/Neon/Google usage before estimating money saved.

## Smaller maintenance and validation gaps

- P3: `PanelWolfekHost` refetches onboarding state through a Server Action after 30-second staleness/window focus. That repeats enrollment/Redis work and can join the sequential action queue. Prefer the existing server seed/local dismissal policy or an authenticated GET if background freshness is required.
- P3: repeated access reads currently rely in part on helpers wrapped in React `cache`. That API is for Server Component rendering, not persistent caching of Server Action invocations. Pass explicit promises/snapshots within action phases, and preserve intentional post-model authorization checks. Do not share private access in a module-global cache.
- P3: several Wolfek component props remain inline despite repository type-file conventions; `LearningHubHeader.tsx` exceeds the approximate 100-line limit. These are maintainability rules, not demonstrated Next.js runtime failures. Raw special-purpose SVG interaction/overlay buttons are not an optimization priority.
- P3: duplicated video-modal focus-trap code; portal positioning and focus cleanup are otherwise present. Consolidate only if changing these dialogs. Native video controls should be covered in keyboard tests.
- Validation gap: existing delivery tests mock authorization, dedup, practice context and learning generation. They do not establish live query counts, Redis race behavior, React lifecycle safety or model-grounding quality. No browser regression suite was found for these flows.
- Medical-output gap: `grounded` means the answer differs from one exact no-source string, not that each claim is supported. Prompt-only hint/comparison secrecy and malformed/truncated model output need evaluation against real source sets. Use structured no-source status and semantic checks if stronger guarantees are required. No medical correctness claim is made by this audit.

## Healthy patterns to preserve

- Prepared app buttons bypass Jev; learning only generates the chosen mode. No inference on mount/open.
- Private server services use `server-only`; public actions use server validation and return DTO/form state. Pages remain server components; interactive Wolfek parts are client islands.
- Learning checks Premium/category/owner/revision/session version on the intended route; explanation requires reveal. Mutations lock session rows; conflicts return progress. Assistance writes happen before the new help is delivered.
- Request dedup uses Redis SET NX plus input hash. Replay rechecks context. Typed Jev rate reservation is atomic.
- Client answer scoping includes viewer/card/revision/selection; committed session updates survive a stale-answer scope rejection. Newer progress cannot be replaced by older versions.
- Learning uses canonical retrieval, bounded output budgets and no generation on empty retrieval. Hint/comparison omit stored answer keys and prior full-explanation conversation from generation.
- Browser reply cache is bounded to 100 contexts; explanations do not restore while the key is hidden. These gates do not solve source freshness.
- Admin actions/export enforce admin access; export responses are private/no-store; SQL parameters and CSV formula neutralization are present. Dates use Warsaw boundaries; missing token usage is not silently reported as known zero.
- No unnecessary broad route revalidation in companion actions. Video player is lazy-loaded; overlays/modals use portals; gaze work is requestAnimationFrame-throttled with cleanup; reduced motion is widely supported.

## Cost model and next measurement

Vercel Fluid Compute bills active CPU, provisioned memory and invocations separately. Awaiting a DB/model is not equivalent to burning active CPU, but still affects latency and provisioned-memory lifetime. Actual project mode/region/settings were not inspected. Moving work into `after` extends invocation lifetime; it does not make the work free. Sources: [Vercel pricing](https://vercel.com/docs/functions/usage-and-pricing), [Next after](https://nextjs.org/docs/app/api-reference/functions/after).

React cache does not persist across requests and is intended for Server Components: [React cache](https://react.dev/reference/react/cache). Installed action guidance also documents sequential client dispatch; long read actions can queue behind generation.

Measure representative flows separately: static prepared help; result count with small/large history; prepared hint cache miss/Redis hit/browser hit; compare after selection; reveal plus failed generation; typed app question; tutor chat with/without attachment; tool generation; admin pagination/export. Capture p50/p95 latency, DB statements/bytes, Redis commands, provider calls/tokens, active CPU, memory duration and failures.

Suggested order: F01/F02; narrow fact/card reads and analytics; progress/telemetry work; deadlines and invariants; stale content/retention; admin/UI. No fixes implemented.

## Coverage map

| Area | Reviewed |
| --- | --- |
| Entry points | `wolfek-questions`, `wolfek-prepared`, `panel-wolfek`, `wolfek-admin`; export/progress routes; mounted panel/results/catalog/learning/admin pages |
| Companion services | All `src/server/companion` modules: access, context/facts, packs, submissions/replay, Jev reservation, hints, generated help and assistance writes |
| UI | All `src/components/wolfek` files; learning companion/actions/avatar/dock; `AllTests`, deck/session hooks, navigation and welcome integration; all admin Wolfek components; RagWolfek header/progress/response and cell form/conversation integration |
| State/helpers/content | Wolfek hooks, learning store, response/template/decision/prepared helpers, admin/date/CSV helpers, constants/types, schemas, four response packs plus question/prepared mappings |
| Storage/observability | Jev transport/audit/interaction/daily metrics; both DB schemas; admin queries/export; pool/rate limiter/Redis; retention script and cron registration |
| Shared dependencies | Practice card/session reads/mutations/view building; category/Premium checks; test analytics, billing and planner reads; memory projection triggered by help; canonical retrieval and grounded generator |
| Existing tutor | `rag-actions`, progress store/SSE/client, resource resolution and attached-source retrieval, shared generation/tool dispatch/confirmation. Findings here do not imply a full audit of every tool, memory subsystem or payment feature |

Unresolved operational facts: external pruning schedule; Vercel billing mode/region; deployed indexes/query plans; production traffic/latency; semantic model evaluation. None blocks the source findings above.

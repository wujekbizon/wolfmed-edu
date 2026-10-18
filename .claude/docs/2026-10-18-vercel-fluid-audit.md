# Vercel Fluid audit and optimization plan

Greg · 2026-10-18 · source: `40609428`

Scope: current repository, both screenshots, current official documentation. Application code unchanged. No production/provider calls, database queries, scripts, deployments, or billing changes performed. Production deployment SHA and full-period route totals unavailable; savings below are opportunities, not measured results.

Correction after tracing returned views: `supportPending` is not unused. `buildPracticeCardView` forwards it, and the active `newestPracticeView` merge rejects a same-version response when pending would change from false to true. `usePracticeSession` applies this merge to refetches and mutation responses. The automatic-coaching hook has no current callers, but that alone does not establish safe removal of the calculation or field. Withdraw the earlier “removable extra work” claim; require producer/consumer and merge regression verification before proposing that change.

## What the screenshots establish

| Metric | Observed | Meaning |
|---|---:|---|
| Team Active CPU | 3h2m / 4h | 76% used; 58m remaining |
| Wolfmed Active CPU | 2h45m | About 91% of team usage |
| Deleted project's CPU | About 17m | Already consumed team allowance |
| Team provisioned memory | 108.9 / 360 GB-hours | 30% used |
| Wolfmed provisioned memory | 105.6 GB-hours | Main memory consumer |
| Category route, first screenshot | 526 requests, about 60 CPU seconds | About 114 CPU ms/request |
| Ten visible routes combined | 1,036 requests, about 81 CPU seconds | Category contributes about 74% of these rows |
| Start type | 96.4% hot; 3.4% cold | Cold starts are a secondary investigation |

Fluid enabled October 2. Rough October 2–18 team average: 11 CPU minutes/day; about five days of remaining capacity at that average. Latest large daily bar approaches 20 minutes, which would shorten runway to about three days if repeated. These are rough estimates, not exhaustion dates. Greg requires continuity through a Pro upgrade; assume no reset relief.

The first screenshot appears to cover about 12 hours and shows page 1 of 4. Its one minute on the category route cannot explain 2h45m of cumulative Wolfmed CPU. Obtain matching-period totals across all routes before assigning monthly savings. Its TTFB panel explicitly says Demo Data; exclude it from latency conclusions.

## Billing: the distinction that changes the plan

The 4-hour limit is **active CPU**, not request elapsed time. Waiting for Google, Jev, Redis, or PostgreSQL pauses CPU billing; parsing, hashing, rendering, tracing, and request processing consume CPU. Provisioned memory remains billable while requests/background work are in flight, even when awaiting I/O. A 300-second maximum is a ceiling, not an automatic 300-second CPU charge. [Vercel pricing](https://vercel.com/docs/functions/usage-and-pricing), [Fluid configuration](https://vercel.com/docs/fluid-compute).

At Frankfurt rates: CPU $0.184/hour; memory $0.0152/GB-hour. The observed team totals have an illustrative Pro CPU+memory equivalent of **about $2.21**, excluding invocations and other services. This is a comparison, not retroactive Hobby billing or a monthly forecast. Pro has a $20/month platform fee including one deploying seat and $20 usage credit shared across infrastructure. [Regional rates](https://vercel.com/docs/functions/usage-and-pricing), [Pro plan](https://vercel.com/docs/plans/pro-plan).

Before relying on paid capacity, configure a deliberate spend threshold and notifications. Automatic pausing is optional and stops production; choose that setting according to the acceptable outage/cost tradeoff. [Spend Management](https://vercel.com/docs/spend-management).

## Baseline before implementation

Follow Vercel's sequence: identify functions, separate internal work from external latency, inspect deployed configuration, change one thing, compare preview results, then monitor production. [Debug slow functions](https://vercel.com/docs/functions/debug-slow-functions).

1. Confirm deployed SHA, billing scope, configured memory/CPU, Node version, function region, Neon region, Vertex region, and Upstash region. Screenshot confirms `fra1`; source defaults Vertex to `europe-west3`, but environment overrides remain unverified.
2. Export all four route-table pages for the same cumulative interval as Usage. Separate production/preview, project, HTTP method, status, and available prefetch/RSC indicators. Server Actions POST to their hosting page; route counts are not page-view counts. Distinguish actions with sampled operation names, never raw learner content.
3. For each route record total CPU, CPU/request, invocations, request duration P50/P75/P95 where available, errors, payload bytes, database query count, and provider/cache-hit counts. Use instance-level provisioned memory totals; do not sum overlapping requests as separate instance lifetimes.
4. Reuse existing logs/admin Wolfek metrics first. If instrumentation is needed, add temporary sampled spans for access, question loading/transformation, session mutation/view, RAG retrieval/generation, Redis, audit, and background memory. Span duration measures elapsed time, not billed CPU. Process CPU deltas overlap under Fluid concurrency; do not report them as exact per-request charges.
5. Use a fixed small preview scenario, not a production load test. Preview cold-start results are not production-equivalent: Fluid bytecode caching is production-only. [Fluid behavior](https://vercel.com/docs/fluid-compute).

## Route order and changes

Keep screenshot order. Implement and verify each route before proceeding. Shared fixes carry into later routes; do not count their savings twice.

| Order | Route | Requests / CPU shown | Audit finding → proposed change |
|---|---|---:|---|
| 1 | `/panel/nauka/[category]` | 526 / ~60s | Rebuilds complete question deck; repeated session/context work → verify coaching merge dependencies, investigate public deck caching and narrower loaders/refetches |
| 2 | `/panel` | 73 / 3.74s | Analytics processes historic test results in Node; many dashboard queries → database aggregates, bounded summaries; optimize RAG progress described below |
| 3 | `/kierunki` | 65 / 2.59s | Public catalog is constants, but Wolfek reads auth/enrollments during render → isolate personalized data; preserve static public content/cache where supported |
| 4 | `/panel/nauka` | 62 / 1.91s | Reads metadata for every question, deduplicates in JS, counts each category separately → one grouped category/count query with shared content cache |
| 5 | `/panel/testy-egzaminy` | 60 / 3.19s | Same category/count path; imports complete practical-exam JSON for listing metadata → reuse grouped counts and a small exam index |
| 6 | `/panel/kursy` | 59 / 1.73s | Mostly small enrollment read plus shared layout → reuse request-local access data; trim layout note load; low standalone priority |
| 7 | `/forum` | 59 / 2.66s | Loads all posts and all comments before rendering list → bounded list projection, comment counts/latest preview; full comments on detail |
| 8 | `/blog` | 57 / 1.51s | List query selects complete post rows without limit → summary projection, pagination, shared published-content cache; likes remain current |
| 9 | `/panel/testy` | 40 / 1.81s | Same category/count path; 5% errors → reuse grouped counts; inspect the roughly two failing requests before tuning |
| 10 | `/panel/procedury/[course]/[slug]` | 35 / 1.73s | Stable procedure data rerenders under authenticated layout → content cache with edit invalidation; metadata/page query already request-deduplicated |

### 1. Category learning: first implementation target

**Confirmed execution paths**

- Render: auth/access → all category questions → session/premium → validate every question, SHA-256 every revision, serialize the full safe question deck. [CategoryContent](C:/omed/wolfmed/src/components/learning/CategoryContent.tsx:36), [deck conversion](C:/omed/wolfmed/src/helpers/toLearningQuestionCardData.ts:7).
- Answer/reveal: Server Action → access/rate limit → transactional grading/event/session write → partial view → background memory projection. Partial mutation responses already exist; do not propose them as a new optimization. [practice action](C:/omed/wolfmed/src/actions/learning-practice.ts:27), [mutation](C:/omed/wolfmed/src/server/learning/mutateSession.ts:24).
- First prepared Wolfek click in a scope: batch-load action with one Jev request, then a consume action. Consume may retrieve curriculum and call Gemini for the selected mode. Later clicks reuse the batch when facts match. Typed follow-ups call Jev afresh. [client coordination](C:/omed/wolfmed/src/helpers/getWolfekPreparedResult.ts:12).
- No Jev/RAG runs merely from mounting/opening the current companion. `usePracticeSupport` and `usePracticeCompanion` have no mounted callers in current source; do not blame their automatic Jev flow for current traffic. Production may differ until SHA is checked.
- Local answer replay and a 14-day, user-scoped Redis grounded-answer cache already exist. Client navigation/filtering is local. There is no category heartbeat/polling timer; the 30-second stale time is not an interval.

**Small changes, in order**

1. Investigate automatic-coaching evidence computation in `buildPracticeView`. After first errors/reveals it can fetch and map up to 96 events for `supportPending`. The coaching hook has no callers, but the field actively controls same-version view merging through `newestPracticeView`. Do not remove/gate it based only on the unmounted hook; establish required merge behavior and regression coverage first. [view](C:/omed/wolfmed/src/server/learning/buildView.ts:41), [merge guard](C:/omed/wolfmed/src/helpers/newestPracticeView.ts:8), [evidence](C:/omed/wolfmed/src/server/learning/getPracticeCoachingEvidence.ts:24).
2. Give the current Wolfek context a minimal card loader. `getWolfekPracticeContext` uses question/item data, but `loadWolfekPracticeCard` also counts category rows for unsaved sessions or computes review availability across items/questions. Preserve ownership, access, revision, selection and session-version checks; omit unused counts/review data. Reuse validated snapshots within phases; revalidate after provider waits before committing. [context](C:/omed/wolfmed/src/server/companion/getWolfekPracticeContext.ts:7), [loader](C:/omed/wolfmed/src/server/companion/loadWolfekPracticeCard.ts:14).
3. Persistently cache the **shared question-card DTO** and revision calculation by category/content version. Current React `cache()` only deduplicates request-local work. Keep the answer key server-only and private custom categories/user progress outside the shared cache. Locate every content publication/import path and define invalidation before enabling reuse; use the existing Redis infrastructure if the current route caching configuration makes framework caching unsuitable.
4. Audit React Query focus/reconnect/remount requests. `staleTime=30s`, `gcTime=0`, default focus/reconnect behavior can add reads. Tune only this query; retain mutation-response merging, account isolation, conflict recovery and a defined cross-tab refresh path. No blind global `staleTime=Infinity`. [session hook](C:/omed/wolfmed/src/hooks/usePracticeSession.ts:23), [TanStack defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).
5. Measure background memory work. Each successful answer/hint/reveal schedules a projection that reads up to 120 recent events before checking whether the projected event changed, then promotes facts/episodes. Consider a cheap committed-event watermark check first and per-user/category coalescing with reliable eventual catch-up. Keep durable activity events and deterministic memory semantics. Moving more work to `after()` alone saves no compute. [scheduling](C:/omed/wolfmed/src/actions/learning-practice.ts:55), [projection](C:/omed/wolfmed/src/server/memory/extractPractice.ts:10).
6. Measure Jev/audit overhead before changing batching. Batch load, consume and typed paths perform several Redis and PostgreSQL writes. Preserve idempotency/audit records. Carry the inserted audit row ID into later updates instead of repeatedly searching request JSON; the declared audit schema has no submission-expression index. This is primarily database latency/processing, not proof of Vercel CPU dominance.
7. Optional later experiment: combine first batch load + selected delivery into one action while retaining one-visit reuse, validation and replay guarantees. This can remove one first-click invocation; benefit versus complexity must be measured. Existing batch semantics are documented as Greg-approved; preserve them.

**Acceptance**: zero provider calls on mount/open; ordinary checking/reveal uses no Jev/Gemini; first prepared click uses at most one Jev batch unless facts genuinely invalidate it; unused modes never generate. Cached help obeys reveal/access/revision checks and records assistance in new sessions. Grade, stale version, duplicate submit, account switch, reset and no-source behavior stay correct. Verify fewer queries/transformations and lower CPU per identical workload before claiming savings.

### 2. Panel and RAG progress: clearest mechanical waste

`UserAnalytics` fetches historical test JSON and aggregates it in Node. Move category/accuracy/timeline aggregation into SQL or maintained summaries, fetching only displayed results. Keep DB CPU cost and query plans in view: moving work shifts cost rather than making it disappear. [analytics](C:/omed/wolfmed/src/components/UserAnalytics.tsx:19), [history aggregation](C:/omed/wolfmed/src/server/queries.ts:2165).

The cell tutor opens a separate `/api/rag/progress` SSE function. Every **150ms** its server timer calls `getJob`, then `getEvents`; both fetch and deserialize the complete job from Redis. At 300 seconds that is about **2,000 polls / 4,000 full-job reads**, before progress writes/initial reads. Those are Redis operations inside one SSE invocation, not 4,000 Vercel invocations. Slow Redis can also make interval callbacks overlap. This endpoint is used by cell RAG/plan previews, not the new Wolfek learning-help path; attribute it separately. [interval](C:/omed/wolfmed/src/constants/progress.ts:68), [poller](C:/omed/wolfmed/src/app/api/rag/progress/route.ts:59), [duplicate reads](C:/omed/wolfmed/src/server/progress-store.ts:140).

Change to one job snapshot per non-overlapping poll, initially every 1–2 seconds with backoff. Filter new events from that snapshot. Stop on completion/error/disconnect and enforce an overall lifetime/deadline. Preserve initial missing-job grace, event IDs, reconnects and visible progress. Target roughly 150–300 reads per 300-second run: **92–96% fewer progress reads**, not a promised 92–96% total CPU reduction. Consider event delivery from the main request later if measured memory overlap remains material.

### Shared work applied while traversing routes

- Panel layout loads all notes including content, then keeps pinned ones in JavaScript. Query pinned summaries/counts instead; fetch note bodies when opened. Layouts can be reused on client navigation, so measure when this work actually repeats. [layout](C:/omed/wolfmed/src/app/panel/layout.tsx:19).
- Group category counts in SQL rather than shipping every question's metadata to Node plus one count query/category. Access helpers call auth repeatedly by category, but enrollment DB reads are already React-cached within a render; do not label that one DB query/category. Cache shared counts; keep entitlement checks current. [category pipeline](C:/omed/wolfmed/src/helpers/populateCategories.ts:31).
- Sentry server/edge tracing is set to `tracesSampleRate: 1`. Measure its processing/export overhead after retaining a short diagnostic baseline; consider lower production sampling while retaining error capture. Sampling fraction is not an equal CPU-saving percentage. [configuration](C:/omed/wolfmed/sentry.server.config.ts:11).
- `getGoogleAI()` constructs an SDK client per call, while GoogleAuth and Redis already use reusable instances. Consider reusing the immutable SDK client; never store request/user data on the shared object. [Google client](C:/omed/wolfmed/src/server/vertex-rag/client.ts:78).
- Current PostgreSQL pool already uses module scope and `attachDatabasePool`, with `max=3`. Measure connection/queue delays before resizing under Fluid concurrency. Waiting is chiefly a latency/memory concern; no blanket pool or memory increase.
- Check actual prefetch requests before changing Links. Installed Next 16.3.4 docs say dynamic routes are normally skipped without a loading boundary; disabling every Link is not an evidence-based fix. Shared layout prefetch may still matter. Inspect route loading boundaries and request headers first.
- Keep the 300-second AI allowance. Add per-stage deadlines only from measured healthy upstream latency, allowing cleanup time before function termination. Jev already has a 1-second timeout. Cache hits, no-source early returns and bounded Wolfek output already exist; preserve them.

Framework references read from the installed package: [caching](C:/omed/wolfmed/node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md), [prefetching](C:/omed/wolfmed/node_modules/next/dist/docs/01-app/02-guides/prefetching.md), [Server Action duration](C:/omed/wolfmed/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/maxDuration.md). Cache Components are not enabled in current config; avoid assuming a framework-wide caching migration is required.

## Delivery and measurement

For each route: capture baseline → one small change → relevant local regression checks → bounded preview comparison → review → production rollout → same-interval monitoring. TypeScript/lint plus focused behavior tests for changed caching, replay, grading or progress lifecycle; no production data scripts. Record CPU/request, total CPU/day, requests per learning action, provisioned GB-hours and errors. Faster wall time alone does not establish CPU savings.

Before implementation: verify category candidates across producers, active consumers, persisted/replayed views and merge semantics, then identify a behavior-preserving change and focused regression checks. Measure before claiming savings. Next tackle panel/RAG progress, then remaining screenshot routes in order. Retrieve the other three route-table pages before claiming the entire application's audit is complete.

Unresolved questions: deployed SHA? Full-period totals for all routes? Neon/Redis regions and deployed allocation? Pro spend threshold/pause preference?

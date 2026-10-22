# Tests

Tests use Node's built-in runner (`node:test`) via `tsx`.

## Running

```bash
pnpm test
pnpm exec tsx --test "tests/rateLimit/*.test.ts"
```

`pnpm test` runs `tests/**/*.test.ts`. Regression tests use local fixtures and
simulated dependencies: no real database, Redis, AI calls, or `.env` required.
The second command runs only the rate-limit regressions.

## Manual integration tests

These entrypoints end in `.integration.ts`, so `pnpm test` never runs them.
Run from the repository root. The two live tests below require `--live` to permit external writes.

```powershell
pnpm exec tsx tests/integration/mottoRateLimit.integration.ts user_YOUR_CLERK_ID --live
pnpm exec tsx tests/integration/wolfekRateLimit.integration.ts --live
```

| Test | Real services | Expected fixed result |
| --- | --- | --- |
| Motto | Upstash + PostgreSQL | 10 submissions: 5 accepted, 5 blocked, 5 motto writes |
| Wolfek AI Asystent | Upstash only; auth, premium, retrieval, memory, tracing and AI stubbed | 20 submissions: 10 accepted, 10 blocked, 10 model stubs |

Both load Upstash credentials from `.env`; motto also requires `NEON_DATABASE_URL`
and an existing Clerk user ID. Environment variables already set take precedence.
Both compare an archived non-atomic command block with the current limiter.
Old results depend on network timing; exceeding the allowance reproduces the race.
Only the current limiter's exact allowance is a pass/fail condition.

Each run uses unique Redis test keys and removes/verifies them in `finally`.
Normal user counters, source files and configured limits stay unchanged.
Motto saves a recovery backup in ignored `outputs/rate-limit-tests/`, restores and
verifies the original motto, then deletes the backup. Avoid editing that account's
motto or running two motto tests for it simultaneously. Let the process finish;
forced termination may require manual restoration using the backup.

These are source-level action harnesses, not browser or Clerk authentication tests.
They execute extracted current action/query code with explicit dependencies; no
live AI calls occur. Wolfek verifies blocked requests never reach retrieval/model
stubs. Default regressions simulate atomic Redis execution; the live tests execute
the actual Lua on Upstash. Source loaders fail explicitly when expected imports or
declarations change. They require Node 22.13+ (`stripTypeScriptTypes`).

The previous temporary motto harness moved from `outputs/motto-rate-limit-probe/`.

## F03 audit: prepared Wolfek dashboard context

```powershell
pnpm exec tsx tests/integration/wolfekPreparedContext.integration.ts --baseline
pnpm exec tsx tests/integration/wolfekPreparedContext.integration.ts
```

This integration uses the real `executeWolfekPreparedQuestion`, authorization,
`getWolfekAppContext`, test/home fact loaders and JSON answer rendering. It asks
Wolfek's prepared username/motto/feedback HELP questions; it never submits profile
update forms. Database/query boundaries, Redis/dedup and telemetry are mocked.
No `.env`, real DB/Redis/provider calls, charges or data changes.

`--baseline` reports loader calls and checks answer correctness, dynamic result
facts and authorization. Before F03's fix, each static prepared question triggered
7 unrelated loader calls: totals, categories, difficult questions, plan, billing,
storage and badges. After the fix those static answers make zero unrelated calls.
Two enrollment lookups are reported separately. These are
boundary invocations, not measured production SQL statement counts or Vercel costs.
A controlled unresolved billing promise also demonstrates that unrelated billing
blocks the static answer, without relying on timing thresholds.

The second command enforces the optimization: no unrelated loader calls and no wait
on unrelated billing for static help. It was RED before the fix and is now GREEN.
It also compares all prepared dashboard/results/catalog answers against full-context
answers, including failed loader scenarios; checks selective groups for dynamic
questions; and verifies replay savings and rejection of stale results.
This manual command remains outside `pnpm test`; it uses no live services.

## F04 audit: test-history overfetch for a count answer

```powershell
pnpm exec tsx tests/integration/wolfekTestFacts.integration.ts --baseline
pnpm exec tsx tests/integration/wolfekTestFacts.integration.ts
```

Asks Wolfek's prepared `panel.results/results_history` question with 1 and 1,000
synthetic completed tests (40 answers each). Runs the real prepared executor,
context/fact loaders and answer rendering. The two analytics functions are loaded
from their current source with injected DB dependencies; their processing logic is
not replaced. DB execution, enrollment data, Redis/dedup and telemetry are mocked.
No `.env`, live services, charges or data changes; no `--live` flag.

Reports projected fields, query calls, rows, serialized fixture-result bytes and
answer entries loaded. Before the count-only fix, both cases ran 3 queries; the larger
history returned 2,001 rows, 40,000 answer entries and 1,812,050 serialized bytes for
one count answer. After the fix both cases use one count-only aggregate row, loading
zero answer entries (13/16 serialized bytes for 1/1,000 tests). This demonstrates
application overfetch reduction; it does not measure actual
Postgres wire bytes, query execution plans, Vercel time or production cost.
Also verifies correct counts, zero versus unavailable history, unrelated analytics
failure tolerance and access rejection before test queries. Legacy records without
a linked session retain the existing join-based count semantics.

`--baseline` reports current measurements. The second command enforces the budget of
one count-only aggregate row with no answer history; it was RED before the fix and
is now GREEN. Category/difficult-question aggregation remains a separate optimization.

## F05 audit: repeated learning-card reads and unused review scans

```powershell
pnpm exec tsx tests/integration/wolfekPracticeReads.integration.ts --baseline
pnpm exec tsx tests/integration/wolfekPracticeReads.integration.ts
```

Runs prepared hint/comparison through the real Wolfek executor, authorization,
practice context/card loading, question validation and help-generation/delivery
orchestration. Uses a synthetic active session with 1 or 100 old revealed cards
whose revisions no longer match current questions. Before the fix these forced
the unused review-availability scan through every candidate.
DB execution, Premium/category identity, Redis, retrieval/model output, telemetry
and assistance persistence are mocked. No `.env`, live services, charges or data
changes; no `--live` flag. Model output is a dummy response, not medical evaluation.

`--baseline` reports current measurements. Before the fix both modes loaded the
card 4 times in 4 transactions, with 20/416 read queries and 4/400 review-question
reads for 1/100 old revealed cards. Serialized fixture results were 9,476/360,708
bytes. After the fix both sizes use 2 card reads, 2 transactions, 6 read queries,
zero review scans and 1,664 serialized fixture-result bytes. Session projection
returns metadata and only the matching item, not the full session/items JSON.
These numbers cover the
read/generation path BEFORE assistance persistence. They exclude real persistence,
its locked checks/view-building, auth/telemetry DB work and real network overhead;
they do not measure production SQL latency or costs.

Safety controls simulate a session-version change during the model call and
verify rejection before any mocked assistance write or help delivery. Premium
denial and foreign-session ownership also reject help, and inference runs with
zero open read transactions. Additional controls check freshness for cache hits
and no-source answers, prevent stale/failed-commit cache writes, refresh the
snapshot after reveal confirmation and skip navigation counts without an active
session. The actual persistence lock is not exercised here.

Without `--baseline`, the test enforces the read budget: zero unrelated
review-question reads or full saved-item review scans and at most two current-card
reads for pre/post-generation validation. It was RED before the approved F05 fix
and is now GREEN. Reveal confirmation intentionally adds a read after its mutation.
This command remains outside `pnpm test`.

## Pool idle timeout: isolated lifecycle reproduction

Current app setting: **10s** (`src/server/db/index.ts`). Latest comparison passed:
30s baseline 30,104.34ms; 15s candidate 15,106.08ms; 10s app 10,100.66ms;
5s candidate 5,101.94ms. Applied 10s saves 20,003.40ms post-response retention
(66.45% helper-lifetime reduction) in the isolated harness. Initial config check
failed against 15s, then passed after applying 10s. Lint/syntax checks passed.
These results do not measure production billing or live reconnection reliability.

```powershell
node tests/integration/poolIdleTimeout.integration.mjs --reproduce
node tests/integration/poolIdleTimeout.integration.mjs
```

Uses installed `@vercel/functions/db-connections` with real timers and a mocked
EventEmitter pool/request context. Reads the app's approved 10,000ms idle setting
without importing app code. Compares 15,000ms, 10,000ms and 5,000ms against the
original 30,000ms baseline; the app uses 10,000ms.
No `.env`, DB connections, HTTP/provider calls, Vercel deployment, charges or data
changes. Temporary Vercel environment values/context are restored in `finally`.
The `.mjs` entrypoint runs directly with Node; outside `pnpm test`.

`--reproduce` intentionally fails: the original 30s setting exceeds the candidate's
11s helper-lifetime budget despite a quick simulated response. The default run
checks each duration, pending background work at response completion and retention
reduction within 1s of the idle-setting difference. Response completion is a
synthetic marker after 25ms local work, not measured Next.js/HTTP latency.

This demonstrates helper-managed background retention, not a memory leak or
production billing savings. No real pg connection closure/reconnection, SQL locks,
concurrent traffic, memory allocation or Vercel log duration is measured.
Greg approved the 10s app setting on 2026-10-22; production validation remains.

Original 30s/5s harness comparison, 2026-10-22, Node 26.7.0, helper 3.9.8:

| Idle setting | Simulated response | Background lifetime after release | After response |
| --- | --- | --- | --- |
| 30s baseline | 27.08ms | 30,103.29ms | 30,102.99ms |
| 5s candidate | 27.95ms | 5,103.61ms | 5,103.52ms |

Default comparison passed: 24,999.47ms less post-response retention (83.05% less
helper lifetime). Initial reproduction failed as intended at 30,104.51ms against
the 6s budget. These percentages apply only to this isolated helper wait.

Approved 15s app setting rerun, same runtime/helper:

| Idle setting | Simulated response | Background lifetime after release | After response |
| --- | --- | --- | --- |
| 30s baseline | 30.03ms | 30,103.59ms | 30,103.30ms |
| 15s app setting | 27.62ms | 15,105.68ms | 15,105.60ms |

Comparison passed: 14,997.70ms less post-response retention, 49.82% less helper
lifetime. Test first failed against the unchanged 30s app configuration, then
passed after changing only `idleTimeoutMillis` to 15,000 in application code.
Targeted DB-module ESLint and Node syntax checks passed.

Connection-risk review: installed pg-pool 3.14.0 starts idle eviction on release
and clears the idle timer when acquiring that client. Checked-out queries and
transactions are not timed out by this setting. Requests after 10-30s of idle
time can now require a fresh connection, adding connection/auth latency and
potentially surfacing transient connection failures more often. Pool max remains
3 and connection timeout remains 10s. `attachDatabasePool` remains enabled.
[pg documentation](https://node-postgres.com/apis/pool) defines the setting for
idle, checked-in clients; [Vercel guidance](https://vercel.com/kb/guide/connection-pooling-with-functions)
recommends short idle timeouts (example: 5s). No live reconnection reliability or
production billing measurement was performed.

Historical four-setting comparison before applying 10s, same runtime/helper, 2026-10-22:

| Idle setting | Simulated response | Helper lifetime | Reduction vs 30s |
| --- | --- | --- | --- |
| 30s | 27.13ms | 30,104.64ms | baseline |
| 15s (app) | 27.28ms | 15,105.12ms | 49.82% |
| 10s | 27.59ms | 10,112.00ms | 66.41% |
| 5s | 27.72ms | 5,104.09ms | 83.05% |

All candidate assertions passed. No live connection reuse/reconnection workload
was measured, so this does not identify a production optimum. Compared with 5s,
10s preserves idle-client reuse for an additional 5s at the expense of about 5s
extra helper retention on an isolated release. App now uses the approved 10s
compromise, subject to production latency/error and memory-billing comparison.

Current [Neon Vercel guidance](https://neon.com/docs/guides/vercel-connection-methods)
recommends `pg`, a shared pool and `attachDatabasePool` with Drizzle, matching this
app. Its [serverless pooling guide](https://neon.com/docs/guides/serverless-connection-pooling)
shows `idleTimeoutMillis: 5000` for Vercel Fluid. Neither establishes 10s or 15s as
optimal for this app. Keep the lifecycle helper; lower idle timeout trades fewer
idle connections for more connection handshakes after gaps.

## Conventions

- One folder per module, mirroring the source area under test
  (e.g. `tests/mindmap/` covers `src/lib/mindmap/`).
- Name files `*.test.ts`.
- Import the code under test with the `@/` alias (e.g.
  `@/lib/mindmap/radialLayout`), not relative paths — tests stay
  location-independent.
- Shared harnesses belong in `tests/support`; feature fixtures stay beside tests.
- Keep `*.test.ts` deterministic and offline. External-service tests use explicit
  manual entrypoints in `tests/integration`, never `*.test.ts`.
- TDD for new/changed behavior: write a test, confirm the expected failure, implement
  until it passes, then refactor. No separate TDD folder is needed.
- Audit findings include suspected edge cases, performance/cost problems and
  optimization opportunities. Propose a measurable test first; follow Greg's approval
  workflow in `AGENTS.md`. Keep approved tests after they demonstrate the issue or
  optimization benefit. This is not a requirement to test every ordinary bug.

# Global Wolfek implementation plan

Status: core product decisions confirmed; initial public abuse limits and routing-cache policy proposed below. Route content and pilot tuning remain. Exam lifecycle inspected in source; browser integration verification belongs to implementation. Scope: planning only. Application behavior unchanged.

## Confirmed product decisions

- App assistance explains and points users to the relevant controls. Wolfek does not open profile forms, edit values or perform account operations for them. Existing learning interactions stay intact.
- On `/panel`, the first opening of the minimized Wolfek offers onboarding. Subsequent openings use the help menu; revisiting alone does not repeat onboarding. Other routes may define their own approved triggers.
- Jev is a core capability for every user, including anonymous visitors; it has no Premium gate or routine daily/session allowance. Public access uses abuse protection and shared routing-decision caching. Paid feature permissions remain separate.
- Active exams expose technical help only, within the current page and under the existing session rules.
- Onboarding and dismissals sync across devices for signed-in users; anonymous history remains browser-scoped.
- App help accepts a typed question and offers topic buttons. Jev routes typed questions to a known help topic with confidence; Wolfek presents a reviewed answer and points to the right control. Existing learning tutor behavior is unchanged.
- `/panel` is the primary first-visit welcome. Its onboarding offers an optional video tutorial with a text alternative. Current countdown behavior stays: active-plan deadline first; without a plan, Opiekun exam countdown or a create-plan prompt for other courses.
- `/panel` initially shows only the minimized Wolfek avatar in the bottom corner. The first manual opening shows onboarding; later openings show help. After an explicit topic choice or a typed question Jev routes confidently, the page scrolls to the matching section and briefly shows a separate animated marker there. The main Wolfek card keeps its current open/minimized state. There is no separate "Pokaż na stronie" control.

## Architecture decision

Keep Wolfek's existing interaction model and presentation. Add route adapters around a shared, event-driven coordinator. The app supplies the current route and server-verified capabilities; Jev uses that context to choose appropriate guidance or `none`. Jev can select an onboarding/help suggestion within the current route; server policy remains authoritative for access.

Flow: first visit/specific activity event → server route/access context → eligible guidance → Jev choice → freshness check → Wolfek explanation/direction → user operates the actual feature.

Manual opening exposes a question input and available help topics. A typed question goes through Jev Choice using the question, route context and allowed topic IDs; a selected button opens its reviewed answer directly. Low-confidence or `other` decisions invite clarification or show topic buttons. On `/panel`, a confident routed topic or explicit topic selection scrolls to the named section and shows a temporary Wolfek marker; clicking it reopens the answer. Applicable destination links may appear. The user opens/submits the actual form. During active exams, help stays within the page. Normal operation uses fresh or cached Jev decisions for both visitor types; prepared help remains usable during provider outages or public abuse throttling. No polling decision loop, automatic tutor calls or account/payment operations through app help.

## Existing foundations and constraints

- Reuse `components/wolfek/*`, `WolfekOverlay`, `useFloatingPanelPosition` and existing avatar/reaction behavior.
- Learning orchestration currently lives in `WolfekDock`, `usePracticeCompanion`, `actions/learning-support.ts` and `server/learning/*`. Preserve its grading, reveal, coaching triggers and Premium tutor handoff.
- `getUserEnrolledCourses` resolves effective grants. `/panel` requires at least one active course; it does not grant every course or feature.
- Tiers are `free/basic/premium/pro`. Some features use account-wide `getIsPremium`; category/procedure access can be course-specific. Reuse the target feature's authorization policy, rather than introduce a universal Premium boolean.
- `/kierunki` is `force-static`; `/kierunki/[slug]` already resolves personalized pricing. Keep the listing static and hydrate optional private context separately.
- `next.config.ts` does not enable Cache Components. This feature does not require enabling them application-wide.
- Existing Jev transport validates the response, pins the model and times out after one second. Practice now uses `reservePracticeJevCall`: atomic rolling limits of 6 calls/minute and 120 calls/hour per user, with trigger deduplication and a 45-second session cooldown. The old daily/session quotas and their required configuration fields are removed. Other route adapters retain their existing limits until migrated to the global policy.

## 1. Access and route context

Add a server-only companion context resolver using existing auth, enrollment, feature guards and pricing helpers. Return a minimal DTO: route ID, entity ID if relevant, access state, capability IDs, content version and context revision. Fetch progress or billing details only when that action needs them.

| Viewer state | Wolfek behavior |
|---|---|
| Signed out | Jev-selected public guidance and sign-in/course links; no private queries |
| Signed in, no valid enrollment | Course guidance; `/panel` keeps its existing redirect |
| Enrolled | Relevant course help and capabilities at the effective tier |
| Premium/Pro | Additional capabilities according to each feature's actual gate |
| Expired/revoked or purchase pending | Verified status/recovery guidance; never claim full access from a success URL |
| Auth/access unresolved or failed | Neutral help; withhold private/paid actions until verified |

A signed-out visitor may already own a Clerk account; Wolfek cannot determine that until sign-in. Clerk identity and course entitlement are separate facts. Lifetime access is not necessarily an active subscription.

Re-check authorization at every protected read/action and after provider inference. Never accept client-supplied user IDs, tier flags or ownership claims. Refresh UI context on sign-in/out, account change, confirmed purchase/plan change, route activation and entitlement expiry. Payment webhooks remain authoritative; reuse existing purchase verification for delayed completion.

Use explicit route patterns with specific matches before dynamic catch-alls. `/panel/nauka/notatki/[noteId]`, custom `moje-testy__` categories and normal practice categories need distinct adapters. Unknown, loading, error and not-found states have no proactive recommendation.

## 2. One host, specialized adapters

Mount a host at `/panel` layout level and the same host implementation at `/kierunki` layout level. Only one host is active per page. Keep page shells server-rendered; stream asynchronous companion context independently where available.

A small client route observer updates the route key during soft navigation. Route components publish typed activity state and registered help targets; pathname alone cannot distinguish an exam introduction from an active attempt or submitted result. Registration uses an owner token so an old component's cleanup cannot remove a newer adapter. Help targets identify stable controls/sections; if a target is absent or hidden, explain the alternate path instead of pointing at an unrelated element.

Give each navigation/activity context a revision. Clear previous-route content immediately; cancel or ignore late results. Requests/results include route/entity, content and policy versions; server checks authoritative state and client checks the current navigation revision. Only committed client navigation emits a visit event: RSC prefetch/render must never trigger Jev or onboarding writes.

During migration, the host excludes learning routes while the existing dock owns them. Then move the learning presentation into the host atomically, retaining the learning adapter and server actions. Never render two Wolfeks. Coordinate launcher placement with `MobileAIFloat`, open modals, mobile safe areas and keyboard focus.

## 3. Jev decision coordinator

Extract generic transport, validation, caching and request coordination into `server/companion/`; retain separate, versioned practice and app-help policies. Replace quota configuration with public abuse-limit configuration and usage telemetry. Avoid turning practice state into a giant optional-field object: use typed domain variants in `types/companionTypes.ts`.

1. Validate the event; authenticate where needed; resolve route/entity and canonical capability checks.
2. Load the current route's candidate metadata and only the state required by that trigger.
3. Remove inaccessible, unsupported, dismissed or already-completed actions. Preserve `none`.
4. Reuse an exact eligible cached decision. On a miss, claim one in-flight request, apply public abuse controls where required, and make one Choice request. Concurrent identical requests share that result.
5. Validate the returned action ID, policy/content versions and fresh access/state. Discard stale responses.
6. Show trusted copy and a registered help target. Record viewed/dismissed/onboarding-completed separately; following a pointer does not mean the user completed the underlying feature.

Confirmed `/panel` policy: show only the minimized avatar on arrival. The first manual opening offers onboarding; later openings show question input and topic buttons. Proposed action triggers for other routes include verified feature milestones/empty states, finalized per route. Existing learning triggers remain unchanged. Ordinary navigation revisits, hover, scrolling, opening Wolfek, animations and reading curated answers do not call Jev. Persist offered, dismissed and completed separately so an incomplete or dismissed tour does not restart on every visit. Manual replay remains available.

Send Jev the bounded user question when typed, route ID, capability flags, relevant progress summaries and recent dismissals. No identity, answer keys, raw notes, billing records, entire catalogs or videos. Jev chooses topic/action IDs and returns confidence; code supplies reviewed text, destinations and handlers. `other` and low-confidence outcomes ask for clarification. This follows the existing [TypeSafe Choice contract](https://docs.typesafe.ai/primitives/choice).

Signed-in users receive Jev across their eligible routes without per-day or per-session model-call allowances. Keep server-validated triggers, request deduplication, coaching cooldowns and provider concurrency/backpressure; these prevent duplicate work and overload, not ordinary use. Verify Clerk identity on every protected action; client route/auth flags never select the authenticated path. On failure/`none`, retain the normal menu without repeated prompts.

For public requests, resolve optional Clerk auth on the server. Verified signed-in callers use authenticated handling; everyone else uses the anonymous guards below. Authenticated users without course access can still receive public course guidance. A signed cookie is not authentication.

## 3a. Availability, public safeguards and initial limits

Published Jev pricing checked 2026-09-28: $0.042 per million input tokens, output free. At an assumed 1,000 input tokens/call, 10,000 uncached calls cost about $0.42 and 100,000 cost $4.20. These estimates exclude Redis, hosting and other AI calls. Measure actual `usage.input_tokens`, including instructions/candidates. Source: [TypeSafe model reference](https://docs.typesafe.ai/models).

Use usage/cost reporting and anomaly alerts instead of a routine global daily cutoff. Jev availability must not depend on a user's subscription tier or whether another user exhausted a shared daily allowance. Provider outages/limits still require graceful fallback; this is not a promise of unlimited provider throughput.

Proposed starting settings, configurable and unmeasured:

| Scope | Initial setting | Applies to |
|---|---|---|
| Signed-in viewer | No daily/session allowance | Normal eligible Jev use |
| Anonymous browser | 6/minute and 60/hour | New uncached provider calls |
| Anonymous trusted source IP | 60/minute | New uncached provider calls across rotated cookies |
| Anonymous traffic pool | 120/minute, at most 5 in flight | New uncached provider calls across all public visitors |
| Identical decision input | One in-flight call per key | All viewers; duplicates reuse result |
| Equivalent route decision | 24-hour TTL; version invalidation | Shared non-personal routing/help-profile decision |
| Personalized decision | At most 30 seconds, same user and state fingerprint | Retry/remount reuse; never shared between users |

The public limits count actual new calls, not cache hits, prepared answers or repeated button reads. Apply a separate coarse edge/request flood guard before expensive validation/Redis work so cache-hit floods cannot overload the app. Its deployment-specific threshold is infrastructure tuning, not a Jev allowance. Shared networks must retain cached/manual help even when their new-call limit is reached. Monitor legitimate throttling and adjust these starting rates.

Issue a signed, expiring visitor cookie on the first companion server request. Use deployment-trusted source IP metadata only, with short-lived server-side keys; never send IP/cookie identifiers to Jev. Cookie rotation cannot bypass the IP or anonymous-pool limits. If trusted IP metadata is unavailable, the pool limit remains mandatory. No fingerprinting or mandatory CAPTCHA in v1; add a challenge only if observed abuse justifies it.

Reserve anonymous counters atomically after the cache recheck and before inference. Release in-flight leases safely; completed reservations reflect attempted calls even if the provider times out. Do not use a fresh client event ID to bypass deduplication: derive keys from validated trigger evidence and canonical decision inputs. Validate allowlisted routes, entities, triggers and bounded payloads; callers cannot supply prompts, arbitrary candidates or provider options.

On public throttling, return a valid matching cached decision when available; otherwise keep prepared help usable without a model call. Never reuse a different access/context decision just to avoid a miss. If Redis cannot enforce public limits, stop new anonymous provider calls while serving available local/client cached help. Existing `checkRateLimit` fails open, so it cannot be the sole anonymous guard. Authenticated coordination failures follow the existing safe fallback until recovery, without creating a new user allowance.

Respect provider backpressure and any retry timing; do not retry in a loop. Bound anonymous throughput separately and prioritize authenticated work so a public flood cannot consume the entire provider capacity. Track input tokens, cache hits/misses, actual calls, public throttling and fallback reasons by surface. No automatic daily spend cutoff by default; retain operational flags for a real incident.

## 4. Content and caching

| Layer | Contents | Loading/cache |
|---|---|---|
| Route manifest | Route ID, adapter, pack/version references | Tiny shared metadata; no answer bodies |
| Route pack | Action IDs, labels, requirements, trigger rules, short decision descriptions | Current route only; versioned module/static data |
| Jev routing decision | Selected route help profile/action IDs from equivalent non-personal inputs | Shared Redis cache; 24-hour TTL plus exact model/policy/content/input key |
| Help topic | Reviewed answer, steps, use case, optional story/video reference | Load selected topic; public content cache by topic/version/locale |
| User context | Effective access, relevant progress, onboarding state | Request-local server deduplication; scoped React Query cache |
| Rich UI/media | Story player, video, optional tutor UI | Dynamic client import/play-on-request; no video prefetch |

Start with typed, versioned authored files under `constants/companion/`; maintainable without building a CMS. Use explicit lazy import loaders, not a barrel importing every route's answers. Content definitions include stable topic/action IDs, version, requirements, answer/steps, optional media reference, and source/review metadata. Missing video falls back to useful text.

Routing cache means application-owned storage of validated Jev decisions, not assumed provider prompt caching. Build the key from canonical route ID, allowlisted public entity, locale, activity/onboarding mode, capability/candidate set and model/policy/content versions, covering every non-personal input actually sent to Jev. Strip irrelevant URL tracking parameters; reject unknown routes before cache lookup/inference. Bound input combinations to prevent arbitrary URLs creating unlimited cache keys. No global caching of private notes, progress, billing data, user-specific destinations or personal recommendations.

If a decision uses typed text, personal progress or dismissals, scope it to the viewer by default and include the full relevant state fingerprint; do not reduce it to a route-only key. Use a bounded, normalized question and a hash in the short-lived cache key, never raw question text as a Redis key. A route-profile decision may be shared only when its inputs are explicitly non-personal. Avoid automatically adding a second Jev call for every visit: an existing profile/cache hit plus local eligibility may suffice; personal choice runs only for its approved trigger. Re-check current access, candidate membership and onboarding/dismissal state before displaying any cached result. Never cache a timeout/transport error as a valid `none`; a schema-valid Jev `none` can be cached for equivalent inputs.

Product help is authoritative app documentation, not medical evidence. Billing figures and course offers come from existing live helpers, not duplicated prose. Medical assistance continues through `retrieveContext` and existing tutor rules. Declare this product-help boundary in repository documentation before adding any generative app-help path.

Use React Query for remote client data, seeded from server props when available; Zustand holds only transient UI/preferences. Private keys include viewer, route/entity and context revision; public keys use pack/topic/version/locale. Centralize stale times, cap cache lifetime, clear private queries on account change, invalidate affected queries after mutations, and avoid persisting private context to localStorage. Cached access never authorizes execution.

Load heavy UI through a small Client Component boundary; Next.js does not currently automatically split a Client Component dynamically imported by a Server Component. See [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading). Layout snapshots are not sufficient authorization on navigation; check near data/actions as described in [Next.js authentication](https://nextjs.org/docs/app/guides/authentication).

## 5. Proposed route coverage

These are capability candidates, not final approved Q&A. Approve each route's content separately using: audience → options → exact answers → trigger → target handler → optional story.

| Route family | Initial capabilities |
|---|---|
| `/panel` | Minimized corner avatar; first opening offers a tour with optional video and text alternative; typed Jev help for the catalog below. Timer answer follows the actual plan/course branch. |
| `/panel/nauka` | Explain visible sections and cells; guide a first activity; notes/materials/storage help |
| `/panel/nauka/[category]` | Preserve current practice coaching; separate browse-only behavior for custom categories |
| `/panel/nauka/notatki/[noteId]` | Editor/save/pin guidance; ownership checked; no note text sent to Jev |
| `/panel/testy-egzaminy` | Theory/practical comparison; available exam paths for enrolled courses |
| `/panel/testy` | Explain test configuration, categories, timing and results |
| `/panel/egzaminy` | Explain practical sheets and modes available to this user |
| `/panel/testy/[value]`, `/panel/egzaminy/[slug]`, `/panel/diagnozy/egzamin` | Intro/results help; on-demand technical help only during active attempts; preserve each runner's lifecycle |
| `/panel/wyniki`, `/panel/wyniki/[testId]` | Explain recorded results and verified next-step links; ownership checked |
| `/panel/procedury`, `/panel/procedury/[course]`, `/panel/procedury/[course]/[slug]` | Navigation, learning modes, progress and eligible challenges |
| `/panel/procedury/[course]/[slug]/wyzwania`, `/panel/procedury/[course]/[slug]/wyzwania/[type]` | Explain challenge types; on-demand technical help during scored attempts; preserve course-specific Premium gates |
| `/panel/diagnozy`, `/panel/diagnozy/[slug]` | Explain case-learning workflow and available modes; no new clinical generation |
| `/panel/plan` | Explain setup, schedule and recorded progress; point to planner controls |
| `/panel/kursy`, `/panel/kursy/[categoryId]` | Explain owned courses, category availability and eligible upgrade links |
| `/panel/dodaj-test` | Explain authoring/import options; existing Premium gate |
| `/panel/ustawienia` | Explain preferences; point to existing controls |
| `/kierunki`, `/kierunki/[slug]` | Jev-selected guidance for both visitor types; authored course/offer explanations; point to correct sign-in/buy/resume/upgrade CTA |

Cell coverage must follow the actual UI: note, AI assistant, drawing board, test, flashcard and mind map are add-cell options; plan/media also exist as generated content. Do not advertise unavailable actions. Stories and videos are a later editorial workstream; no fabricated clips or placeholder promises.

### Approved `/panel` help catalog

Jev receives the typed Polish question, route `panel.home`, a compact verified capability/state DTO and a Choice over these topic IDs plus `other`. It returns the topic, probabilities and confidence. Wolfek supplies reviewed text naming the relevant existing control; no profile/payment operation happens inside the companion. Topic buttons bypass Jev. An optional video tutorial appears in first-opening onboarding only when a real asset exists, otherwise a text tour. Unclear/out-of-catalog questions show clarification and topic choices.

| Topic ID | Questions covered | Target/source |
|---|---|---|
| `first_steps` | How dashboard works; what to do first; checklist meaning | `DynamicBoard`, `OnboardingChecklist`; point to relevant section |
| `profile` | Change/view username or motto | `UsernameForm`, `MottoForm`, `Username`, `UserMotto` |
| `courses` | Owned courses, tier, continue, buy another course | `CourseAccessWidget`, `UserOnboard`, effective enrollments |
| `countdown` | What timer means; exam date; own study-plan deadline | `PlanCountdown` state: active plan, Opiekun exam period, or other-course create-plan prompt; no Pielęgniarstwo exam countdown added |
| `results` | Solved questions, attempts, total score, accuracy, 30-day trend | `StatsRow`, `UserAnalyticsClient`; values fetched for a self-state answer only |
| `difficult_questions` | Where/why problematic questions appear; empty state | `QuestionAccuracyList`; its existing below-50% rule |
| `plan` | Plan progress, days left, today's work, create/open plan | `AnalyticsPlanTab`, `PlanCountdown`, `/panel/plan`; branch on actual active plan |
| `billing` | Subscription vs lifetime, status, manage/cancel, scheduled downgrade | `DashboardBillingCard`, `BillingSummaryList`, existing billing portal button only for subscriptions |
| `storage` | Used/remaining space, limit reached | `StorageQuotaWidget`; live usage/limit |
| `badges` | Earned badges and how to earn them | `BadgeWidget`; empty state points to procedures |
| `navigation` | Tests, learning, procedures, AI notebook/lectures | `UserOnboard`, existing route links; respect each feature's access |
| `forum` | Recent forum activity, notifications, join discussion | `ForumActivityCard`; own activity only |
| `feedback` | How to leave feedback | `TestimonialForm` |

Checklists are presently device-local and manually ticked; Wolfek's synced first-visit state is separate until checklist migration is explicitly included. The dashboard feature grid's Premium badge and buy/continue messaging may not represent every effective entitlement; Wolfek uses authoritative course grants and billing state, not those labels. Route help content stays in Polish.

`/panel` shows five featured topics: first steps, courses, results, billing, and "Co oferuje platforma". `Więcej tematów` scrolls through the remaining topics; typed questions still reach every topic. Use the same raised, icon-bearing chip style and reduced-motion-aware reveal as the learning Wolfek. Keep the avatar minimized by default. After a selected or confidently routed topic, scroll to the exact section and show the brief pinging Wolfek marker; it can reopen the preserved answer.

## 5a. Exam lifecycle audit and technical-help contract

Source inspection found different lifecycles; do not describe them as one cancellation mechanism:

| Runner | Current behavior | Integration consequence |
|---|---|---|
| Theory: `GenerateTests` | `useBeaconCleanup` sends expiry on `document.hidden`, `pagehide` and a genuine unmount. `/api/session/expire` changes the owned ACTIVE session to EXPIRED, not CANCELLED. Same-session development remounts are guarded. | Help must not navigate, reload, open another tab or unmount/re-key the exam. Preserve visibility/unload guards. |
| Theory heartbeat/deadline | `useSessionHeartbeat` sends immediately, every two minutes and when visible again. Cleanup expires ACTIVE sessions past their deadline or with over five minutes of inactivity when it runs. Submission checks ACTIVE status and the absolute deadline. | Reading help does not pause time, stop heartbeat, extend the deadline or revive an expired session. Heartbeat is transport activity, not mouse/keyboard inactivity. |
| Practical: `PracticalExamRunner` | `brief/exam/results` and answers are component state; timer expiry requests form submission. No theory beacon/heartbeat hook is used. | Keep runner/timer mounted and answers intact; preserve auto-submit. Do not promise saved drafts, resume or identical tab-switch cancellation. |
| Diagnozy: `useDiagnozyExam` / `EgzaminRunner` | Attempt/answers are client state; timer invokes submit with an existing duplicate-submit guard. No theory beacon/heartbeat hook is used. | Keep state/timer mounted and preserve submit guard. Do not promise theory-style cancellation or resume. |

Relevant sources: [beacon cleanup](../../src/hooks/useBeaconCleanup.ts), [heartbeat](../../src/hooks/useSessionHeartbeat.ts), [expiry endpoint](../../src/app/api/session/expire/route.ts), [cleanup](../../src/app/api/cron/cleanup-sessions/route.ts), [theory runner](../../src/components/GenerateTests.tsx), [practical runner](../../src/components/PracticalExamRunner.tsx), [Diagnozy state](../../src/hooks/useDiagnozyExam.ts).

Technical help is manually opened, with allowlisted topics such as selecting/changing an answer, moving within the exam, locating submission, timer behavior and the actual leave-page rule for that runner. No answer hints, comparison, clinical explanations, tutor, study links, marketing, videos or onboarding tours while an attempt is active. Defer first-visit onboarding to a safe intro/results state; do not mark it offered while suppressed. Jev receives only the exam mode and technical candidate metadata, never question content or answers.

Keep Wolfek outside the exam form, with explicit `type="button"` controls and independent component state. Opening/closing help must neither submit/reset the form nor refresh the route, replace the runner, alter timer props or change its key. Use same-document text and stable control highlights; no `window.open`, download or external app handoff. Focus moves within the page; the audited theory hook does not expire on element blur, but browser behavior still needs verification. Do not disable anti-cheat listeners while help is open.

Load the small technical pack with the exam UI so answers remain available if network/Jev fails. Help selection uses the pack directly; no background Jev requests during an active timed attempt. Clear earlier coaching suggestions immediately on exam start. Submission, expiry and terminal-state UI take precedence over open help; closing help must never restore stale session state. Wolfek can explain how to leave and the consequence, but the user uses the existing navigation; no companion cancel/restart handler.

Required browser checks before enabling this adapter: open/close and keyboard-focus help without expiry; no accidental submit or lost answers; unchanged deadline and heartbeat; timer expiry/auto-submit while help is open; real tab hiding/page unload/navigation still expires theory; Strict Mode remount guard remains intact; late companion responses cannot restore learning actions; mobile switching and back/forward behavior. Existing session cleanup/expiry tests are a baseline, not evidence that overlay integration already works. Exam-integrity policy changes remain outside this feature.

## 6. Persistence and observability

For the `/panel` pilot, store the seen marker in existing Upstash Redis under the verified Clerk user ID, with a one-year expiry and cleanup on account deletion. No schema change or new environment variable. Read it on page load and refresh it via React Query after acknowledgment or window focus. If Redis is unavailable, keep manual help usable and let onboarding replay on another visit. Future routes may need richer offered/completed/dismissed progress; design those records when their interactions are approved. Content-cache versions are separate from onboarding versions.

Anonymous onboarding history is browser-scoped, never inferred from an IP address. On sign-in, merge only validated offered/dismissed/completed topic markers; never merge access, learning progress or budgets. Keep display preferences separate from entitlements and educational memory. Local preference migration preserves existing practice visibility. Content version changes invalidate content caches but do not automatically replay onboarding; replay is explicit.

Use bounded decision/interaction telemetry: route, policy/content version, action, latency, usage, fallback and outcome. No raw content or billing data. Define retention before adding storage; transient deduplication/cooldowns belong in Redis. Route visits/help dismissals never enter student mastery or study-minute records. Reuse existing observability infrastructure where sufficient.

## 7. Delivery sequence and acceptance

1. Foundation: access matrix, typed route/action contracts, scoped context resolver, content-pack loaders and Redis-backed synced onboarding. Verify mixed-course tiers, lifetime/subscription grants, expiry, revoked access and cross-device behavior.
2. Dashboard pilot: shared host, help menu, directions/highlights for existing controls, billing/progress reads. Verify manual operation with Jev off, no profile/account mutations through Wolfek and no added page-render dependency on Jev.
3. Decision pilot: app-help policy, routing cache, request deduplication, public miss limits, dismissals and usage telemetry. Replace old shared daily/session quota gates and their required config fields when migrating each adapter; preserve learning trigger/cooldown behavior. Start new policy in shadow mode; review choices before active rollout.
4. Learning integration: migrate existing adapter without behavior changes; add `/panel/nauka` and exam-hub packs. Verify no duplicate Wolfek, lost practice state or altered grading.
5. Remaining panel families: add packs/adapters in the table; confirm exact route Q&A incrementally. Enforce assessment-state behavior.
6. Marketing: retain the static public shell; add Jev guidance for anonymous and signed-in visitors with the abuse controls above and authenticated offer context where available. Add authored stories/videos when ready.

The `/panel` pilot is available on its route without a new feature flag. Other route adapters can be introduced incrementally; existing practice remains independently switchable. Rollback removes the new surface/policy without deleting learning data. Avoid unrelated page rewrites; changed page structure follows current shell/Suspense rules.

Acceptance checks: mocked Jev timeout/invalid choice/`none`/public throttling; every viewer tier can use Jev; ordinary signed-in use has no daily/session cutoff; identical public inputs cause one provider call under concurrency; cache hits consume no inference allowance; changed model/policy/content/access/state prevents incorrect reuse; public counters do not throttle authenticated requests; rapid navigation and late results; first-visit deduplication, cross-device sync/conflicts and manual replay; cookie rotation/blocked cookies/spoofed route or network headers/concurrent requests/Redis failure; shared-network legitimate visitors; account switching/cache isolation; stale entitlements and delayed purchases; private object ownership; active-exam technical-only allowlist and lifecycle checks above; existing learning behavior; correct help targets without form submission; keyboard/mobile/reduced motion; useful text without media. Measure payloads, provider calls, cache-hit rate, public throttling and infrastructure costs. Unrelated packs, players and full private history must be absent from initial loads. Tune initial public settings from pilot evidence.

Implementation validation: focused policy/authorization/race regression tests, TypeScript, lint and appropriate build checks. No live provider tests or migration/data-changing scripts without explicit approval. This planning task runs none.

## Unresolved questions

- No remaining core product questions.
- Route Q&A: exact copy and triggers, discussed per route. `/panel` first-visit video asset/storyboard is pending; text tour works first.
- Public rate/cache defaults are specified; tune with pilot traffic. No further budget decision blocks the architecture.

## `/panel` pilot activation

The route renders Wolfek by default. It uses the existing Redis connection for cross-device onboarding and the existing Jev key for typed queries. Jev is always active in code; no mode environment variable is required. No migration or new environment variable is required. The minimized avatar opens a text tour on first use, then question input and topic buttons. Buttons work if Jev or Redis is unavailable. The bottom-right video shortcut opens a modal; before a topic has a recorded video it says the film is coming. Add approved UploadThing URLs by topic in `src/constants/panelWolfekVideos.ts`; available topics pulse the shortcut and lazy-load the existing `VideoPlayer`. Jev returns only the topic ID, never a URL. No public-route adapter is enabled in this pilot.

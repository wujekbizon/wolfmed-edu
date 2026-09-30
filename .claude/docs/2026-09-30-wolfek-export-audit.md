# Wolfek export audit — 2026-09-30

Verdict, corrected after Greg clarified intent: the primary failure is architectural. Frequent-question buttons should submit their visible question to Jev through the same decision pipeline as typed questions. Jev should receive JSON containing relevant verified data and available response objects, select the appropriate response, and Wolfek should display that selection. Current buttons bypass Jev, and current typed calls select broad topics before code chooses a canned answer. Successful API transport does not satisfy the intended product contract.

The September 28 global plan explicitly prescribed button bypass. That documented direction was a misunderstanding of Greg's intended experience; his clarification supersedes it. Answer quality is secondary to restoring the decision boundary.

Required contract: prepared question button / typed question → validated server input → current scoped facts and response candidates in JSON → Jev response selection → validate selection → display selected response. A button's identity must not directly select its answer. Response wording can exist as supplied content, but a code branch must not bypass Jev to choose it. Unknown/no suitable response must remain an explicit possible outcome. Cache reuse, if retained, must represent a prior Jev decision for the same input and relevant state, never a direct FAQ lookup.

Scope: current working tree, including existing uncommitted changes; four supplied September JSON exports. No production queries, paid inference, migrations, or implementation changes.

## Evidence and coverage

| Route | Typed questions | Topic clicks | Jev calls |
|---|---:|---:|---:|
| Kierunki, course owner | 3 | 5 | 3 |
| Kierunki, second user described as no-course | 0 | 5 | 0 |
| Panel home, course owner | 0 | 14 | 0 |
| Panel results, course owner | 1 | 5 | 1 |
| Learning practice | 0 recorded | 0 recorded | 0 |

Totals reconcile: 4 questions, 29 clicks, 4 provider calls, 4,547 input tokens, 390 output tokens, zero recorded provider errors. Mean provider latency: 290 ms. All recorded activity is September 30; this is not a month of usage evidence.

The second user's course state is supplied by Greg, not recorded in click rows. Panel-home buttons were exercised, but its typed-question selector was not. No-course and anonymous typed questions, repeated questions/cache, failures and practice coaching are unverified by these exports.

## Tested questions versus code-derived answers

Exports retain questions and Jev choices, not final displayed answers. The following answer behavior is reconstructed from current code, not a captured production response.

| Question | Jev choice / confidence | Answer behavior | Assessment |
|---|---|---|---|
| `co daje Premium ?` | tier_comparison / .93 | Catalog feature summary across all available courses | Broadly relevant, incomplete; Nursing AI omitted by truncation |
| `czy moge płacić kartą za subskrypcje ?` | payment_models / .98 | Cancellation, upgrade and lifetime/subscription comparison | Does not answer card availability |
| `czy jest jakiś video tutorial dostępny jak wygląda kurs Opiekuna Medycznego?` | owned_course / .80 | Lists owned courses and links to panel | Does not answer video availability |
| `ile mam ukończonych testów dotychczas ?` | results_history / .96 | Explains history navigation/sorting | Does not fetch or state a count |

High confidence describes the selected category, not whether the eventual template answers the question. Zero errors/reviews therefore does not establish answer correctness.

## Findings

### P1 — Question intent disappears after broad topic selection

`askKierunkiWolfekAction` and `askPanelWolfekAction` pass only the selected topic and context to answer builders. Original question, requested course and requested detail are discarded. Every question within one topic receives the same template for a given state.

- Card payment is included in the payment rubric, but its answer has no payment-method facts: `src/constants/kierunkiWolfek.ts`, `src/server/companion/getKierunkiWolfekAnswer.ts:25`.
- Completed-test count maps to history, but the results builder receives neither user ID nor result data: `src/server/companion/getPanelResultsWolfekAnswer.ts:12`. Existing `getCompletedTestsByUser` is user-scoped and can supply the underlying records; an aggregate should supply the count.
- Video availability has no dedicated intent or availability field. Both video registries are empty. `owned_course` also returns no `courseSlug`, so the answer cannot activate the course-presentation button: `src/constants/kierunkiWolfekVideos.ts`, `src/constants/panelWolfekVideos.ts`, `src/server/companion/getKierunkiWolfekAnswer.ts:31`, `src/components/wolfek/KierunkiWolfekCard.tsx`.

Fix direction: select answerable intents and requested course, then query/render their facts. Unknown payment methods or absent videos need explicit availability answers. More model context alone cannot fix a template that ignores those facts.

### P2 — Duplicated course claims drift from catalog

Wolfek advertises over 3,000 Opiekun questions while the configured Basic catalog advertises over 900. Neither statement queries question counts. This proves inconsistent claims, not which number matches production inventory.

Sources: `src/server/companion/getKierunkiWolfekAnswer.ts:16`, `src/constants/careerPathsData.ts:446`.

Nursing counts, duration and English level are also embedded directly in answer prose. Reuse catalog fields for product descriptions; use inventory queries when claiming current counts. An approved static catalog is acceptable, but it is not live database data.

### P2 — Premium comparison hides major capabilities

`src/helpers/getKierunkiWolfekTierComparison.ts:8` and `:11` slice Basic and Premium lists to four entries. After removing the inheritance item, Nursing's first four Premium entries stop at Diagnozy/Interwencje: AI tutor, audio/notes and AI tests/diagrams disappear. Opiekun's summary includes its tutor but drops further AI tools. Response scope is also every course, regardless of a specifically requested course.

Fix direction: explicit comparison fields or an intentional summary with a full-details destination; preserve requested course.

### P2 — Owning a course replaces the requested guidance

`src/helpers/getKierunkiWolfekCourseAnswer.ts:9` replaces exam, professional-development and English explanations with a generic ownership message. The owner's exam/development clicks thus do not explain how to prepare or develop. Avoiding duplicate checkout should alter the CTA while retaining useful course guidance.

### P2 — Monitoring measures transport/classification, not delivered answers

- Jev `success` means HTTP and parsed response succeeded. Interaction reviews flag only other/null/low confidence. All three demonstrated answer gaps pass this check: `src/server/jev/callJev.ts`, `src/server/jev/recordWolfekInteraction.ts`.
- Panel interactions are recorded before final answer fetching, so an answer-data failure can follow a recorded provider success: `src/actions/panel-wolfek.ts`.
- No final answer, answer-data snapshot, delivery result or interaction-to-provider ID is retained. Historical answer correctness cannot be established from these exports.
- Pre-provider failures collapse to `unavailable`; missing key, Redis failure, reservation denial and duplicate lock are not distinguished. Errors export contains provider failures only: `src/server/wolfek-admin/buildAuditWhere.ts`.
- Practice calls reach the shared audit log, but practice acceptance/dismissal and decisions are stored separately in learning events. `WolfekInteraction` excludes practice; insights explicitly excludes it: `src/types/wolfekMetricTypes.ts`, `src/server/wolfek-admin/buildInteractionWhere.ts`.
- Usage topics are limited to 12, explaining why exported topic totals omit some activity: `src/server/wolfek-admin/getWolfekMetrics.ts:35`.

Fix direction: distinguish provider, selection, data-fetch and delivery outcomes; record bounded relevant fact snapshots and correlation IDs; include practice outcome telemetry. Label the topic list as top 12.

### P2 — Audit writes sit on the response path

`src/server/jev/callJev.ts:41` awaits the audit database transaction before returning. The logged 251–328 ms excludes that write and later interaction/answer queries. Exported audit `createdAt - startedAt` is 2,731–2,807 ms, suggesting material logging/database overhead; clock alignment and database timestamp semantics must be checked before attributing an exact delay.

Fix direction: measure complete action latency separately; consider durable background logging with failure accounting. Current 290 ms is provider timing, not user-visible response timing.

## Data provenance

| Data | Actual source | Hardcoded? |
|---|---|---|
| Owned courses / effective tier | User-scoped enrollments and entitlement logic | No |
| Panel results, difficult-question count | Current user totals / completed-test analytics | No; predefined surrounding prose |
| Plan, deadline, storage, badges | User-scoped server queries | No; templates expose only selected fields |
| Panel billing | Billing overview query | Live existence check; answer remains generic, no dates/status detail |
| Course titles / features | `careerPathsData` | Static shared catalog |
| Offer amounts | `PAYMENT_OFFERS` | Static configured amounts, not fetched Stripe prices |
| Offer availability | Static flag + price environment-variable presence | Configuration check; does not verify live Stripe readiness |
| Payment policy / course marketing claims | Answer-builder literals | Yes, duplicated prose |
| Results-page explanations | Five answer-builder literals | Entirely predefined, no per-user results |
| Videos | Empty constant registries | No configured videos |
| Practice recommendation evidence | Session events, practice/test/study summaries, plan and Premium checks | Dynamic evidence; candidate rubrics and displayed messages predefined |

Checkout separately verifies Stripe prices in `src/server/stripeOffer.ts`; Wolfek does not run that verification. Do not equate its `available: true` with a confirmed successful checkout. Actual account payment-method configuration was not inspected.

Panel username/motto questions return editing instructions even when rubrics mention checking their current values. Plan/billing/countdown questions likewise receive summaries or navigation, rather than every detail covered by their broad rubric.

## Jev integration assessment

Request endpoint, Bearer auth, JSON `model/state/questions`, Choice rubrics and response shapes match [TypeSafe API](https://docs.typesafe.ai/api). Choice is appropriate for selecting a fixed intent/action; [TypeSafe Choice](https://docs.typesafe.ai/primitives/choice) recommends descriptions that separate choices. Current pricing/tier comparison and owned-course/course-specific rubrics overlap.

Parsers validate pinned model, allowed options, complete probability maps, sum and winning option. Missing/invalid responses abstain; cache and reservations prevent unnecessary calls. Grading and visual reactions require no inference. Topic clicks currently bypass inference, which violates Greg's clarified app-help requirement.

Practice only invokes Jev after confirmed coaching triggers, not for every card/question: three distinct first errors, new independent error after help, or three distinct reveals. Server validates session ownership/revision, filters eligible actions and rechecks freshness before applying the selection. Medical tutoring is a separate Premium RAG flow. Reviewed material registry is empty, so verified-material recommendations are currently unavailable.

Confidence settings differ: topic routing .35; practice 0. These exports contain no uncertain decisions and no practice decisions, so cannot validate either setting. Select thresholds from labeled scenarios; raising a threshold cannot repair missing answer intents.

## Validation and follow-up

11 existing companion/parser/admin tests passed. All four exported responses replayed successfully through current route-specific parsers. No paid calls, database reads or browser replay. Export replay validates selection parsing, not displayed-answer correctness.

Priority: repair count/payment/video intent handling; consolidate factual sources and preserve course-specific guidance; capture delivered outcomes; then evaluate Polish question-to-answer scenarios.

Needed coverage: typed panel-home questions; typed no-course and anonymous questions; requested-course pricing/upgrades; ambiguous/out-of-scope questions; repeated/cache requests; unavailable provider/Redis; practice triggers for Basic/Premium, abstention and acceptance/dismissal; exact numerical answers checked against user-scoped records.

Unresolved: actual Opiekun inventory count; configured Stripe payment methods; intended video URLs; whether Wolfek should support follow-up conversations. No evidence here establishes those facts.

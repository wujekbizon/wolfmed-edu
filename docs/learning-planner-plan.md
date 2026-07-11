# Plan Nauki — Learning Planner Feature Plan

## Context

Wolfmed users currently have no way to organize their learning over time. The only
time-related feature is `ExamCountdown`, which counts down to the hard-coded Polish
state-exam sessions (`src/constants/examDates.ts`) — useful only for
`opiekun-medyczny` students and dead information for `pielegniarstwo` students.

Goal: let a user set a **due date**, declare **how much time per day** they can study,
pick **which concepts** to cover, and then have the app actively help them execute —
progress tracking tied to real activity, in-app notifications, feature tips, motivation,
and a bridge to the Forum. Explicitly **not** "yet another static timetable": the plan
must react to what the user actually does in the app, or it will die unused.

## Decisions taken (overridable)

These were the open questions; the recommended option was chosen for each:

1. **Foundation: first-class planner** — new DB tables + dedicated `/panel/plan` page.
   The existing AI "plan" cell (`planujTool` → `LearningPlan` JSON in the cells
   workspace) stays untouched; later it becomes one way to pre-fill a plan's concepts.
   Rationale: JSON blobs inside `wolfmed_user_cells_list` can't be queried for
   notifications, streaks, or countdown widgets.
2. **Progress: auto + manual hybrid** — activity auto-detected from existing tables
   (completed tests, challenge completions, notes) PLUS manual concept check-offs and a
   manual "I studied X minutes" log (for offline studying from books/materials).
3. **Notifications: bell + inbox, lazily generated** — new `notifications` table + bell
   icon with unread badge. Notifications are generated idempotently when the user visits
   the panel (no cron in v1; the `cleanup-sessions` cron pattern exists if we add one later).
4. **Access: all enrolled users, AI features premium-only** (confirmed by owner) — the
   planner itself is available to any active `courseEnrollments` row, both courses, any
   tier. All AI-powered parts (e.g., „Wygeneruj plan z AI" via `planujTool`, AI lecture
   generation from a plan) are gated behind premium using the existing
   `checkPremiumAccessAction` / `hasAccessToTier` pattern, shown as locked upsell states
   for non-premium users rather than hidden.

## What already exists and gets reused

| Need | Existing asset |
|---|---|
| Concept taxonomy | `CATEGORY_METADATA` (`src/constants/categoryMetadata.ts`) — per-category `course`, `learningOutcomes`, `programContent` topic strings |
| Course/entitlement | `courseEnrollments` table, `getUserEnrolledCourses` (`src/server/queries.ts`), gating pattern from `/panel/procedury/[course]/page.tsx` |
| Test activity | `completed_tests` + `test_sessions` (category, durationMinutes, completedAt), analytics queries `getCategoryPerformance`, `getProgressTimeline`, `getQuestionAccuracyAnalytics` |
| Analytics UI | `UserAnalytics` / `UserAnalyticsClient` (`src/components/`) with `AnalyticsOverview`, `AnalyticsDetailed`, `ProgressLineChart` — extended, not replaced (see "Symbiosis with UserAnalytics") |
| Procedure activity | `challenge_completions` (timeSpent, passed, completedAt), `procedure_badges` |
| Notes activity | `notes` table (`category`, `tags`, timestamps) |
| Forum bridge | `createForumPostAction` (`src/actions/actions.ts`) / forum post form |
| Exam dates as due-date presets | `EXAM_PERIODS` (`src/constants/examDates.ts`) |
| AI plan generation (phase 3) | `planujTool` in `src/server/tools/executor.ts`, `LearningPlan`/`LearningStep` types (`src/types/cellTypes.ts`) |
| Server-action conventions | `FormState` + `toFormState`/`fromErrorToFormState` (`src/helpers/toFormState.ts`), Zod schemas in `src/server/schema.ts` (Polish messages), `checkRateLimit` (`src/lib/rateLimit.ts`) |
| Nav | `src/constants/sideMenuLinks.tsx` (single place to add the entry) |

## Data model (new tables in `src/server/db/schema.ts`)

Follow existing conventions: `createTable` (prefix `wolfmed_`), `uuid` PK
`.defaultRandom()`, `userId varchar(256)` referencing `users.userId` with cascade
delete, array-form indexes.

### `learning_plans`
- `id`, `userId`, `courseSlug varchar(100)`
- `name varchar(255)` — e.g. "Przygotowanie do egzaminu — zima 2027"
- `goalType varchar(30)` — `'exam' | 'custom'` (exam goals offer `EXAM_PERIODS` presets)
- `dueDate timestamp` (notNull)
- `minutesPerDay integer` (notNull) — store minutes, render as h/min
- `studyDays jsonb $type<number[]>` — ISO weekdays the user plans to study (1–7)
- `status varchar(20)` — `'active' | 'completed' | 'archived'`, default `'active'`
- `createdAt`, `updatedAt`
- Indexes: `(userId)`, `(userId, status)`
- Business rule (enforced in the action, not the DB): **one active plan per user**.
  Keeps the whole UX single-focus; archived plans remain viewable.

### `learning_plan_concepts`
- `id`, `planId uuid` (references `learning_plans.id`, cascade delete), `userId`
- `categoryKey varchar(100)` — key from `CATEGORY_METADATA` (nullable for custom concepts)
- `label varchar(255)` — display name (category name or free-text custom concept)
- `source varchar(20)` — `'category' | 'custom' | 'ai'`
- `targetMinutes integer` — planned effort for this concept (defaulted, user-editable)
- `sortOrder integer`
- `completedAt timestamp` (nullable) — manual check-off
- Index: `(planId)`
- Separate table (not jsonb on the plan) so check-offs are row updates and per-concept
  auto-progress can join against `test_sessions.category` / notes.

### `study_logs`
Manual "I studied outside the app" entries + the durable record for streaks.
- `id`, `userId`, `planId` (nullable, cascade delete), `conceptId` (nullable)
- `studyDate timestamp` (the day it counts toward), `minutes integer`, `note varchar(500)`
- `source varchar(20)` — `'manual'` in v1 (auto activity is derived at read time, not
  duplicated into this table)
- Index: `(userId, studyDate)`

### `notifications`
Generic — designed so forum replies/badges can use it later.
- `id`, `userId`, `type varchar(30)` — `'plan_reminder' | 'plan_milestone' | 'streak' | 'motivation' | 'system'`
- `title varchar(255)`, `message text`, `link varchar(255)` (in-app href)
- `dedupeKey varchar(255)` — e.g. `plan_reminder:2026-07-11`; **unique index
  `(userId, dedupeKey)`** makes lazy generation idempotent (insert with
  `onConflictDoNothing`)
- `isRead boolean default false`, `createdAt`
- Indexes: `(userId, isRead)`, unique `(userId, dedupeKey)`

Migration via `pnpm run db:push` (repo convention, no migration files).

## Progress & pace engine (`src/server/planner/`)

New module `src/server/planner/engine.ts` (pure functions, unit-testable) +
queries in `src/server/queries.ts`:

**Auto-detected activity** (read-time union, no write hooks — zero risk to existing flows):
- Completed tests: join `completed_tests` × `test_sessions` since plan `createdAt`;
  minutes = `durationMinutes` (fallback 15); category = `test_sessions.category`,
  matched to concepts by `categoryKey`.
- Challenges: `challenge_completions.timeSpent` (seconds → minutes) since plan start.
- Notes: notes created/updated per day count a flat 10 min (transparent heuristic,
  shown in UI as "szacowane").
- Manual: `study_logs` rows.

**Derived values** (computed in `getPlanProgress(userId)`, `cache()`-wrapped):
- `plannedMinutesTotal` = Σ concept `targetMinutes`
- `expectedMinutesToDate` = minutesPerDay × number of study-days elapsed since plan start
- `actualMinutesToDate` = auto + manual
- `paceStatus` = `'ahead' | 'on_track' | 'behind'` (behind = actual < 70% of expected AND ≥2 planned study days missed)
- `streak` = consecutive planned study-days with ≥1 activity (any source); grouped-by-day
  query over the four activity sources, last 60 days
- Per-concept: `completedAt` (manual) + auto minutes attributed via `categoryKey`

**Daily suggestion** ("Dziś w planie"): deterministic pick — first uncompleted concept,
weighted toward the user's weakest category using the existing
`getCategoryPerformance` / `getQuestionAccuracyAnalytics` data, with a deep link to the
matching feature (see Tips below).

## Progress system — symbiosis with UserAnalytics

`UserAnalytics` (`src/components/UserAnalytics.tsx` → `UserAnalyticsClient` with
Przegląd/Szczegóły tabs on `/panel`) is today a purely descriptive, test-only report.
The planner and analytics stay **separate components with a shared data layer and
cross-links** — merging them into one component would couple two different lifecycles
(analytics works with no plan; a plan needs analytics as its feedback loop).

### Shared data layer: `getUserProgressSnapshot(userId)`

New `cache()`-wrapped server function in `src/server/planner/` returning one object
consumed by **three** surfaces — `UserAnalytics`, the `/panel/plan` page, and the
notification generator:

- `stats` — the `users` rollups (totalScore, totalQuestions, testsAttempted)
- `timeline` — existing `getProgressTimeline` **extended with a `studyMinutes` series**
  per day aggregated from all activity sources (tests, challenges, notes, `study_logs`)
- `categories` — `getCategoryPerformance`, each row annotated with `inPlan: boolean`
  and auto-attributed plan minutes when an active plan exists
- `problemQuestions` — `getQuestionAccuracyAnalytics` output
- `plan?` — active plan + concepts + pace/streak from the engine (null when no plan)

Because everything is `cache()`-wrapped, `/panel` rendering both `UserAnalytics` and
`PlanCountdown` costs no duplicate queries. `UserAnalytics.tsx` switches its four
parallel fetches to this single snapshot call (no visual regression in existing tabs).

### UserAnalytics enhancements (plan-aware)

- **New third tab „Plan"** in `UserAnalyticsClient` — rendered only when an active plan
  exists: pace badge, streak, planned-vs-actual minutes chart, per-concept progress
  bars, link to `/panel/plan`.
- **Effort vs results**: `ProgressLineChart` gains the daily `studyMinutes` series next
  to avg score — makes invisible work visible even on days without tests.
- **Actionable categories**: in `AnalyticsDetailed`, categories in the plan get a
  „w planie" badge; weak categories (avg < 60%) not in the plan get a „Dodaj do planu"
  button (calls `addConceptAction`) when a plan is active.
- **Problem questions feed the plan**: the daily suggestion engine prioritizes concepts
  whose category contains problem questions; the problem-question list links to the
  matching test category.

## Notifications (lazy generation)

`generatePlanNotifications(userId)` — called from the panel layout/page (server-side,
fire-and-forget), inserts with `onConflictDoNothing` on `dedupeKey`:
- `plan_reminder:<date>` — on planned study days, "Dziś w planie: <concept> (<X> min)"
- `plan_behind:<isoWeek>` — max once/week when `paceStatus === 'behind'`, supportive tone
- `plan_milestone:<25|50|75|100>` — progress milestones
- `streak:<7|14|30>` — streak milestones
- `motivation:<isoWeek>` — one rotating study-technique tip per week

Analytics-driven types (same generator, fed by `getUserProgressSnapshot`, work even
without an active plan):
- `insight_improve:<category>:<isoWeek>` — category accuracy crossed a threshold upward
  ("Twoja skuteczność w anatomii wzrosła do 82% 🎉")
- `insight_weak:<category>:<isoWeek>` — persistent weak category, with a CTA to add it
  to the plan / take a targeted test
- `problem_questions:<isoWeek>` — "Masz <N> pytań z niską skutecznością — powtórz je",
  linking to the problem-questions view

UI: `NotificationBell` client component in the global `Navbar`
(`src/app/_components/Navbar.tsx`, signed-in state) — badge with unread count,
dropdown list, "oznacz wszystkie jako przeczytane". Dropdown positioning must respect
the modal rule from CLAUDE.md (render at layout level / portal, not nested).

Actions: `markNotificationReadAction`, `markAllNotificationsReadAction`
(rate-limit key `notifications:update`). Queries: `getNotifications(userId, limit)`,
`getUnreadNotificationCount(userId)`.

## UI

### New route: `/panel/plan` — „Plan Nauki"
Nav entry in `src/constants/sideMenuLinks.tsx` (new icon in `src/components/icons/`,
e.g. `PlannerIcon`), between „Centrum Nauki" and „Procedury".

**Empty state (no active plan)** → 3-step wizard (client component, single page,
step state local):
1. **Cel** — course (pre-selected from enrollment; picker only if user has both),
   goal type; for `exam`: due-date presets from `EXAM_PERIODS` (+ custom date);
   for `custom`: free date + name.
2. **Czas** — minutes/day slider (15 min – 4 h) + weekday picker; live summary:
   "Do <data> zaplanujesz ok. <X> h nauki".
3. **Zakres** — concept picker: categories from `CATEGORY_METADATA` filtered to the
   chosen course (with test counts via existing `countTestsByCategory`), expandable to
   `programContent` topics, plus free-text custom concepts. Default `targetMinutes`
   proposed from total capacity ÷ concept count, editable.
   Honest capacity check: if Σ targets > capacity to due date, show a warning and offer
   to trim scope or extend the date — **this is the anti-timetable safeguard**.

**Goal-aware Zakres (added after first review):** step 1 additionally captures *which
subject* the plan is about („Czego dotyczy plan?" chips → `learning_plans.focusCategoryKey`,
nullable = whole course). With a focus subject chosen, step 3 opens that subject's **full
curriculum** expanded at the top, grouped exactly like `/panel/kursy/[categoryId]`
(Podstawy teoretyczne / Praktyczne zastosowanie / Wiedza rozszerzona, incl. `selfStudy`,
no topic cap) with per-group „Dodaj wszystkie" bulk add; remaining subjects collapse under
„Inne przedmioty". A „Rozłóż czas równomiernie" action distributes capacity across selected
concepts. The kursy category page gets a „Zaplanuj naukę tego przedmiotu" banner deep-linking
to `/panel/plan?zakres=<categoryKey>` (all tiers — unlike the premium per-topic AI buttons),
and the plan dashboard shows the focus subject as a badge linking back to the curriculum page.
Concept cap raised 30 → 60 to fit full subject programs.

**Active plan dashboard** (server page + client islands):
- Header: plan name, countdown to `dueDate`, pace badge (`ahead/on_track/behind`),
  overall progress bar, streak flame.
- „Dziś w planie" card: today's suggested concept + minutes + deep-link CTA.
- Concept list: per-concept progress (auto minutes + manual check-off toggle),
  reorder later (not v1).
- „Zapisz naukę" quick-log form (minutes + optional note) → `logStudySessionAction`.
- Tips panel („Jak się uczyć w Wolfmed"): static map `categoryKey → feature links` in
  `src/constants/plannerTips.ts` — e.g. anatomia → „Rozwiąż test z anatomii (142 pytania)"
  `/panel/testy/anatomia`, procedures → `/panel/procedury/<course>`, fiszki/notatki/AI
  in Centrum Nauki. Plus rotating evidence-based study tips (spaced repetition, active
  recall, Pomodoro) as Polish micro-copy in `src/constants/motivationTips.ts`.
- Forum CTA: „Znajdź partnera do nauki" — navigates to `/forum` with a prefilled draft
  (title/content template mentioning goal + due date) via query params consumed by the
  existing post form; reuses `createForumPostAction` untouched.
- Plan settings: edit time/date/concepts, archive plan (uses `useConfirmModalStore`).

### `/panel` dashboard changes
Replace the `ExamCountdown` slot in `DynamicBoard` with a course-aware `PlanCountdown`:
- Active plan → countdown to the **user's own due date** + today's goal + pace badge.
- No plan + `opiekun-medyczny` → current `ExamCountdown` behavior + „Utwórz plan nauki" CTA.
- No plan + `pielegniarstwo` only → CTA card instead of the dead state-exam countdown.

## Server actions (`src/actions/planner.ts`)

All follow the repo pattern: `'use server'`, Clerk `auth()` → `checkRateLimit` → Zod
`safeParse` (schemas added to `src/server/schema.ts`, Polish messages) → query →
`revalidatePath('/panel/plan')` → `toFormState`, errors via `fromErrorToFormState`.

- `createPlanAction` — validates one-active-plan rule, inserts plan + concepts in a transaction
- `updatePlanAction`, `archivePlanAction`, `completePlanAction`
- `toggleConceptAction` (check-off), `addConceptAction`, `removeConceptAction`
- `logStudySessionAction`
- `markNotificationReadAction`, `markAllNotificationsReadAction`

New `RATE_LIMITS` keys in `src/lib/rateLimit.ts`: `planner:create` (3/h),
`planner:update` (30/h), `planner:log` (20/h), `notifications:update` (60/h).

## Implementation phases

**Phase 1 — Core planner (the feature must stand on this alone)**
1. Schema: `learning_plans`, `learning_plan_concepts`, `study_logs` (+ `db:push`)
2. Zod schemas, rate-limit keys, queries (`getActivePlan`, `getPlanWithConcepts`,
   `getPlanProgress`, `getStudyStreak`), `src/server/planner/engine.ts` +
   `getUserProgressSnapshot` (shared data layer, built here so later phases consume it)
3. Actions in `src/actions/planner.ts`
4. `/panel/plan` page: wizard + plan dashboard + quick-log + concept check-offs
5. Nav entry + icon; `PlanCountdown` on `/panel` (fixes the pielegniarstwo dead countdown)

**Phase 2 — Progress integration (UserAnalytics symbiosis)**
6. Refactor `UserAnalytics.tsx` to consume `getUserProgressSnapshot` (no visual change)
7. „Plan" tab in `UserAnalyticsClient`; `studyMinutes` series in `ProgressLineChart`
8. „w planie" badges + „Dodaj do planu" on weak categories in `AnalyticsDetailed`;
   problem questions wired into the daily-suggestion weighting

**Phase 3 — Notifications**
9. `notifications` table, lazy `generatePlanNotifications` (plan + analytics-driven
   types), `NotificationBell` in Navbar, read actions

**Phase 4 — Guidance & community**
10. `plannerTips.ts` feature-mapping panel + `motivationTips.ts` rotation
11. Forum „study buddy" prefilled-post CTA
12. (Optional) „Wygeneruj plan z AI" — feed `planujTool` output into the concept picker;
    **premium-only** (`checkPremiumAccessAction`), rendered as a locked upsell card for
    basic-tier users

## Verification

- `pnpm run lint` and `pnpm run build` clean
- `pnpm run db:push` against a dev database; inspect via `pnpm run db:studio`
- Manual E2E per phase: create plan (both goal types, both courses) → complete a test in
  a planned category → auto minutes appear → check off a concept → log manual session →
  streak/pace update → due-date countdown on `/panel` → notifications appear once (revisit
  panel: no duplicates, dedupe holds) → mark read → archive plan → empty state returns
- Analytics integration: `/panel` UserAnalytics renders identically pre/post snapshot
  refactor with no plan; with an active plan the „Plan" tab appears, timeline shows
  `studyMinutes`, weak-category „Dodaj do planu" adds a concept visible on `/panel/plan`
- Edge cases: user with both courses, due date in the past (block in Zod), capacity
  warning path, second plan creation blocked while one is active

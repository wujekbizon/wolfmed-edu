# Plan Nauki — End-to-End Testing Guide

Step-by-step manual test script for the learning planner: creating a plan, auto
progress from tests, manual logs, and how the database and UI should behave.

## 0. Prerequisites (once)

```bash
pnpm run db:push      # ensure learning_plans + focusCategoryKey exist
pnpm run dev
```

Sign in as a user with an **active course enrollment** (opiekun-medyczny or
pielęgniarstwo). Keep **Drizzle Studio** open in a second tab: `pnpm run db:studio`.

**Golden rule of the backend:** planner progress is **derived at read-time, never
stored**. Taking a test does **not** write anything to the planner tables — it writes
to `completed_tests` / `test_sessions`, and `getPlanProgress`
(`src/server/planner/progress.ts`) recomputes minutes live every time `/panel/plan`
loads. So "does the DB update?" splits into two answers: test/log tables get new rows;
planner tables only change when you create a plan, check off a concept, log a session,
or add/remove a concept.

---

## Test A — Create a plan

**UI steps:** `/panel/plan` → wizard → **Cel**: pick course + "Egzamin"/"Własny cel" +
a focus subject (e.g. **Patologia**) → **Czas**: 90 min, every second day → **Zakres**:
add a few curriculum topics → **Utwórz plan nauki**.

**DB expectation** — one transaction writes two tables:

```sql
SELECT id, "focusCategoryKey", "minutesPerDay", "studyDays", status, "createdAt"
FROM wolfmed_learning_plans WHERE "userId" = '<clerkUserId>';
-- exactly 1 row, status = 'active'

SELECT label, "categoryKey", "targetMinutes", "sortOrder", "completedAt"
FROM wolfmed_learning_plan_concepts WHERE "planId" = '<planId>' ORDER BY "sortOrder";
-- one row per concept; completedAt = NULL; all topics of Patologia share categoryKey = 'patologia'
```

**UI expectation:** dashboard shows the plan, stat tiles (days left / 0% / streak 0),
"Dziś w planie", concept list with empty bars, `/panel` countdown now ticks to **your**
due date.

**Backend checks:** try creating a **second** plan → blocked ("Masz już aktywny
plan…"). Set a due date in the past in the wizard → Zod rejects it.

---

## Test B — Take a test → progress auto-increments

**This is the one with rules.** A completed test becomes `durationMinutes` worth of
activity (the session's *configured* length, fallback 15 if null — **not** actual
elapsed time), tagged with the test's category.

**UI steps:** `/panel/testy/patologia` → run and finish a Patologia test → go back to
`/panel/plan`.

**DB expectation (test tables only):**

```sql
SELECT ct.score, ct."completedAt", ts.category, ts."durationMinutes", ts.status
FROM wolfmed_completed_tests ct
JOIN wolfmed_test_sessions ts ON ct."sessionId" = ts.id
WHERE ct."userId" = '<clerkUserId>' ORDER BY ct."completedAt" DESC LIMIT 1;
-- new completed_tests row; session status = 'COMPLETED'; category = 'patologia'
-- ZERO new rows in any wolfmed_learning_plan_* table — this is correct
```

**UI expectation on `/panel/plan`:**

- **Overall progress bar goes up** — it sums *all* plan activity, so even an
  unrelated-category test moves it.
- **The concept bar moves only when the test category matches a concept's
  `categoryKey`.** Patologia test → Patologia concept bar fills; an Anatomia test would
  move the overall bar but no Patologia concept.
- Concept caption shows "w tym X min wykryte automatycznie".

**Two nuances so you don't think it's a bug:**

1. **Concentration:** because every Patologia topic shares `categoryKey='patologia'`,
   the auto-minutes all land on the **first** Patologia concept (lowest `sortOrder`),
   not spread across all of them. Per-concept auto-attribution is one-concept-per-category
   by design (`attributeMinutes` in `src/server/planner/engine.ts`); the overall bar is
   still fully correct.
2. **Only counts after plan creation:** activity is filtered to
   `date >= plan.createdAt`. Tests taken *before* creating the plan don't retroactively
   count.

---

## Test C — Manual "Zapisz naukę"

**UI:** on `/panel/plan`, "Zapisz naukę" → 30 min, pick a concept → Zapisz.

```sql
SELECT minutes, "conceptId", "studyDate", source FROM wolfmed_study_logs
WHERE "userId" = '<clerkUserId>' ORDER BY "createdAt" DESC LIMIT 1;  -- source = 'manual'
```

**UI:** if you picked a concept, its bar gains **manual** minutes (attributed by
`conceptId`). If you left "Bez zagadnienia", it still raises the **overall** bar and
counts toward streak, but no specific concept.

---

## Test D — Check off a concept

Click the checkbox → `completedAt` on that `learning_plan_concepts` row goes from NULL
to a timestamp; row turns green + strikethrough; header count `1/N` increments. Uncheck
→ back to NULL.

Reminder: removing a concept via ✕ is a real hard delete of that row; the plan itself is
only ever soft-archived (`status = 'archived' | 'completed'`).

---

## Test E — Pace, streak, countdown, analytics

- **Streak:** activity on a **planned** study day counts; flame = consecutive planned
  days with ≥1 activity.
- **Pace badge:** `behind` when actual < 70% of expected *and* ≥2 planned days missed;
  else `on_track` / `ahead`.
- **Countdown** on `/panel` ticks live to `dueDate`.
- **Analytics** (`/panel` → UserAnalytics): "Plan" tab appears, the progress chart gains
  a dashed study-minutes line, and weak categories (<60%) show "Dodaj do planu" → click
  writes a new `learning_plan_concepts` row.

---

## Backend correctness checklist

| Concern | Expected |
|---|---|
| Progress persisted? | **No** — derived live in `getPlanProgress`. Only create / check-off / log / add / remove mutate planner tables. |
| Cascade delete | Delete a plan row → its concepts + study logs cascade (FKs). |
| Cache freshness | `getPlanProgress` is `cache()`-wrapped **per request**; a fresh `/panel/plan` load recomputes. If a value looks stale, hard-refresh. |
| One active plan | Enforced in `createPlanAction`, not the DB — archive/complete frees the slot. |
| Minutes source | Session `durationMinutes` (configured), not stopwatch time. |

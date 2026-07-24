# Diagnozy i Interwencje — refined implementation plan (codebase-verified)

Nursing care-plan trainer for the *Pielęgniarstwo* course, driven by diagnoses from
*Diagnozy i interwencje w praktyce pielęgniarskiej* (Kózka, Płaszewska-Żywko, PZWL).
This document supersedes the external `FEATURE_PLAN.md` — every decision below was
checked against the actual repository patterns.

## What changed vs. the original plan (and why)

| Original plan | This plan | Reason |
|---|---|---|
| Static bundled JSON (path A) for MVP, DB later | **Neon DB from day one** (`wolfmed_diagnozy` table, jsonb `data`) | Owner requirement: DB is the only source of truth. Exact precedent exists: `wolfmed_procedures` + `scripts/seed-procedures.ts`. |
| Zod schema in `src/server/diagnozy/diagnoza.schema.ts` | Zod schemas in **`src/server/schema.ts`** | CLAUDE.md convention: all Server-Action schemas live there (`GradePracticalExamSchema` is the sibling). |
| Types in `src/types/diagnoza.ts` | **`src/types/diagnozyTypes.ts`** via `z.infer` | Matches naming (`pielegniastwoTypes.ts`, `praktycznyTypes.ts`). |
| New loader module `src/server/diagnozy/data.ts` | Queries added to **`src/server/queries.ts`** with `cache()` | Convention: all reads live in `queries.ts` (`getAllProcedures`, `getProcedureById`). |
| Generic gating helper to invent | Reuse **`checkCourseAccessAction('pielegniarstwo')` + `hasAccessToTier()`** | Already authoritative (DB `courseEnrollments`), used identically by `/panel/procedury/[course]`. |
| Generic emerald/rose/slate palette, `ring-border`, dark mode | Follow **`globals.css` `@theme` tokens** and existing panel visual language (`PielegniastwoGridCard`, `PracticalExamCard`) | App has its own tokens; there is no app-wide dark mode to design for. |
| Custom form-state machinery for submit | Mirror **`gradePracticalExamAction`** (`src/actions/praktyczny.ts`) | Same problem already solved: client sends answers, server validates with Zod, grades, persists, returns result. Not a field-form, so the `MottoForm` pattern doesn't apply. |
| References/piśmiennictwo | Out of scope (unchanged) | |

## 1. Data & storage (source of truth: Neon)

### `data/diagnozy.json`
Container file checked into the repo (same as `data/procedures.json`):
`{ schemaVersion, book, diagnozy: [...] }` — currently 2 authored diagnoses (7.1, 7.3).
It is only the **seed input**; the app never imports it.

### DB tables (Drizzle, `src/server/db/schema.ts`)

```ts
export const diagnozy = createTable(
  'diagnozy',
  {
    id: uuid('id').primaryKey(),                       // preserved from JSON
    course: varchar('course', { length: 100 }).notNull().default('pielegniarstwo'),
    slug: varchar('slug', { length: 256 }).notNull(),
    section: varchar('section', { length: 16 }).notNull(),      // '7.1'
    chapterNumber: varchar('chapterNumber', { length: 8 }).notNull(),
    chapterTitle: varchar('chapterTitle', { length: 256 }).notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    status: varchar('status', { length: 16 }).notNull().default('published'),
    data: jsonb('data').$type<Diagnoza>().notNull(),   // full validated record
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt'),
  },
  (t) => [index('diagnozy_course_idx').on(t.course),
          index('diagnozy_slug_idx').on(t.slug)]
)

export const diagnozyProgress = createTable(
  'diagnozy_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('userId', { length: 256 }).notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    diagnozaSlug: varchar('diagnozaSlug', { length: 256 }).notNull(),
    score: integer('score').notNull(),                 // 0–100
    stepScores: jsonb('stepScores').notNull(),         // per-step breakdown
    passed: boolean('passed').notNull().default(false),
    completedAt: timestamp('completedAt').defaultNow().notNull(),
  },
  (t) => [index('diagnozy_progress_user_idx').on(t.userId),
          index('diagnozy_progress_user_slug_idx').on(t.userId, t.diagnozaSlug)]
)
```

Mirrors `challengeCompletions` exactly (multiple attempts kept; latest/best shown).
`pnpm run db:push` to apply.

### Seed script `scripts/seed-diagnozy.ts`
Clone of `seed-procedures.ts`: reads `data/diagnozy.json`, validates **every record with
the Zod `DiagnozaSchema` before any write** (abort on first error — this is where
hand-authored JSON is checked), truncates `wolfmed_diagnozy`, inserts with preserved ids.
Run: `npx tsx scripts/seed-diagnozy.ts`.

### Zod schemas (`src/server/schema.ts`)
- `StringListOrGroupedSchema` — `z.union([z.array(z.string()), z.object({ type: z.literal('grouped'), groups: [...] })])`
- `DiagnozaSchema` — full record incl. `czynnikiEtiologiczne` (4 keys), `kryteriaRozpoznawania`,
  `interwencje[].{interwencja, uzasadnienie}`, optional `practice.steps` (discriminated by
  `type: 'single-choice' | 'multi-choice'`, with `correct: string | string[]` + `distractors`).
- `SubmitDiagnozyPracticeSchema` — `{ slug, answers: Record<field, string[]>, timeSpent }`
  (client sends **selected option texts only**; correctness is never on the client).

Types exported from `src/types/diagnozyTypes.ts` via `z.infer` (schema stays the single
source of truth; `jsonb('data').$type<Diagnoza>()` consumes it).

## 2. Access gating

Entitlement = **active `pielegniarstwo` enrollment** + required tier (see open question Q2):

```ts
// src/helpers/hasDiagnozyAccess.ts  (helpers convention: one file per function)
export async function hasDiagnozyAccess(): Promise<boolean> {
  const { hasAccess, accessTier } = await checkCourseAccessAction('pielegniarstwo')
  return hasAccess && hasAccessToTier(accessTier ?? 'free', DIAGNOZY_REQUIRED_TIER)
}
```

Used in **both** pages (redirect / `NoAccessMessage`) and **every** server action —
UI gating is cosmetic, actions are the real guard.

### Sidebar link
Add to `sideMenuNavigationLinks`: `{ url: '/panel/diagnozy', label: 'Diagnozy i Interwencje', icon: <...> }`
with a new optional flag `requiresCourse: 'pielegniarstwo'`. `SidePanel`/`NavDrawer`
currently only understand `requiresSupporter`; extend the same lock mechanism
(`CustomButton isPremium` prop → lock style) driven by the user's enrollments, which the
panel layout already has access to. Non-entitled users see the link locked (same UX as
"Dodaj Test" for non-supporters) — or hidden, see Q3.

## 3. Routes (App Router, server components)

```
src/app/panel/diagnozy/page.tsx          # list — guard, fetch, group by chapter
src/app/panel/diagnozy/[slug]/page.tsx   # detail — guard, tabs shell Nauka | Ćwicz
```

Both `force-dynamic` like `/panel/procedury`. Detail page fetches the full record
server-side and renders `DiagnozaStudyView` (server) + `PracticeRunner` (client island).
The practice payload passed to the client contains **shuffled options without correctness
flags** (correct + distractors merged and shuffled server-side).

## 4. Server layer

Queries (`src/server/queries.ts`, `cache()`-wrapped):
- `getAllDiagnozy()` — list metadata (no `data` payload) for published records, ordered by `section`.
- `getDiagnozaBySlug(slug)` — full record.
- `getUserDiagnozyProgress(userId)` — best score per slug (for list chips).

Actions (`src/actions/diagnozy.ts`, all behind `hasDiagnozyAccess()` + `checkRateLimit`):
- `submitDiagnozyPracticeAction(payload)` — Zod-parse with `SubmitDiagnozyPracticeSchema`,
  load diagnosis from DB, grade server-side, insert `diagnozyProgress`, return
  `{ score, stepResults }` where each step = `{ correct[], missed[], extra[] }`.

Grading helper `src/helpers/gradeDiagnozyPractice.ts` — pure function
`(answers, diagnoza) → { score, stepResults }`, set-comparison per step, reusable by the
future exam mode. (Repo has no test runner today, so no unit-test scaffolding is added —
the function stays pure so tests can come later.)

### Practice steps & distractors (MVP)
Only steps authored in `practice.steps` are rendered. 7.1 currently has 2 steps
(diagnoza, cele); 7.3 has 1. Strategy for the remaining steps (interwencje, ocena) is
open question Q4 — either author them in JSON, or auto-pool distractors from sibling
diagnoses' `interwencje`/`oczekiwaneWyniki` at render time.

## 5. Components (all ≤ ~100 lines, one per file)

```
src/components/diagnozy/
  DiagnozaCard.tsx            # imageless list card: section pill, title, clamped definicja, difficulty/status chips
  DiagnozyChapterGroup.tsx    # chapter header + grid (grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4)
  DiagnozaTabs.tsx            # client: Nauka | Ćwicz segmented switch (ARIA tabs)
  StudySection.tsx            # collapsible section block
  StringListOrGrouped.tsx     # renders flat list OR grouped (label + items) — used 3×
  DiagnozaStudyView.tsx       # composition of sections in book order
  InterwencjeTable.tsx        # 2-col Interwencja | Uzasadnienie, stacked cards < md
  practice/
    PracticeRunner.tsx        # client island: stepper state, calls submit action
    PracticeCasePanel.tsx     # opisPrzypadku panel (sticky / collapsible)
    PracticeStepper.tsx       # progress + Wstecz/Dalej/Sprawdź nav
    SingleChoiceStep.tsx      # radio semantics, card options
    MultiChoiceStep.tsx       # checkbox semantics, "wybrano X"
    PracticeResult.tsx        # score + per-step correct/missed/extra + uzasadnienie reveal
```

Client practice state: local `useState`/`useReducer` inside `PracticeRunner`
(ephemeral, like `PracticalExamRunner`) — a Zustand store is unnecessary for a single island.

Styling: existing panel look — token-based colors from `@theme`, `rounded` per `--radius`,
reuse chip/card styling from `PielegniastwoGridCard` / `PracticalExamCard`; feedback
colors pair with icons (✓/✗) for a11y; Framer Motion for tab/step transitions with
`prefers-reduced-motion` respected.

## 6. Delivery order

1. Zod schemas + types; `data/diagnozy.json` checked in.
2. Drizzle tables + `db:push`; `scripts/seed-diagnozy.ts` + run seed.
3. Queries + `hasDiagnozyAccess` helper.
4. List page + cards + sidebar link (with lock gating).
5. Study view (all renderers).
6. Practice runner + steps + submit action + grading + progress write.
7. Progress chips on list; motion & a11y pass; `pnpm run lint` + `pnpm run build`.

## 7. Out of scope (unchanged)
Exam simulation, spaced repetition, admin authoring UI, references section, Stripe add-on
product (entitlement stays tier-based until decided).

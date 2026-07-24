# Diagnozy i Interwencje — implementation plan (codebase-verified, fill-out model)

Nursing care-plan **memorization/familiarization tool** for the *Pielęgniarstwo* course,
driven by diagnoses from *Diagnozy i interwencje w praktyce pielęgniarskiej*
(Kózka, Płaszewska-Żywko, PZWL). The user studies a worked diagnosis, then actively
**fills out the Przewodnik care-process form by selecting from lists of real,
book-sourced answers**. There is no scoring, no distractors, no right/wrong — the value
is active recall (picking, not typing) so the flow of the form is internalized before a
real exam. A future "Egzamin" mode (actual testing, wrong answers, possibly a 3D dummy
patient) is explicitly **deferred and undesigned**.

## Locked decisions

1. **Branch**: all work on `claude/practical-exam-branch-u1yhaq`.
2. **Entitlement**: active `pielegniarstwo` enrollment, **`basic` tier is enough**.
   (Future AI features inside this module would require `premium` — not in this scope.)
3. **Sidebar**: link **conditionally rendered** — visible only for users with an active
   `pielegniarstwo` enrollment; everyone else never sees it. Direct URL hits still show
   the no-access screen (actions are the real guard).
4. **Mode**: fill-out ("Wypełnij"), not quiz. No distractors needed — the correct items
   already in `data/diagnozy.json` (e.g. 7.1's 14 interventions) are the entire lists.

## The Przewodnik mapping (verified against `Przewodnik.docx`)

The form's care-plan core is a 5-row table; fill-out steps mirror it 1:1:

| Przewodnik row | Data source | Step control |
|---|---|---|
| Diagnoza pielęgniarska | `diagnozaPielegniarska` | single-select (one card) |
| Cel | `celeOpieki[]` | multi-select all goals |
| Planowane interwencje | `interwencje[].interwencja` | multi-select; picking reveals `uzasadnienie` (the teaching moment) |
| Zrealizowane interwencje | same list, rendered as confirmation of what was planned | read-only recap row |
| Ocena | `oczekiwaneWyniki` | single-select |

Completing all steps renders the **filled Przewodnik table** as a summary and marks the
diagnosis completed.

## 1. Data & storage (source of truth: Neon)

### `data/diagnozy.json`
Container `{ schemaVersion, book, diagnozy: [...] }` checked into the repo (like
`data/procedures.json`) — currently 2 diagnoses (7.1, 7.3). Seed input only; the app
never imports it. The `practice` field present in the JSON is **ignored by this feature**
(kept optional in the schema, reserved for the future Egzamin mode).

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

// completion flag only — no score, no step breakdown
export const diagnozyProgress = createTable(
  'diagnozy_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('userId', { length: 256 }).notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    diagnozaSlug: varchar('diagnozaSlug', { length: 256 }).notNull(),
    completedAt: timestamp('completedAt').defaultNow().notNull(),
  },
  (t) => [index('diagnozy_progress_user_idx').on(t.userId),
          uniqueIndex('diagnozy_progress_user_slug_uq').on(t.userId, t.diagnozaSlug)]
)
```

Unique `(userId, diagnozaSlug)` + upsert = idempotent completion.
`pnpm run db:push` to apply.

### Seed script `scripts/seed-diagnozy.ts`
Clone of `seed-procedures.ts`: reads `data/diagnozy.json`, validates **every record with
the Zod `DiagnozaSchema` before any write** (abort on first error — this is where
hand-authored JSON is checked), truncates `wolfmed_diagnozy`, inserts with preserved ids.
Run: `npx tsx scripts/seed-diagnozy.ts`.

### Zod schemas (`src/server/schema.ts` — CLAUDE.md convention)
- `StringListOrGroupedSchema` — `z.union([z.array(z.string()), z.object({ type: z.literal('grouped'), groups: [...] })])`
- `DiagnozaSchema` — full record: `czynnikiEtiologiczne` (4 required keys),
  `kryteriaRozpoznawania.{subiektywne,obiektywne}`, `interwencje[].{interwencja,uzasadnienie}`,
  `celeOpieki` (min 1), optional `practice` passthrough (unused, future Egzamin).
- `MarkDiagnozaCompletedSchema` — `{ slug: z.string().min(1) }`.

Types exported from `src/types/diagnozyTypes.ts` via `z.infer`
(`jsonb('data').$type<Diagnoza>()` consumes them).

## 2. Access gating

```ts
// src/helpers/hasDiagnozyAccess.ts  (helpers convention: one file per function)
export async function hasDiagnozyAccess(): Promise<boolean> {
  const { hasAccess, accessTier } = await checkCourseAccessAction('pielegniarstwo')
  return hasAccess && hasAccessToTier(accessTier ?? 'free', 'basic')
}
```

Used in **both** pages (no-access screen / redirect) and the completion action.

### Sidebar link
Add to `sideMenuNavigationLinks`: `{ url: '/panel/diagnozy', label: 'Diagnozy i Interwencje', icon: <...>, requiresCourse: 'pielegniarstwo' }`.
`SidePanel`/`NavDrawer` **filter out** links whose `requiresCourse` the user is not
enrolled in (unlike `requiresSupporter`, which locks visibly). The panel layout already
resolves enrollments; pass them down like `isPremium` is passed today.

## 3. Routes (App Router, server components)

```
src/app/panel/diagnozy/page.tsx          # list — guard, fetch, group by chapter
src/app/panel/diagnozy/[slug]/page.tsx   # detail — guard, tabs: Nauka | Wypełnij
```

Both `force-dynamic` like `/panel/procedury`. Detail page fetches the full record
server-side; `DiagnozaStudyView` renders as server component, the fill-out flow is the
one client island. No result/score route exists.

## 4. Server layer

Queries (`src/server/queries.ts`, `cache()`-wrapped, next to `getAllProcedures`):
- `getAllDiagnozy()` — list metadata (no `data` payload) for published records, ordered by `section`.
- `getDiagnozaBySlug(slug)` — full record.
- `getUserDiagnozyCompletions(userId)` — completed slugs (for list chips).

Action (`src/actions/diagnozy.ts`, mirrors `actions/praktyczny.ts` structure):
- `markDiagnozaCompletedAction({ slug })` — auth → `hasDiagnozyAccess()` →
  `checkRateLimit` → Zod-parse → verify slug exists in DB → upsert
  `diagnozyProgress` (`onConflictDoNothing` on the unique index). Returns `{ completed: true }`.

No grading helper, no scoring code anywhere.

## 5. Components (all ≤ ~100 lines, one per file)

```
src/components/diagnozy/
  DiagnozaCard.tsx            # imageless list card: section pill, title, clamped definicja, chips (Ukończone ✓)
  DiagnozyChapterGroup.tsx    # chapter header + grid (grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4)
  DiagnozaTabs.tsx            # client: Nauka | Wypełnij segmented switch (ARIA tabs)
  StudySection.tsx            # collapsible section block
  StringListOrGrouped.tsx     # renders flat list OR grouped (label + items) — used 3×
  DiagnozaStudyView.tsx       # composition of sections in book order
  InterwencjeTable.tsx        # 2-col Interwencja | Uzasadnienie, stacked cards < md
  wypelnij/
    WypelnijRunner.tsx        # client island: step state, calls completion action at the end
    WypelnijCasePanel.tsx     # opisPrzypadku panel (sticky / collapsible)
    WypelnijStepper.tsx       # progress + Wstecz/Dalej nav (no submit/score screen)
    SelectStep.tsx            # selectable option cards (single or multi via prop); picking an
                              # intervention reveals its uzasadnienie (AnimatePresence)
    PrzewodnikSummary.tsx     # the filled 5-row Przewodnik table + "Oznacz jako ukończone"
```

Every option is correct — selecting simply "writes" it into the form; there are no
error states, only idle/hover/selected/revealed. Fill-out state is ephemeral local
state inside `WypelnijRunner` (like `PracticalExamRunner`); no Zustand store needed.

Styling: existing panel look — `@theme` tokens from `globals.css`, `--radius`, chip/card
language of `PielegniastwoGridCard` / `PracticalExamCard`. Framer Motion for tab/step
transitions and uzasadnienie reveal, honoring `prefers-reduced-motion`.

## 6. Delivery order

1. Zod schemas + types; `data/diagnozy.json` checked in.
2. Drizzle tables + `db:push`; `scripts/seed-diagnozy.ts` + run seed.
3. Queries + `hasDiagnozyAccess` helper.
4. List page + cards + conditional sidebar link.
5. Study view (all renderers).
6. Wypełnij flow + completion action + progress chips.
7. Motion & a11y pass; `pnpm run lint` + `pnpm run build`.

## 7. Egzamin mode (designed, built after the MVP)

Modeled on the real practical exam: the nurse draws a diagnosis, fills the Przewodnik
form, and performs the interventions on a mannequin while documenting them. Two phases.

### 7.1 Content at scale (prerequisite)
- 70+ diagnoses authored from the book, plus AI-generated ones. **Every record — human
  or AI — passes the same `DiagnozaSchema`** at seed time; AI output enters as
  `status: 'draft'`, is clinically reviewed, and only `published` records join the exam
  pool. The existing table/seed pipeline needs no changes.
- Distractors are **auto-pooled from sibling diagnoses at runtime** (wrong diagnoza
  formulations, goals/interventions/outcomes from other records). At 70+ records nothing
  is hand-authored; the JSON `practice.distractors` field becomes redundant and can be
  retired.

### 7.2 Egzamin v1 — timed draw + graded Przewodnik (no 3D)
- Flow: start exam → server draws a random published diagnosis → student sees **only**
  `opisPrzypadku` → fills the Przewodnik steps from **pooled options** (correct items +
  sibling distractors, merged and shuffled server-side, no correctness flags sent to the
  client) → submits → server grades, persists the attempt, returns per-step
  correct/missed/extra + score.
- Server: `startExamAction()` (draw + build option payload), `submitExamAction()`
  (Zod-parse selections → grade with a pure `src/helpers/gradeExam.ts` → insert attempt).
  Both mirror `actions/praktyczny.ts`; timing/countdown reuses the practical-exam UI
  patterns (`ExamCountdown`, `TestTimer`).
- New table `wolfmed_diagnozy_exam_attempts` (modeled on `challengeCompletions`):
  `id, userId, diagnozaSlug, score (0–100), stepScores jsonb, timeSpent, passed, completedAt`.
  Fill-out completions (`diagnozy_progress`) stay score-free and separate.
- UI: reuses the Wypełnij step components in an "exam" configuration (options include
  distractors, no uzasadnienie reveal until after submit, submit + result screen).
  ~80% component reuse.

### 7.3 Egzamin v2 — interactive mannequin (`@react-three/fiber`) ✅ built

The execution step ("Wykonanie na fantomie") is the interactive layer: the
student takes each intervention they planned and clicks **where on the patient**
it is performed. Correct region → hit; grading is region-match, extras penalized,
and it runs after intervention-selection so no answers leak.

**Body regions** (widened from 6 to 12 so different chapters map to different
parts): głowa · oczy · uszy · usta/drogi oddechowe · klatka piersiowa · brzuch ·
miednica/krocze · kończyny górne · kończyny dolne · plecy/okolica krzyżowa ·
skóra · całe ciało. Anatomical regions are clickable primitives on the body;
`plecy`/`skóra`/`całe ciało` are on the labelled button rail (`BUTTON_ONLY_ZONES`).
The button rail is the reliable path; the 3D body is the interactive layer — no
precision-clicking required.

**Generalization**: each intervention tags one target region via `exam.bodyZone`
(optional). Any of the 60+ physically-interactive diagnoses is authored as pure
data against the Zod schema — no per-diagnosis 3D code. Fidelity is intentionally
simple; a rigged GLTF can later replace `MannequinModel` with no change to the
interaction or grading (zones map to named meshes).

Non-physical diagnoses (psychological/social/communication — lęk, żałoba, afazja,
przemoc…) are out of this step; a future patient-dialog mode covers them.

#### Original v2 sketch
- Stack: `@react-three/fiber` + `@react-three/drei`, client-only island loaded with
  `next/dynamic` + `ssr: false` so three.js ships **only** on the exam route.
- The "Planowane interwencje" step becomes act-and-document: the student clicks a body
  zone on the mannequin, picks equipment, and the matching intervention is written into
  the form. Grading extends to zone/equipment correctness.
- Schema extension (optional, additive — existing data stays valid):
  `interwencje[].exam?: { bodyZone: string, equipment?: string[] }`, authored per
  diagnosis during content review.
- **Hard dependency: the mannequin asset.** A rigged GLTF model with named interaction
  zones (airway, chest, limbs, face) is a 3D-artist/licensing deliverable, not a code
  task — sourcing it gates this phase, so v1 must not wait for it.

## 8. Out of scope
Spaced repetition, admin authoring UI, AI features inside the module (would require
`premium`), references/piśmiennictwo, Stripe add-on product.

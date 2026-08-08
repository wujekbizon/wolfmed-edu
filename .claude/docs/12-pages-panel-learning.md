# Panel — Learning Pages (Nauka, Procedury, Diagnozy, Kursy)

[← Back to index](./README.md)

Same `panel/layout.tsx` auth + enrollment gate as [`11-pages-panel-core.md`](./11-pages-panel-core.md) applies to every route below.

---

## `/panel/nauka` — Learning hub

**File**: `src/app/panel/nauka/page.tsx` — `dynamic = 'force-dynamic'`. Textbook Golden-Rule-#2 shell: header + six independently-suspended sections, each with its own skeleton (two use `fallback={null}` for below-the-fold, non-critical sections):

| Section | Skeleton | Content |
|---|---|---|
| `NaukaCategoriesSection` | `NaukaCategoriesSkeleton` | Test categories the user can study. |
| `NaukaCellsSection` | `null` | The mind-map/flowcard "cells" board (`userCellsList` table). |
| `NaukaLecturesSection` | `null` | AI-generated audio lectures (`lectures` table). |
| `NaukaNotesSection` | `NaukaCardGridSkeleton` | The user's rich-text notes. |
| `NaukaFlashcardsSection` | `null` | Flashcard decks. |
| `NaukaMaterialsSection` | `NaukaCardGridSkeleton` | Uploaded study materials (UploadThing). |

Three modals rendered at page level (Modal Rendering Rule): `PdfPreviewModal`, `TextPreviewModal`, `UploadMaterialModal`.

## `/panel/nauka/[category]` — Test list within a category (learning context)

**File**: `src/app/panel/nauka/[category]/page.tsx`. Same `moje-testy__` custom-category branching as `/panel/testy/[value]` (see [`11-pages-panel-core.md`](./11-pages-panel-core.md)), but renders `<AllTests tests={tests} category={decodedCategory} />` — the React Query reference component (Golden Rule #5 in root `CLAUDE.md`) rather than the timed `GenerateTests` runner. This is the "browse/study" path; `/panel/testy/[value]` is the "take a timed test" path.

## `/panel/nauka/notatki/[noteId]` — Note detail/editor

**File**: `src/app/panel/nauka/notatki/[noteId]/page.tsx`. `getNoteById(userId, noteId)` → `NoteNotFound` if missing. Two-column layout: sticky sidebar (`NoteMetadataCard` + suspended `NoteFlashcardsSection`, letting the user generate/review flashcards derived from this note) and `NotePageContent` (the Lexical rich-text editor/viewer).

---

## `/panel/procedury` — Procedures hub

**File**: `src/app/panel/procedury/page.tsx`. Checks which of the two procedural courses (`opiekun-medyczny`, `pielegniarstwo`) the user is enrolled in, fetches `getProceduresCount()` per enrolled course, renders `<ProceduresHub hasOpiekun hasPielegniarstwo procedureCounts />` — a course picker.

## `/panel/procedury/[course]` — Procedure list for one course

**File**: `src/app/panel/procedury/[course]/page.tsx`. Redirects to `/panel/procedury` if not enrolled in `course`. **Course-specific rendering branch**: `opiekun-medyczny` → `<AllProcedures />`; `pielegniarstwo` → `<PielegniastwoProceduresList />` (different data shape, `PielegniastwoProcedure` type vs. the generic `Procedure`). Any other course value redirects back to the hub.

## `/panel/procedury/[course]/[slug]` — Procedure detail (study view)

**File**: `src/app/panel/procedury/[course]/[slug]/page.tsx`. `getProcedureBySlug(course, slug)`, `notFound` → redirect. Same course-branch pattern: `pielegniarstwo` → `<PielegniastwoProcedureReader />`; `opiekun-medyczny` → `<OpiekunProcedureReader procedure={{ id, data }} slug />` (`src/components/opiekunReader/`). This is the step-by-step algorithm/visual-recognition reader referenced in CLAUDE.md's "Procedural Learning" feature.

## `/panel/procedury/[course]/[slug]/wyzwania` — Challenges hub for a procedure

**File**: `.../wyzwania/page.tsx`. `getProcedureBySlug` → `getChallengeProgressAction(procedure.id, procedure.data.name)` (`src/actions/challenges.ts`) → `<ChallengesHub course procedureName procedureSlug progress />`. Lists the available challenge types and per-type progress (feeds `procedureBadges`/`challengeCompletions` — see schema doc).

## `/panel/procedury/[course]/[slug]/wyzwania/[type]` — Run one challenge type

**File**: `.../wyzwania/[type]/page.tsx`. Branches on `challengeType`:
- **`ORDER_STEPS`** (`ChallengeType.ORDER_STEPS`, `@/types/challengeTypes`) — only valid for `opiekun-medyczny` (needs the flat algorithm-step shape); redirects back to the hub otherwise. Renders `<OrderStepsChallenge procedure={procedure} />` — a drag-to-reorder challenge (`@dnd-kit`).
- **AI challenge types** (`AI_CHALLENGE_TYPES`, `@/types/generatedQuizTypes`) — checks **per-course** premium access via `checkCourseAccessAction(course)` (deliberately not the global `checkPremiumAccessAction`, since premium is per-course — see the inline comment in the source), loads the most recent AI-generated quiz (`getLatestGeneratedQuiz`), strips answer keys before sending to the client (`stripQuizAnswers`), and renders `<GeneratedQuizExperience isPremium initialQuiz={...} />`.
- Anything else redirects back to the challenges hub.

---

## `/panel/diagnozy` — Diagnozy (nursing diagnosis) browser

**File**: `src/app/panel/diagnozy/page.tsx`. Access-gated by `hasDiagnozyAccess()` (`@/helpers/hasDiagnozyAccess`) — redirects to `/panel/kursy` if false (this feature is scoped to specific course enrollments, separate from the generic `checkCourseAccessAction`). Fetches `getAllDiagnozy()` + `getUserDiagnozyCompletions(userId)` in parallel, renders `<DiagnozyBrowser diagnozy completedSlugs />` or `<DiagnozyEmptyState />` if the content set is empty.

## `/panel/diagnozy/[slug]` — Diagnoza detail (study + fill-in)

**File**: `src/app/panel/diagnozy/[slug]/page.tsx`. Same access gate. `getDiagnozaBySlug(slug)` → `notFound()` if missing. Renders `<DiagnozaTabs>` with two panes:
- **`nauka`** (study) — `<DiagnozaStudyView diagnoza={diagnoza} />`, synchronous, no extra fetch.
- **`wypelnij`** (fill-in/practice) — suspended `WypelnijPanel`, which loads `getDiagnozaFormulations()` (the phrasing/wording bank for constructing a nursing-process write-up) and `getUserDiagnozyCompletions(userId)` to check `alreadyCompleted`, then renders `<WypelnijRunner diagnoza formulations alreadyCompleted />` — the interactive exercise where a student fills in the nursing-process steps for the case, scored against `diagnozyProgress`/`diagnozyExamAttempts`.

## `/panel/diagnozy/egzamin` — Diagnozy practice exam

**File**: `src/app/panel/diagnozy/egzamin/page.tsx`. Same access gate. `<EgzaminHeader />` + `<EgzaminRunner />` (the exam UI: draws a random case, times the attempt, submits for scoring — writes to `diagnozyExamAttempts`), plus a separately-suspended `EgzaminAttempts` panel showing the user's attempt history (`getUserDiagnozyExamAttempts`, capped at `ATTEMPTS_HISTORY_LIMIT` from `@/constants/examAttempts`), with diagnoza titles resolved in bulk via `getDiagnozyTitlesBySlugs` + `getDiagnozyTitlesBySlug` helper.

---

## `/panel/kursy` — My courses

**File**: `src/app/panel/kursy/page.tsx`. `getUserEnrolledCourses(userId)` → `<EnrolledCoursesList courses={...} />` — the enrollment management/overview screen; the redirect target for every access-gated feature above when the user lacks the right course/tier.

## `/panel/kursy/[categoryId]` — Category detail / upsell

**File**: `src/app/panel/kursy/[categoryId]/page.tsx`. Looks up `CATEGORY_METADATA[decodedCategory]`, falling back to `DEFAULT_CATEGORY_METADATA` for categories with no static entry. Three-way access branch:
1. No course access at all → `<NoAccessMessage />`.
2. Has course access but insufficient tier (`hasAccessToTier(userTier, categoryData.requiredTier)` false) → `<TierUpgradeMessage requiredTier userTier />` (the in-app upsell prompt).
3. Full access → `countTestsByCategory(decodedCategory)` and renders `<CategoryDetailView />` with `isPremium` computed from the tier check.

This is the page users land on from a locked/upsell category card elsewhere in the app (e.g. the disabled panel nav link, or a category picker showing a tier badge).

---

## Access-control helpers used throughout this section

- `checkCourseAccessAction(courseSlug)` / `checkPremiumAccessAction()` — `src/actions/course-actions.ts` (DB-authoritative, see [`10-pages-public.md`](./10-pages-public.md) → Purchase flow for the full explanation of why Clerk metadata is not used as the source of truth).
- `hasAccessToTier(tier, required)` — `src/helpers/accessTiers.ts`.
- `hasDiagnozyAccess()` — `src/helpers/hasDiagnozyAccess.ts`.

Full server-action inventory: [`21-server-actions.md`](./21-server-actions.md). Full DB shape: [`01-database-schema.md`](./01-database-schema.md).

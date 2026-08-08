# Panel — Core Pages (Dashboard, Tests, Results, Plan, Settings)

[← Back to index](./README.md)

All routes here sit under `src/app/panel/layout.tsx`, which is both **auth-gated** (`requireUser()`) and **enrollment-gated** (redirects to `/kierunki?from=panel` if the user has zero course enrollments). See [`00-architecture.md`](./00-architecture.md) → Auth model. The layout also computes `isPremium` (used to unlock premium sidebar/note features) and renders the app-wide modals (`ConfirmModal`, `FlashcardReviewModalHost`, `SettingsModal`, `MobileAIFloat`) once, at layout level — see the Modal Rendering Rule in the architecture doc.

---

## `/panel` — Dashboard

**File**: `src/app/panel/page.tsx` — `dynamic = 'force-dynamic'`. The reference-quality example of Golden Rule #2 (page as shell): every data-bearing block is its own `async function`/component behind its own `<Suspense>` with a matching skeleton.

Composition, top to bottom:
- `DynamicBoard` (`src/app/_components/DynamicBoard.tsx` — the shared root `_components`, not a panel-local one, imported via `../_components/DynamicBoard`) — the interactive canvas/board widget.
- `Username` / `UserMotto` — read-only profile display, each in its own Suspense boundary (`UsernameSkeleton`, `UserMottoSkeleton`).
- `UserAnalytics` — test-taking stats, behind `UserAnalyticsSkeleton`.
- `BadgeWidget` — earned procedure badges, behind `BadgeWidgetSkeleton`.
- `AdminBlogWidget` — admin-only shortcut card (renders nothing for non-admins), `fallback={null}`.
- Three inline forms in a grid: `UsernameForm`, `MottoForm` (**the canonical form pattern reference** — root `CLAUDE.md` cites this file explicitly), `TestimonialForm`.
- `StorageQuotaWidget` — personal-library storage usage bar, behind `StorageQuotaWidgetSkeleton`.

### Forms on this page
| Form | Action | Notes |
|---|---|---|
| `UsernameForm` | `updateUsername` (`src/actions/actions.ts:411`) | Updates `users.username`. |
| `MottoForm` | `updateMotto` (`:455`) | Updates `users.motto`. Reference form implementation. |
| `TestimonialForm` | `createTestimonialAction` (`:718`) | Inserts into `testimonials` table. |

---

## `/panel/testy` — Test category picker

**File**: `src/app/panel/testy/page.tsx` — `dynamic = 'force-dynamic'`.

`TestsCategories` (inline async component, behind `<Suspense fallback={<TestsCategoriesListSkeleton />}>`):
1. `getCurrentUser()` → redirect `/sign-in` if none.
2. `getAccessibleCategories()` (`@/helpers/populateCategories`) — categories the user's enrollment tier can see.
3. `checkPremiumAccessAction()` — if premium, also fetches `getUserCustomCategories(userId)` and appends them as `moje-testy__<id>` pseudo-categories (custom user-authored test sets, see `/panel/dodaj-test` below).
4. Renders `<TestsCategoriesList categories={[...accessible, ...custom]} />`.

`CategoryDeepLinkScroller` (separate Suspense, `fallback={null}`) handles scroll-to-category when arriving via a deep link (e.g. `?category=...`).

## `/panel/testy/[value]` — Take a test

**File**: `src/app/panel/testy/[value]/page.tsx` — per-category metadata via `CATEGORY_METADATA` (`@/constants/categoryMetadata`).

`TestsByCategory` (inline async component):
- Decodes the category slug (`decodeURIComponent` — needed because category names contain Polish characters; this is the one comment root `CLAUDE.md` calls out by name as justified).
- If the category is a custom set (`moje-testy__<id>` prefix), resolves it via `getUserCustomCategoryById` + `getUserCustomTestsByIds`; otherwise `getTestsByCategory(decodedCategory)`.
- Loads the active `testSessions` row via `getTestSessionDetails(sessionId)` (session id arrives as a `searchParam`, created by `startTestAction` before navigating here).
- Renders `<GenerateTests tests={...} sessionId={...} duration={...} questions={...} />` — the actual test-taking UI/timer/answer flow.

### Test session lifecycle (server actions in `src/actions/actions.ts`)
- **`startTestAction`** (`:73`) — rate-limited (`test:start`), Zod-validated (`StartTestSchema`). Inside a DB transaction: locks the user row (`for("update")`), auto-expires any of the user's stale `ACTIVE` sessions (past `expiresAt` or no heartbeat in 5 min), rejects if a genuinely active session still exists ("finish it before starting a new one"), then inserts a new `testSessions` row and returns `{ sessionId, expiresAt, durationMinutes, numberOfQuestions }` for the client to navigate with.
- **`submitTestAction`** (`:196`) — grades the submitted answers, updates user aggregates (`testsAttempted`, `totalScore`, `totalQuestions`) and inserts a `completedTestes` row, inside a DB transaction.
- **`deleteTestAction`** (`:368`) / **`expireSessionAction`** (`:1095`) — cleanup paths.
- Session **heartbeat/expiry** during an in-progress test is handled client-side by hooks hitting `api/session/heartbeat` and `api/session/expire` — see [`14-api-routes.md`](./14-api-routes.md).

---

## `/panel/testy-egzaminy` — Tests & exams hub

**File**: `src/app/panel/testy-egzaminy/page.tsx` — `dynamic = 'force-dynamic'`. Landing hub linking into both the theoretical test flow (above) and the practical exam flow (below). Gathers: enrolled-course check for `opiekun-medyczny` (gates practical access), `getAccessibleCategories()` counts, and `getAllPracticalExams()` (`@/lib/praktycznyUtils`) session list, sorted by year/month via a local `MONTH_ORDER` map. Renders `<TestyEgzaminyHub />` with the aggregated counts/names as props — the hub itself does no data fetching.

## `/panel/egzaminy` — Practical exam list

**File**: `src/app/panel/egzaminy/page.tsx`. Redirects to `/panel/testy-egzaminy` if the user isn't enrolled in `opiekun-medyczny` (practical exams are specific to that course). Loads `getAllPublicPracticalExams()` + `checkPremiumAccessAction()`, renders `<PracticalExamList exams={...} isPremium={...} />`.

## `/panel/egzaminy/[slug]` — Run a practical exam

**File**: `src/app/panel/egzaminy/[slug]/page.tsx`. Same enrollment gate. Resolves the exam two ways: first tries `getPublicPracticalExamById(slug)` (a static/seeded exam), and if not found falls back to `getGeneratedPracticalExamById(slug, userId)` (an AI-generated exam owned by this user — see `generatedPracticalExams` table) converted via `toPublicExam()`. Renders `<PracticalExamRunner exam={exam} />` — the interactive exam-taking UI.

---

## `/panel/wyniki` — Test results list

**File**: `src/app/panel/wyniki/page.tsx`. `getCompletedTestsByUser(user.id)` → `<CompletedTestsList tests={...} />`.

## `/panel/wyniki/[testId]` — Single result detail

**File**: `src/app/panel/wyniki/[testId]/page.tsx`, with its own `layout.tsx` (`src/app/panel/wyniki/[testId]/layout.tsx`, purely a flex-centering wrapper, no data/auth logic of its own). `getCompletedTest(testId)`, `notFound()` if missing, renders `<TestResultCard completedTest={...} />` inside `<Suspense fallback={<Loading />}>` (route-level `loading.tsx`).

---

## `/panel/plan` — Learning planner

**File**: `src/app/panel/plan/page.tsx`. Branches on whether the user already has an active plan:
- **Has a plan**: `getPlanProgress(userId)` (`@/server/planner/progress`) returns non-null → renders `<PlanDashboard progress={...} />`.
- **No plan yet**: fetches, per enrolled course, `getConceptCatalog(course.slug)` and `getProcedureOptions(course.slug)` (`@/server/planner/catalog`) plus `getExamDatePresets(course.slug)`, then renders `<PlanWizard />` (creation flow) seeded with per-course catalogs/presets and an `initialFocus` from the `?zakres=` search param (used for deep-linking "focus on this category" from elsewhere in the app).

Planner server logic lives in `src/server/planner/` (`catalog.ts`, `engine.ts`, `progress.ts`) — see [`00-architecture.md`](./00-architecture.md) for the directory map and [`21-server-actions.md`](./21-server-actions.md) for `src/actions/planner.ts`.

## `/panel/ustawienia` — Settings (tutor preferences)

**File**: `src/app/panel/ustawienia/page.tsx`. `getUserPreferencesAction()` (`@/actions/memory-actions`) loads the student's stored tutor preferences (the `memPreferences` table — see [`01-database-schema.md`](./01-database-schema.md)), passed as `initial` to `<PreferencesForm />` (`@/components/memory/PreferencesForm`). This is the only UI surface for editing the "preferences" tier of the AI tutor's memory layer described in `CLAUDE.md` → Data Sources.

## `/panel/dodaj-test` — Create a custom test (premium)

**File**: `src/app/panel/dodaj-test/page.tsx`. Premium-gated: redirects to `/panel/kursy` if `checkPremiumAccessAction()` is false. Renders `<CreateTestHeader />` + `<CreateTestTabs userId={...} />` — confirmed exactly three tabs (`CreateTestTabs.tsx`): **"Tworzenie Testu"** (`CreateTab`, which itself contains `ChooseAnswerCount` + `CreateTestForm` for manual entry + `UploadTestForm` for bulk upload — both live inside this one tab, not split across two), **"Generuj AI"** (`AITestGenerator`), and **"Zarządzanie Testami"** (`ManageTab`, for browsing/deleting existing custom tests and categories). See [`21-server-actions.md`](./21-server-actions.md) for `createTestAction`, `uploadTestsFromFile`, `saveAIGeneratedTestsAction`, and the custom-category actions `createCustomCategoryAction`/`addQuestionToCategoryAction`/`removeQuestionFromCategoryAction`/`deleteCustomCategoryAction`/`updateCategoryNameAction`, all in `src/actions/actions.ts`. Three modals rendered at page level per the Modal Rendering Rule: `DeleteTestModal`, `DeleteCategoryModal`, `CategoryDeleteModalWrapper`.

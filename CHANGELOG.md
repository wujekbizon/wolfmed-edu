# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.6] - 2026-07-11

> Consolidates the practical-exam and learning-planner lines of work. Earlier
> 4.x/5.0.x releases were tagged without changelog entries; this entry documents
> the notable changes shipped on those two branches.

### Added

**Learning Planner ("Plan Nauki")**
- Goal-based learning planner at `/panel/plan`: a three-step wizard (goal + due
  date, minutes-per-day + study days, concept scope from the course curriculum)
  that produces a single active, tracked plan per user.
- Schema: `learning_plans` (with `focusCategoryKey`), `learning_plan_concepts`,
  and `study_logs` tables, plus Zod schemas, rate limits, and server actions
  (create/update/archive/complete plan; add/remove/toggle concept; log study).
- Progress engine deriving pace (`ahead` / `on_track` / `behind`), study streak,
  and a daily "Dziś w planie" suggestion from real activity — completed tests,
  procedure challenges, notes, and manual study logs — attributed to concepts by
  category. Progress is derived at read-time, never stored.
- Course-aware panel countdown (`PlanCountdown`): counts down to the user's own
  plan due date, falling back to the state-exam countdown for opiekun-medyczny or
  a create-plan CTA for other courses.
- "Zaplanuj naukę" deep link from course category pages into the pre-focused wizard.
- Progress integration: a "Plan" tab in `UserAnalytics`, a study-minutes effort
  line on the progress chart, and "Dodaj do planu" on weak categories.

**Mind Maps**
- AI-powered Mind Map learning cell: an interactive concept map (React Flow) with
  radial/tree layouts, per-node mastery tracking, "Wyjaśnij (AI)" explanations,
  and PNG export.

**Practical Exams (MED.14)**
- Practical exam module under `/panel/egzaminy`: seven real MED.14 arkusze
  (Styczeń/Czerwiec 2023–2025), graded documentation cards, drag-and-drop
  procedure ordering, and multi-select answer fields.
- AI practical-exam generation (Premium-gated) with a generation-progress modal
  and an exam-runner skeleton.
- Course-aware "Testy i egzaminy" hub with hero imagery, per-course stats, and
  content previews.

**Tooling**
- `pnpm test` runner using Node's built-in test runner via `tsx`; layout-algorithm
  tests live in a dedicated root `tests/` folder.

### Changed
- Migrated cell/AI generation to Google Vertex AI using Application Default
  Credentials; added the `@google-cloud/vertexai` dependency.
- Procedure steps are now clickable to mark as learned, with a clearer step-row
  hover hierarchy.
- Mobile-first redesign of the in-exam runner (pinned header/timer/progress,
  viewport-bottom submit bar) and the practical-exam brief page.
- Refactored the planner and mindmap features into small, single-purpose
  components (≤90 lines) behind hooks (`usePlanWizard`, `useMindMapCanvas`);
  extracted shared logic into `helpers/`, `constants/`, and `types/` per project
  convention (including moving mindmap types out of `lib/`).
- Planner forms now follow the app form convention (`useActionState` +
  `Input`/`Label`/`FieldError`/`SubmitButton`) and rely solely on server-side Zod
  validation with inline field errors — redundant native HTML5 validation removed.

### Fixed
- Plan "Rozwiąż test" action linked to the session-only test runner (showing "no
  session found") — now deep-links to the test list scrolled to the relevant
  category, keeping session creation in `StartTestForm`.
- Study-log concept `<select>` overflowing its card on long concept labels.
- Wizard plan name not following the selected subject until manually edited.
- Crooked badge digits and various in-exam runner layout/scroll issues.

## [4.1.0] - 2025-01-09

### Added
- Vercel Cron Job for automatic cleanup of expired test sessions (runs daily at 8:00 UTC)
- `getCurrentUser()` centralized query with React `cache()` for request deduplication
- `isSupporter()` helper function using cached user data
- Static generation for blog posts with `generateStaticParams`
- `getAllBlogSlugs()` query for static blog generation
- Not found page for deleted/missing test results (`/panel/wyniki/[testId]/not-found.tsx`)

### Changed
- Admin routes restructured from `/blog/admin` to `/admin` for consistency
- Blog post pages now use ISR with `revalidate = false` (regenerate on deploy only)
- Replaced multiple `getSupporterByUserId()` calls with centralized `getCurrentUser()`
- Replaced scattered `auth()` + user queries with single `getCurrentUser()` pattern
- Optimized `UserAnalytics` component to use `getCurrentUser()` and `Promise.all` for parallel queries
- Optimized `/panel/nauka` page with `Promise.all` for parallel data fetching
- Updated `createTestAction` to use `getCurrentUser()` instead of separate auth + supporter check
- Revalidation paths updated to reflect new admin route structure
- Links in `AdminBlogPanel` and `AdminBlogWidget` updated to new admin routes

### Fixed
- Zombie test sessions staying ACTIVE after expiration (now cleaned up by cron + on-demand)
- Users blocked by expired sessions when starting new tests
- Missing test results now show proper "not found" page instead of error
- Users with `testLimit: null` (unlimited) not getting stats updated on test submission
- Duplicate supporter check in `startTestAction` causing orphaned sessions

### Removed
- Deprecated blog admin layout and page components
- `getSupporterByUserId()` calls (replaced by `getCurrentUser().supporter`)
- Redundant `getUserStats()` call in `UserAnalytics` (data now from `getCurrentUser()`)

### Performance
- Reduced database queries on `/panel` pages from ~5000 `getSupporterByUserId` calls to single `getCurrentUser()` per request
- Blog pages now statically generated at build time instead of server-rendered on demand
- Parallel query execution in data-heavy pages using `Promise.all`

## [4.0.8] - 2025-01-05
### Added
- Transaction-based locking with `FOR UPDATE` in test session handling
- Session ownership verification in all session-related operations
- New `expireSessionAction` with proper authentication and error handling
- Drizzle query builder `.for("update")` implementation for row locking

### Changed
- `submitTestAction` now validates session expiration BEFORE decrementing test limits
- `startTestAction` checks for existing active sessions to prevent duplicates
- `expireTestSession` now requires `userId` parameter for ownership verification
- All session mutations moved inside transactions to prevent race conditions
- Test limit checks now happen inside transactions for consistency
- Remove Socjologia tests 

### Fixed
- Race condition allowing duplicate active sessions when starting tests
- Race condition in test submission causing incorrect test limit decrements
- Users losing test attempts on expired sessions
- Session expiration check happening after test limit validation
- Data inconsistency from concurrent session operations

### Removed
- `sessionExists` query (replaced by transaction-based checking)
- `cache` wrapper from all mutation functions (deleteCompletedTest, updateUsernameByUserId, createNote, etc.)
- Separate `getUserTestLimit` call before transaction in submitTestAction

### Security
- Added ownership verification to prevent users from expiring other users' sessions
- All session operations now verify user authentication before execution

## [4.0.7] - 2025-12-30
### Added
- LearningPaginationButton component with red accent theme matching learning section design
- LearningPaginationControls component replacing blog-styled pagination
- Documentation for full learning experience redesign (stats, mastery tracking, progress bars)

### Changed
- FilteredTestsList now uses learning-themed pagination instead of blog purple theme
- Pagination scroll behavior updated to scrollIntoView with smooth animation
- Added scroll-margin-top (128px) to compensate for fixed header + navbar

### Fixed
- Pagination staying at bottom of page - now smoothly scrolls to top on page change
- Visual mismatch between blog pagination and learning section styling

## [4.0.6] - 2025-12-30
### Added
- 268 new question for Opiekun Medyczny

### Changed
- Upddated few compnents that display test numbers and update Najnowsze aktualizacje section in user dashboard

## [4.0.5] - 2025-12-18

### Performance
- Added WebSocket configuration for Neon serverless driver to eliminate TCP health check queries
- Reduced database query load by ~40% through WebSocket connection optimization

### Changed
- Enabled static generation on homepage, blog page, and kierunki pages with `force-static` export
- Simplified HeroCallToActionButtons component by removing conditional authentication check

### Added
- ws package for WebSocket support in Neon serverless driver
- @types/ws for TypeScript WebSocket type definitions

## [4.0.4] - 2025-12-16
### Changed
- Updated user onboarding messaging in UserOnboard component to reflect new test limits and premium offerings.
- Modified database schema to change default test limit for users and added new indexes for improved query performance.

## [4.0.3] - 2025-12-10

### Fixed
- Fixed test results page crash when viewing deleted/non-existent test
- Added redirect to results list when test doesn't exist instead of error

## [4.0.2] - 2025-12-09

### Added
- Merge official materials with user materials for improved resource availability
- Official materials retrieval method in fetchData

### Changed
- Material upload button now conditionally rendered based on user support status
- Delete button only shown for user-created materials (not system materials)
- Optimized database connection settings

## [4.0.1] - 2025-12-05

### Fixed
- Fixed race condition in material upload that could allow storage limit to be exceeded
- Fixed userLimits table creation - now only created for supporters

### Changed
- Material upload validation now happens atomically within database transaction
- Improved error messages - translated to Polish for user-facing errors
- UserLimits record now created when user becomes supporter (payment webhook)

### Security
- Prevented concurrent uploads from bypassing storage limit checks

## [4.0.0] - 2025-12-04
- Initial major release with Next.js 16, React 19, and React Compiler
- Medical education platform with test-taking, procedural learning, and community forum
- Stripe payment integration for supporter features
- File upload system with storage quotas for supporters
- Rich text editor for study materials
- User dashboard with customizable widgets

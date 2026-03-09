# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

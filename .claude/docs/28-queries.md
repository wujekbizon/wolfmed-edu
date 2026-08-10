# Database Queries Catalog (`src/server/queries.ts`)

[← Back to index](./README.md)

`src/server/queries.ts` is 2,601 lines, 136 exported functions — the largest file in the codebase, and the app's **read-side data-access layer**: Server Components and Server Actions call into it directly (it isn't itself `"use server"`; it's a plain module of Drizzle query functions, most wrapped in React's `cache()` for per-request dedup). Write-side mutations mostly live in `src/actions/*.ts` ([`21-server-actions.md`](./21-server-actions.md)), though a real minority of `queries.ts` functions do write — noted per-entry below, since which ones do (and how they're wrapped) turned out to matter, see the findings section at the bottom.

Every function below is read directly from source: real signature, return shape, and any join/aggregation/transaction logic worth knowing before assuming "it does what the name says."

---

## Tests & sessions

| Function | Signature | Behavior |
|---|---|---|
| `getAllTests` | `() => ExtendedTest[]` | All rows in `tests`, newest-id-first. |
| `getTestsByCategory` | `(category) => ExtendedTest[]` | Filters via a JSONB path expression (`meta->>'category'`), not a real column. |
| `getCategories` | `() => {meta:{category,course}}[]` | Loads every test's `meta` column, dedupes categories client-side in JS (a `Set`) rather than `SELECT DISTINCT` — reasonable at current table size, but scans the whole table. |
| `countTestsByCategory` | `(category) => number` | Same JSONB path filter as `getTestsByCategory`, `COUNT(*)`. |
| `getCompletedTestsByUser` | `(userId) => ExtendedCompletedTest[]` | Newest-completed-first. |
| `getCompletedTest` | `(testId) => CompletedTest \| undefined` | Single row by id, no ownership check (caller's responsibility). |
| `deleteCompletedTest` | `(testId) => void` — **write** | Deletes by id only, no `userId` filter — ownership must be verified by the caller before calling this. **Wrapped in `cache()`** despite being a mutation — see Findings below. |
| `getQuestionById` | `(testId) => ExtendedTest \| undefined` | Misleadingly named: looks up a row in `tests` by its own `id`, not a per-question lookup within a test. |
| `getUserTestLimit` | `(userId) => {testLimit} \| undefined` | Reads the denormalized `users.testLimit` counter directly. |
| `getTestSessionDetails` | `(sessionId) => {durationMinutes, numberOfQuestions} \| undefined` | Only two columns selected — a lightweight lookup for resuming a session, not the full row. Not `cache()`-wrapped (plain `export async function`), unlike almost everything else in this group. |
| `getDetailedTestHistory` | `(userId, limit=50) => row[]` | `completedTestes ⋈ testSessions`, one row per completed test (id, score, category, duration, timestamp) — feeds a history table UI. **Confirmed distinct from the two below**, not a duplication (round 8/9 doc-testing) — see the note at the bottom. |
| `getCategoryPerformance` | `(userId) => {category, totalTests, avgScore, totalQuestions, correctAnswers}[]` | Same base join as `getDetailedTestHistory`, aggregated **by category** in JS (a `Map`), not SQL `GROUP BY` — fine at per-user data volumes, would need revisiting if a user's test history grew very large. |
| `getQuestionAccuracyAnalytics` | `(userId) => {questionId, timesAnswered, timesCorrect, accuracy}[]` | Loads every completed test's `testResult` JSON blob for the user, tallies per-question correctness in JS, filters to **accuracy < 50%** (the "problematic questions" feed) and sorts worst-first. Whole-table-scan-per-user pattern, same caveat as above. |
| `getProgressTimeline` | `(userId, days=30) => {date, avgScore, testsCount}[]` | Same join, filtered to the last `days`, bucketed **by calendar date** (`completedAt.toISOString().split('T')[0]`) in JS — powers a progress line chart. |
| `getTestActivitySince` | `(userId, since) => {completedAt, startedAt, durationMinutes, category}[]` | Raw activity rows since a timestamp, no aggregation — feeds the learning-planner's cross-feature activity ledger (see Planner section below). |
| `getUserStats` | `(userId) => {totalScore, totalQuestions, testsAttempted}` | Reads three **denormalized lifetime counters** straight off the `users` row — O(1), not derived from `completedTestes`. **Confirmed distinct** from `getDetailedTestHistory`/`getCategoryPerformance` (see bottom note) — this is a summary widget read, those are a list and a breakdown. |

## Custom tests & categories (`/panel/dodaj-test`)

| Function | Signature | Behavior |
|---|---|---|
| `getUserCustomTests` | `(userId) => UserCustomTest[]` | All of a user's custom tests, newest-first. |
| `getUserCustomTestsByIds` | `(ids: string[]) => UserCustomTest[]` | Bulk lookup for a custom-category test session; returns `[]` immediately on an empty id array without querying. |
| `getUserCustomTestById` | `(userId, testId) => UserCustomTest \| undefined` | Ownership-checked (`id AND userId`). |
| `deleteUserCustomTest` | `(userId, testId) => DeleteResult` — **write** | Ownership-checked delete. Not `cache()`-wrapped. |
| `getUserCustomCategories` | `(userId) => UserCustomCategory[]` | Newest-first. |
| `getUserCustomCategoryById` | `(userId, categoryId) => UserCustomCategory \| undefined` | Ownership-checked. |
| `getUserCustomCategoryByName` | `(userId, categoryName) => UserCustomCategory \| undefined` | Ownership-checked, exact name match — used to detect duplicate category names before creating a new one. |
| `deleteUserCustomCategory` | `(userId, categoryId) => DeleteResult` — **write** | Ownership-checked delete. Not `cache()`-wrapped. |

## Procedures & challenges

| Function | Signature | Behavior |
|---|---|---|
| `getAllProcedures` | `(course='opiekun-medyczny') => ExtendedProcedures[]` | Filtered by course, newest-id-first. |
| `getProceduresCount` | `(course='opiekun-medyczny') => number` | `COUNT(*)` filtered by course. |
| `getProcedureById` | `(id) => ExtendedProcedures \| null` | Single row, no course scoping. |
| `getProcedureOptions` | `(course) => {id, name}[]` | Lightweight id+name list specifically for planner-wizard pickers — `name` is pulled from the JSONB `data->>'name'` column and used to sort, not a real indexed column. |
| `getProcedureBySlug` | `(course, slug) => ExtendedProcedures \| null` | Slugs are unique **within a course**, so both are required — a slug alone isn't guaranteed unique across courses. |
| `saveChallengeCompletion` | `(tx, {userId, procedureId, challengeType, score, timeSpent}) => void` — **write, transaction-scoped** (`tx: any`, no typed transaction param) | Upsert-by-hand: checks for an existing completion, and if found, **never downgrades**: `score: Math.max(previous.score, data.score)`, `passed: previous.passed \|\| passed` — a retake can improve a score or a pass, never revoke one, per the inline comment (a badge is granted off `passed`, so downgrading it would strip an earned badge). Increments `attempts` via a raw SQL `+1`. Not `cache()`-wrapped, correctly — must run fresh inside its caller's transaction every time. |
| `checkAllChallengesComplete` | `(tx, userId, procedureId) => boolean` — transaction-scoped | Looks up the procedure's `course`, gets that course's required challenge-type set via `challengeTypesForCourse()` (see [`25-helpers.md`](./25-helpers.md)), and checks whether the user has a **passed** completion for every required type — filtering out completions for types no longer in the required set (handles a challenge type having been removed from the course after some users already completed it). |
| `awardBadge` | `(tx, {userId, procedureId, procedureName, badgeImageUrl?}) => void` — transaction-scoped | Idempotent: no-ops if a badge for this `(userId, procedureId)` pair already exists. Falls back to a hardcoded placeholder image URL if the procedure has none. |
| `getChallengeCompletion` | `(userId, procedureId, challengeType) => ChallengeCompletion \| undefined` | Single completion lookup, all three keys required. |
| `getChallengeCompletionsByProcedure` | `(userId, procedureId) => ChallengeCompletion[]` | **Filtered to `passed = true` only** — despite the name not saying so, this returns passed completions, not every attempt. |
| `getProcedureBadge` | `(userId, procedureId) => ProcedureBadge \| undefined` | Single badge lookup. |
| `getUserBadges` | `(userId) => ProcedureBadge[]` | All of a user's badges, newest-earned-first; `earnedAt` serialized to ISO string. The read-side counterpart to `awardBadge`'s write — see [`11-pages-panel-core.md`](./11-pages-panel-core.md) → `BadgeWidget`. |
| `getChallengeActivitySince` | `(userId, since) => {completedAt, timeSpent, procedureId}[]` | Feeds the planner's activity ledger, same pattern as `getTestActivitySince`. |

## Diagnozy

| Function | Signature | Behavior |
|---|---|---|
| `getAllDiagnozy` | `() => DiagnozaListItem[]` | Lightweight browse-list projection — pulls a 220-char snippet of the JSONB `data->>'definicja'` field via SQL `left()` rather than shipping the whole case JSON for a list view. |
| `getDiagnozyTitlesBySlugs` | `(slugs: string[]) => {slug, section, title}[]` | Bulk title lookup; `[]` immediately on an empty array. |
| `getDiagnozaBySlug` | `(slug) => Diagnoza \| null` | Returns `row.data` — the full case JSON blob, not the wrapper row. |
| `getUserDiagnozyCompletions` | `(userId) => string[]` | Just the slugs a user has practiced (not scored) — `diagnozyProgress`, the completion tracker distinct from the scored exam attempts below. |
| `insertDiagnozaCompletion` | `(userId, diagnozaSlug) => void` — **write** | `.onConflictDoNothing()` — safe to call repeatedly for the same case, no duplicate rows or error on a re-practice. |
| `getDiagnozaFormulations` | `() => {slug, text}[]` | Pulls just the `diagnozaPielegniarska` JSONB field across all cases, ordered by `section` — likely feeds a reference/study list rather than the full case view. |
| `getDiagnozyForExam` | `() => Diagnoza[]` | Loads **every** case's full `data` JSON — the practical-exam question pool. No filtering; the caller (exam generation) is expected to sample from the full set. |
| `insertDiagnozyExamAttempt` | `(attempt: {userId, diagnozaSlug, score, stepScores, timeSpent, passed}) => void` — **write** | Plain insert, no upsert — every exam attempt gets its own row (unlike `diagnozyProgress`, which is idempotent per case). |
| `getUserDiagnozyExamAttempts` | `(userId, limit=10) => attempt[]` | Newest-first, capped at `limit`. |

## Practical exams & generated quizzes

| Function | Signature | Behavior |
|---|---|---|
| `saveGeneratedPracticalExam` | `(userId, exam: PracticalExam) => examId` — **write** | Stores the exam's own `id` as the primary key (not a fresh generated one) and the whole exam as a JSONB blob (`examJson`). Throws if the insert returns no row (should be unreachable under normal DB operation). |
| `getGeneratedPracticalExamById` | `(id, userId) => PracticalExam \| null` | Ownership-checked, returns the unwrapped `examJson`. |
| `saveGeneratedQuiz` | `(data: {userId, procedureId, challengeType, quizJson}) => quizId` — **write, self-pruning** | After inserting, immediately runs a second query to find the `GENERATED_QUIZ_KEEP = 3` newest quizzes for that `(user, procedure, type)` triple, then deletes everything else matching the triple that isn't in that keep-set. The inline comment explains why: only the latest is ever read by the UI, so pruning caps unbounded row growth from repeated regeneration — **not** a caching or versioning feature, purely storage hygiene. Two round-trips (insert, then select+delete), not wrapped in an explicit transaction — a crash between them would leave old rows un-pruned but not cause data loss. |
| `getGeneratedQuizById` | `(quizId, userId) => row \| null` | Ownership-checked single lookup. |
| `getLatestGeneratedQuiz` | `(userId, procedureId, challengeType) => row \| null` | Newest row for the triple — this is what a page actually renders; `saveGeneratedQuiz`'s pruning exists specifically so this query never has to scan old rows. |

## Blog

| Function | Signature | Behavior |
|---|---|---|
| `getAllBlogPosts` | `(filters?: BlogPostFilters) => BlogPost[]` | The general-purpose list query: status/category/author/search filters, configurable sort (`sortBy`/`sortOrder`, default `publishedAt desc`), limit/offset pagination, built via Drizzle's `.$dynamic()`. A second query batches like-counts for every returned post (`GROUP BY postId`) and merges them in — two round-trips, not a join, to avoid multiplying post rows by like count. Wrapped in try/catch, **logs and swallows errors, returning `[]`** — a DB failure here looks identical to "no posts match," worth knowing when debugging an empty list that shouldn't be empty. |
| `getBlogPostBySlug` | `(slug) => BlogPost \| null` | **Published only** — will not return a draft/archived post even by exact slug. Three sequential queries (post, then category if any, then tags, then like count) rather than one joined query. Same swallow-errors-to-`null` pattern. |
| `getBlogPostById` | `(id) => BlogPost \| null` | The admin-editing counterpart to `getBlogPostBySlug` — **no status filter**, so this is how a draft/archived post is reachable for editing. Same category+tags fetch pattern, but no like count (not needed for an edit form). |
| `getFeaturedBlogPosts` | `(limit=3) => BlogPost[]` | Published, ordered by `viewCount desc`. |
| `getPopularBlogPosts` | `(limit=5) => BlogPost[]` | **Identical query to `getFeaturedBlogPosts`** — same filter, same sort, only the default `limit` differs (3 vs 5). Two names for the same ranking; worth knowing if editing one's logic — the other needs the same edit or they'll silently diverge. Not flagged as a numbered audit finding (harmless today, since both just happen to want "most-viewed published posts"), but a real duplication in the same spirit as `buildAccessibleCategories`/`populateCategories` (audit note #14) if either ever needs to change independently. |
| `getRelatedBlogPosts` | `(postId, limit=4) => BlogPost[]` | The docstring says "based on category and tags," but the implementation **only filters by category** (`currentPost.categoryId`, if present) — tags are never read or compared. Falls back to any published post (excluding the current one) if the post has no category. Not a bug exactly (it does return *related-ish* posts), but the comment overstates what the query does — a maintainer trusting the docstring would assume tag-based relevance exists when it doesn't. |
| `searchBlogPosts` | `(query) => BlogPost[]` | Requires `query.trim().length >= 3` (returns `[]` below that, no query executed) — a floor against firing a `LIKE '%%'`-style scan on 1-2 characters. `LIKE` (not full-text search) across title/excerpt/content, capped at 20 results. |
| `getAllBlogPosts` filters aside, category/tag list helpers: `getBlogCategories`, `getBlogCategoryBySlug`, `getBlogCategoryById`, `getBlogTags`, `getBlogTagBySlug`, `getBlogTagById` | Standard lookups | All follow the same try/catch-swallow-to-`null`/`[]` pattern as the post queries above. Categories sort by `order` then `name`; tags sort by `name` only. |
| `getBlogPostsByCategorySlug` | `(categorySlug, limit?) => BlogPost[]` | Resolves the category first (`getBlogCategoryBySlug`), then filters posts — `[]` immediately if the category slug doesn't resolve. Published only. |
| `getBlogPostsByTagSlug` | `(tagSlug, limit?) => BlogPost[]` | Two-step: resolve the tag, then a separate query for post ids via the `blogPostTags` join table, then fetch those posts by id — not a single joined query. `[]` early at either step if nothing resolves. |
| `hasUserLikedPost` | `(postId, userId) => boolean` | Existence check on `blogLikes`' composite key — the read-side of the like-toggle idempotency described in root `CLAUDE.md`. |
| `getBlogStatistics` | `() => BlogStatistics` | Admin-dashboard aggregate: **7 separate `COUNT`/`SUM` queries**, not one combined query with `FILTER` clauses the way `getMessageStats`/`getForumStats` below do it — the inline comment on those two explicitly calls out "1 query instead of 4" as an optimization, but this function (which has *more* separate queries, not fewer) predates or was never given the same treatment. Worth combining if this page is ever slow. |
| `searchBlogPosts` aside — no `getBlogStatistics`-specific caching beyond the standard `cache()` wrap. | | |

## Forum

| Function | Signature | Behavior |
|---|---|---|
| `getAllForumPosts` | `() => ForumPost[]` | Every post **with all its comments** eagerly loaded (`with: {comments}`), newest-post-first, comments oldest-first within each post. No pagination — loads the entire forum in one call. Dates serialized to ISO strings. |
| `getForumPostById` | `(postId) => ForumPost \| null` | Same eager-comments pattern, single post. |
| `getPostById` | `(id) => BlogPost \| undefined` | **Misleadingly named relative to the forum functions around it** — this is actually a `blogPosts` lookup (`db.query.blogPosts.findFirst`), not a forum post. Sits in the file between forum-post functions, which makes the name collision easy to misread at a glance; it isn't a forum duplicate of `getForumPostById`. |
| `createForumPost` | `(data: {title, content, authorId, authorName, authorRole, readonly}) => ForumPost` — **write** | Plain insert with server-set timestamps. **Wrapped in `cache()`** — see Findings below. Note `readonly` is accepted straight from the caller with no role check inside this function — the actual authorization gap (any user can set it) is in the calling Server Action, not here; see README audit note #11. |
| `deleteForumPost` | `(postId) => void` — **write** | No ownership check inside this function — the caller (`deletePostAction`) is responsible, and per README audit note #9, that check has its own looseness. **Wrapped in `cache()`.** |
| `createForumComment` | `(data: {postId, content, authorId, authorName}) => ForumComment` — **write** | Plain insert. **Wrapped in `cache()`.** |
| `deleteForumComment` | `(commentId) => void` — **write** | No ownership check inside this function. **Wrapped in `cache()`.** |
| `getLastUserPostTime` / `getLastUserCommentTime` | `(userId) => Date \| null` | Single most-recent timestamp each — likely rate-limit or "you just posted" UX support. |
| `getLastUserForumPost` / `getLastUserForumComment` | `(userId) => {id, title/content, createdAt, ...} \| null` | Full-row versions of the two above. |
| `getForumNotifications` | `(userId) => {newPosts, newAdminPosts, newComments}` | Reads the user's `forumReadState` (`lastSeenPostsAt`/`lastSeenCommentsAt`), falling back to **account creation time** if the user has never had a read-state row — so a brand-new user's "unread" count is correctly bounded to activity since signup, not since the dawn of the forum. Runs the watermark through `forumWatermark()` (see [`25-helpers.md`](./25-helpers.md)) before comparing. Two counts run in `Promise.all`: new posts (excluding the user's own, split into total vs. admin-authored via a `FILTER` clause) and new comments **specifically on the user's own posts** (excluding the user's own comments) — this is a "someone replied to you" notification, not "any new forum activity." |
| `getForumStats` | `() => ForumStats` | Admin dashboard: total/this-week/this-month post counts via `FILTER` clauses in one query, an "unanswered" count via `NOT IN (subquery of post ids with any comment)`, and total comments — 2 queries via `Promise.all`, the efficient pattern `getBlogStatistics` above doesn't use. |
| `getRecentForumPosts` | `(limit=5, offset=0) => RecentForumPost[]` | A left join + `GROUP BY` for comment counts per post, ordered newest-first with `id` as a tiebreaker (stable pagination if two posts share a timestamp) — the only forum list query here that's actually paginated. |

## Notes

| Function | Signature | Behavior |
|---|---|---|
| `getAllUserNotes` | `(userId) => Note[]` | Newest-first, dates to ISO strings. |
| `getTopPinnedNotes` | `(userId, limit=5) => Note[]` | Filtered to `pinned = true`, newest-first, capped. |
| `getNoteById` | `(userId, noteId) => Note \| null` | Ownership-checked. |
| `createNote` | `(userId, data: NoteInput) => Note` — **write** | Validates/normalizes the Lexical content via `parseLexicalContent()` before inserting — **throws** on invalid content rather than silently storing garbage. **Wrapped in `cache()`** — see Findings below. |
| `updateNote` | `(userId, noteId, data: Partial<NoteInput>) => Note \| null` — **write** | Same content validation, only if `data.content` is actually present in the partial update (an update that doesn't touch content skips re-parsing). Always bumps `updatedAt`. Ownership-checked in the `WHERE`. **Wrapped in `cache()`.** |
| `deleteNote` | `(userId, noteId) => Note \| null` — **write** | Ownership-checked. **Wrapped in `cache()`.** |

## Materials

| Function | Signature | Behavior |
|---|---|---|
| `getMaterialsByUser` | `(userId) => Material[]` | Newest-first, dates to ISO strings (with an optional-chained fallback to `null` if a date field is somehow absent). |
| `getMaterialById` | `(userId, materialId) => Material \| null` | Ownership-checked. |
| `deleteMaterial` | `(userId, materialId) => Material \| null` — **write** | Ownership-checked. **Wrapped in `cache()`** — see Findings below. Note: this only deletes the DB row; the actual storage-quota refund and UploadThing file deletion happen in the calling Server Action (`deleteMaterialAction`), not here. |
| `getUserStorageUsage` | `(userId) => {storageUsed, storageLimit}` | Falls back to `{0, 20_000_000}` (20MB) if the user has no `userLimits` row yet — the default quota is baked into this fallback, not read from a config constant. **Not `cache()`-wrapped** (plain `async` function) — deliberately, since quota needs to reflect the very latest write inside the same request (e.g. right after an upload). |

## Flashcards

| Function | Signature | Behavior |
|---|---|---|
| `getFlashcardDecksByUser` | `(userId) => FlashcardDeck[]` | Newest-deck-first, cards within each deck ordered by `position` then `createdAt`. Runs through a shared `toFlashcardDeck()` mapper (module-private, not exported) that reshapes the Drizzle relational result into the app's `FlashcardDeck` type. |
| `getFlashcardDeckById` | `(userId, deckId) => FlashcardDeck \| null` | Ownership-checked, same mapper. |
| `getFlashcardDeckByNoteId` | `(userId, noteId) => FlashcardDeck \| null` | Looks up by `sourceRef = noteId`, not by a deck id — the read-side counterpart to `resolveNoteDeckId()`'s write in `src/actions/flashcardDecks.ts` (see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md) and [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 3). |

## Lectures

| Function | Signature | Behavior |
|---|---|---|
| `getLectureByHash` | `(userId, contentHash) => Lecture \| null` | The dedup lookup behind `generateLectureAction` (see [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md) → Flow D) — a lecture is only regenerated if no row exists for this exact content hash. |
| `insertLecture` | `(data: NewLecture) => Lecture` — **write** | Plain insert, throws (via non-null assertion) if no row comes back. Not `cache()`-wrapped. |
| `deleteLectureById` | `(userId, lectureId) => Lecture \| null` — **write** | Ownership-checked. Not `cache()`-wrapped. |
| `updateLectureDuration` | `(userId, lectureId, duration) => void` — **write** | Ownership-checked, bumps `updatedAt`. Called once the client-side audio player reports the actual decoded duration (generation time doesn't know it in advance). Not `cache()`-wrapped. |
| `getLecturesByUser` | `(userId) => Lecture[]` | Newest-first. |

## Board cells

| Function | Signature | Behavior |
|---|---|---|
| `getUserCellsList` | `(userId) => UserCellsList \| null` | One row per user (the whole board is a single blob) — reshapes the DB row's JSONB `cells`/`order` columns into typed objects. |
| `createUserCellsList` | `(userId, cells, order) => void` — **write** | Plain insert (first-ever save for a user). **Wrapped in `cache()`** — see Findings below. |
| `updateUserCellsList` | `(userId, cells, order) => void` — **write** | **Full unconditional overwrite** of `cells`/`order`, no version/timestamp check against what's stored — this is the exact function behind README audit note #17 (a save from one tab/device silently discards another's concurrent edits). Bumps `updatedAt`. **Wrapped in `cache()`.** |
| `checkUserCellsList` | `(userId) => row \| null` | Existence check — used by `saveCellsAction` to decide insert-vs-update. |

## Courses & enrollment

| Function | Signature | Behavior |
|---|---|---|
| `getAllCourses` | `() => Course[]` | Active courses only, oldest-created-first. |
| `getCourseBySlug` | `(slug) => Course \| null` | Active-only. |
| `getUserEnrolledCourses` | `(userId) => (Course & {enrolledAt, accessTier, expiresAt})[]` | Joins `courseEnrollments ⋈ courses`, filtered to **active enrollment AND active course** — an enrollment in a course that's since been deactivated won't show up here even if the enrollment row itself is still active. |
| `getUserEnrollments` | `(userId) => CourseEnrollment[]` | Raw active-enrollment rows, no course join — the lighter-weight check used by the `/panel` layout guard (does this user have *any* enrollment at all) rather than needing full course details. |

## Learning planner

| Function | Signature | Behavior |
|---|---|---|
| `getActivePlan` | `(userId) => LearningPlan \| null` | Single plan where `status = 'active'` — implies at most one active plan per user is expected (not enforced at the DB level in this query, just assumed). |
| `getActivePlanWithConcepts` | `(userId) => (LearningPlan & {concepts}) \| null` | Calls `getActivePlan` internally, then a second query for the plan's concepts ordered by `sortOrder` — two round-trips, not a join. |
| `getPlanById` | `(planId) => LearningPlan \| null` | No `userId` filter — ownership must be checked by the caller. |
| `getConceptById` | `(conceptId) => Concept \| null` | Same — no ownership scoping in this function itself. |
| `getStudyLogsSince` | `(userId, since) => row[]` | Raw log rows since a timestamp — one of four `*ActivitySince` functions (with `getTestActivitySince`, `getChallengeActivitySince`, `getNoteActivitySince`) that together feed the planner's cross-feature activity ledger; each pulls from a different table with the same "since a date" shape rather than one combined query. |
| `insertStudyLog` | `(data: {userId, minutes, source, categoryKey?, procedureId?, conceptId?, note?}) => void` — **write** | The shared ledger-write function called from the test-taking, practical-exam, and planner flows wherever study time needs logging (per its own inline comment) — features call this on completion so their time counts toward planner progress, streaks, and daily goals. Not `cache()`-wrapped. |

## User profile & stats

| Function | Signature | Behavior |
|---|---|---|
| `getUserMotto` | `(userId) => string` | Falls back to `""` if no motto set (never `null`/`undefined`). |
| `updateMottoByUserId` | `(userId, newMotto) => void` — **write** | **Wrapped in `cache()`** — see Findings below. |
| `getUserUsername` | `(userId) => string` | Falls back to `""`. |
| `updateUsernameByUserId` | `(userId, newUsername) => void` — **write** | **Wrapped in `cache()`.** |
| `getUserStats` | See Tests & sessions above (kept there since it's about test stats specifically). | |
| `getUserIdByCustomer` | `(customerId) => string \| null` | Stripe-customer-id → app-user lookup, via the `subscriptions` table. **Throws if not found** (not just returns `null`) — caught and re-thrown by the function's own try/catch, so callers must handle a rejected promise, not just a `null` return, despite the `Promise<string | null>` return type suggesting `null` is the "not found" signal. |
| `getUserIdByCustomerEmail` | `(customerEmail) => string \| null` | Same pattern via the `payments` table (email fallback path for the Stripe webhook, see [`14-api-routes.md`](./14-api-routes.md)) — same throw-not-null-on-miss inconsistency with its own return type. |

## Testimonials & supporters

| Function | Signature | Behavior |
|---|---|---|
| `createTestimonial` | `(data: {userId, content, rating, visible}) => Testimonial` — **write** | Plain insert. Not `cache()`-wrapped. |
| `getTestimonials` | `(visibleOnly=true) => Testimonial[]` | Newest-first. |
| `getTestimonialsWithUsernames` | `(visibleOnly=true) => (Testimonial & {username})[]` | Left-joins `users` for the display name — used by the home page (see [`10-pages-public.md`](./10-pages-public.md)). |
| `getUserTestimonials` | `(userId) => Testimonial[]` | A single user's own testimonials, newest-first. |
| `updateTestimonial` | `(id, {content?, rating?, visible?}) => Testimonial` — **write** | **Bug**: sets `createdAt: new Date()` in its `.set()` call, not `updatedAt` — every edit overwrites the testimonial's original creation timestamp with the edit time. `testimonials` has a real `updatedAt` column (per `schema.ts`) that this function never touches. Consequence: `getTestimonials`/`getTestimonialsWithUsernames` both sort by `createdAt DESC`, so an edited (even years-old) testimonial jumps to the top of "newest" listings as if freshly submitted, and the true original submission date is permanently lost. Not `cache()`-wrapped. Flagged as a new finding — see below. |
| `deleteTestimonial` | `(id) => Testimonial \| undefined` — **write** | **Wrapped in `cache()`** — see Findings below. |
| `getEarlySupporters` | `(limit=5) => {id, username}[]` | Filtered to `users.supporter = true`, oldest-account-first (earliest supporters), falls back to `"Anonymous"` for a missing username. |
| `getStripeSupportPayments` | `() => Payment[]` | All rows in `payments` — despite the name, not filtered to "support" payments specifically (there's no such distinction at the query level); `createdAt` defaults to `new Date()` if somehow null. |
| `getSupportersUserIds` | `() => string[]` | Calls `getStripeSupportPayments()` internally and maps to `userId` — every payer counts as a "supporter" here, not a separately-flagged subset. |
| `getSupportersWithUsernames` | `() => Supporter[]` | Raw SQL subquery (`users.userId IN (SELECT userId FROM payments)`) rather than reusing `getSupportersUserIds` — a second, differently-implemented way of arriving at "users who have paid," worth knowing if the two ever need to agree and don't. |

## Admin / messages

| Function | Signature | Behavior |
|---|---|---|
| `getAllMessages` | `(page=1, limit=20) => {messages, pagination}` | Standard offset pagination, plus a separate `COUNT(*)` for `pagination.total`/`totalPages` — two queries. |
| `getMessageStats` | `() => {total, unread, thisWeek, thisMonth}` | **One query with `FILTER` clauses**, per its own inline comment ("1 query instead of 4 separate queries") — the pattern `getBlogStatistics` above notably doesn't follow. |
| `markMessageAsRead` | `(id: number) => void` — **write** | Sets `isRead: true` + bumps `updatedAt`. Not `cache()`-wrapped. Note the id type is a plain `number` (this table uses a `serial` PK), unlike almost everything else in this file which keys on string UUIDs/Clerk ids. |
| `getUnreadMessageCount` | `() => number` | `COUNT(*) WHERE isRead = false`. |

---

## Findings from this pass

**Mutations wrapped in React's `cache()`** — a pattern worth flagging on its own. `cache()` is a per-request read-dedup primitive: calling a `cache()`-wrapped function twice with identical arguments *within the same request* returns the same memoized promise instead of running the function body twice. That's the right behavior for a read. For a **write**, it means a second call with the same arguments in the same request would silently **not perform a second mutation** — it would return the first call's already-resolved result without re-executing the insert/update/delete. 14 of this file's write functions are wrapped this way: `deleteCompletedTest`, `createForumPost`, `deleteForumPost`, `createForumComment`, `deleteForumComment`, `updateUsernameByUserId`, `updateMottoByUserId`, `createNote`, `updateNote`, `deleteNote`, `createUserCellsList`, `updateUserCellsList`, `deleteMaterial`, `deleteTestimonial`. Roughly an equal number of write functions in this same file are **not** wrapped (`saveChallengeCompletion`, `awardBadge`, `insertDiagnozaCompletion`, `insertDiagnozyExamAttempt`, `saveGeneratedPracticalExam`, `saveGeneratedQuiz`, `insertLecture`, `deleteLectureById`, `updateLectureDuration`, `createTestimonial`, `updateTestimonial`, `markMessageAsRead`, `insertStudyLog`, `expireTestSession`, `deleteUserCustomTest`, `deleteUserCustomCategory`) — no consistent rule distinguishes which mutations get `cache()` and which don't. In every Server Action call site checked, each of these is only called once per request, so this hasn't produced an observed bug — but it's a real correctness footgun for any future code path that might call the same write twice in one render pass (e.g. a retry-on-transient-error pattern), and it's worth normalizing one way or the other rather than leaving it as an accident of which function a given contributor happened to copy-paste from.

**`updateTestimonial` sets `createdAt` instead of `updatedAt`** — a genuine, previously-undocumented bug (see the Testimonials table above for the full detail). `testimonials.updatedAt` exists in the schema and is never written by this function.

**`getFeaturedBlogPosts`/`getPopularBlogPosts` are the same query** with different default limits — not a bug today, but a duplication that will silently diverge if either is ever tuned independently.

**`getRelatedBlogPosts`'s own docstring overstates what it does** — "based on category and tags," but tags are never read.

**Resolved, distinct — not an overlap** (the flagged trio from round 8, read directly to confirm): `getUserStats(userId)` reads the three denormalized lifetime counters (`totalScore`/`totalQuestions`/`testsAttempted`) straight off the `users` row — an O(1) summary read for a profile widget. `getDetailedTestHistory(userId, limit=50)` returns one row per completed test (`completedTestes` ⋈ `testSessions`: score, category, duration, timestamp) for a history table/list UI. `getCategoryPerformance(userId)` aggregates that same join **by category** into per-category averages (`avgScore`, `totalTests`, `totalQuestions`) for a breakdown chart. Three different shapes for three different UI needs over overlapping source tables, not duplicated logic — unlike `buildAccessibleCategories`/`populateCategories` (README audit note #14), which really did reimplement the same algorithm twice.

**Error handling is inconsistent across the file**: the blog-query group (`getAllBlogPosts`, `getBlogPostBySlug`, etc.) wraps everything in try/catch and swallows DB errors into `[]`/`null`, so a real database failure there is indistinguishable from "nothing matched." Most other groups (tests, forum, notes, procedures) let a DB error propagate uncaught. Neither is wrong on its own, but the split isn't documented anywhere and isn't consistent within a domain either — worth knowing which behavior to expect when debugging an unexpectedly-empty result versus a thrown error.

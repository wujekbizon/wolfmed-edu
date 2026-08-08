# Database Queries Catalog (`src/server/queries.ts`)

[← Back to index](./README.md)

**Found undocumented in round 8 of doc-testing** — a reverse-direction check (picking a source file first and asking "is this actually catalogued anywhere," rather than starting from a doc claim) found that `src/server/queries.ts` is **2,601 lines with 136 exported functions**, the single largest file in the codebase by a wide margin, referenced by name dozens of times across nearly every other doc in this set (`getUserEnrolledCourses`, `getAllBlogPosts`, `getForumPostById`, …) — but never itself catalogued the way `src/actions/actions.ts` was in [`21-server-actions.md`](./21-server-actions.md). This is that catalog, grouped by domain the same way [`25-helpers.md`](./25-helpers.md) is.

This is the app's **read-side data-access layer** — Server Components and Server Actions call into it directly (it isn't itself `"use server"`; it's a plain module of Drizzle query functions). Write-side mutations mostly live in `src/actions/*.ts` ([`21-server-actions.md`](./21-server-actions.md)), though a handful of `queries.ts` functions do write (`createNote`, `saveChallengeCompletion`, `insertStudyLog`, etc. — noted per-group below) where the write is simple enough not to need its own Server Action, or is called from multiple actions.

## Tests & sessions
`getTestSessionDetails`, `expireTestSession`, `getAllTests`, `getTestsByCategory`, `countTestsByCategory`, `getCompletedTest`, `getCompletedTestsByUser`, `deleteCompletedTest`, `getUserTestLimit`, `getDetailedTestHistory`, `getQuestionById`, `getCategoryPerformance`, `getQuestionAccuracyAnalytics`, `getProgressTimeline`, `getTestActivitySince`, `getCategories`.

## Custom tests & categories (`/panel/dodaj-test`)
`getUserCustomTests`, `getUserCustomTestById`, `getUserCustomTestsByIds`, `deleteUserCustomTest`, `getUserCustomCategories`, `getUserCustomCategoryById`, `getUserCustomCategoryByName`, `deleteUserCustomCategory`.

## Procedures & challenges
`getAllProcedures`, `getProcedureById`, `getProcedureBySlug`, `getProceduresCount`, `getProcedureOptions`, `saveChallengeCompletion` (write — used inside `submitOrderStepsAction`'s transaction, see [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 5), `checkAllChallengesComplete`, `awardBadge` (write), `getChallengeCompletion`, `getChallengeCompletionsByProcedure`, `getProcedureBadge`, `getUserBadges`, `getChallengeActivitySince`.

## Diagnozy
`getAllDiagnozy`, `getDiagnozaBySlug`, `getDiagnozaFormulations`, `getDiagnozyForExam`, `getDiagnozyTitlesBySlugs`, `insertDiagnozaCompletion` (write), `getUserDiagnozyCompletions`, `insertDiagnozyExamAttempt` (write), `getUserDiagnozyExamAttempts`.

## Practical exams & generated quizzes
`getGeneratedPracticalExamById`, `saveGeneratedPracticalExam` (write), `getGeneratedQuizById`, `getLatestGeneratedQuiz`, `saveGeneratedQuiz` (write).

## Blog
`getAllBlogPosts`, `getBlogPostById`, `getBlogPostBySlug`, `getBlogPostsByCategorySlug`, `getBlogPostsByTagSlug`, `getFeaturedBlogPosts`, `getPopularBlogPosts`, `getRelatedBlogPosts`, `searchBlogPosts`, `getBlogStatistics`, `getBlogCategories`, `getBlogCategoryById`, `getBlogCategoryBySlug`, `getBlogTags`, `getBlogTagById`, `getBlogTagBySlug`, `hasUserLikedPost`.

## Forum
`getAllForumPosts`, `getForumPostById`, `getPostById`, `getRecentForumPosts`, `createForumPost` (write), `deleteForumPost` (write), `createForumComment` (write), `deleteForumComment` (write), `getForumStats`, `getForumNotifications`, `getLastUserForumPost`, `getLastUserForumComment`, `getLastUserPostTime`, `getLastUserCommentTime`.

## Notes
`getAllUserNotes`, `getNoteById`, `createNote` (write), `updateNote` (write), `deleteNote` (write), `getTopPinnedNotes`, `getNoteActivitySince`.

## Materials
`getMaterialById`, `getMaterialsByUser`, `deleteMaterial` (write), `getUserStorageUsage` (backs the storage-quota checks throughout [`32-flows-learning-content.md`](./32-flows-learning-content.md)).

## Flashcards
`getFlashcardDeckById`, `getFlashcardDeckByNoteId`, `getFlashcardDecksByUser`.

## Lectures
`insertLecture` (write), `getLecturesByUser`, `getLectureByHash` (the dedup lookup behind `generateLectureAction`, see [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md) → Flow D), `deleteLectureById` (write), `updateLectureDuration` (write).

## Board cells
`getUserCellsList`, `createUserCellsList` (write), `updateUserCellsList` (write), `checkUserCellsList`.

## Courses & enrollment
`getAllCourses`, `getCourseBySlug`, `getUserEnrolledCourses`, `getUserEnrollments`.

## Learning planner
`getActivePlan`, `getActivePlanWithConcepts`, `getPlanById`, `getConceptById`, `getStudyLogsSince`, `insertStudyLog` (write — shared by the test-taking, practical-exam, and planner flows wherever study time needs logging).

## User profile & stats
`getUserMotto`, `updateMottoByUserId` (write), `getUserUsername`, `updateUsernameByUserId` (write), `getUserStats`, `getUserIdByCustomer`, `getUserIdByCustomerEmail` (Stripe-customer-id → app-user lookups, used by the payment flow — see [`30-flows-auth-payments.md`](./30-flows-auth-payments.md)).

## Testimonials & supporters
`getTestimonials`, `getTestimonialsWithUsernames` (used by the home page, see [`10-pages-public.md`](./10-pages-public.md)), `getUserTestimonials`, `createTestimonial` (write), `updateTestimonial` (write), `deleteTestimonial` (write), `getEarlySupporters`, `getSupportersUserIds`, `getSupportersWithUsernames`, `getStripeSupportPayments`.

## Admin / messages
`getAllMessages`, `getMessageStats`, `getUnreadMessageCount`, `markMessageAsRead` (write).

---

**Not fully audited function-by-function** — this catalog names and groups every export so the file is searchable and Golden-Rule-#3-checkable, matching the depth of [`25-helpers.md`](./25-helpers.md). A handful of names (`getUserStats`, `getDetailedTestHistory`, `getCategoryPerformance`) look like they may overlap in what they compute — worth a closer look in a future round the same way `buildAccessibleCategories`/`populateCategories` turned out to (see README audit note #14), but not confirmed one way or the other here.

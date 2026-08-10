# Server Actions Catalog

[← Back to index](./README.md)

All 27 files in `src/actions/` — 6,102 lines, 100 exported functions. Every entry below is read directly from source: real signature, return shape, auth/rate-limit/validation gates in the order they actually run, and any transaction or side-effect behavior worth knowing before assuming the name describes it.

Cross-reference: [`20-forms-catalog.md`](./20-forms-catalog.md) for which client form drives which action, [`01-database-schema.md`](./01-database-schema.md) for tables written, [`28-queries.md`](./28-queries.md) for the read-side layer these call into.

**Two files in this directory are not Server Actions.** `fetchQuestionDetails.ts` and `fetchProblematicQuestionDetails.ts` have **no `'use server'` directive** (the other 25 files all do) — they're plain async server-side helper functions that happen to live in `actions/`. Both are only ever imported by async Server Components (`TestResultCard.tsx`, `UserAnalytics.tsx`), so nothing is broken, but they are not callable from a client component the way everything else here is. See Findings.

---

## The standard action shape

Most form-bound actions in this codebase run the same gates in the same order:

1. `const { userId } = await auth()` → `throw new Error('Unauthorized')` if absent (a **throw**, not a `FormState` — this surfaces as an error boundary, not a field error).
2. Rate limit: `checkRateLimit(userId, bucket)` (or the `rateLimitFormState(userId, bucket)` helper, which returns a ready-made `FormState` or `null`) → early-return a `FormState` with a "try again in N minutes" message.
3. Zod `safeParse` against a schema from `src/server/schema.ts` → `fromErrorToFormState(error)` on failure.
4. Ownership/access re-check where relevant (`findOwnedDeck`, `checkCourseAccessAction`, `getNoteById`, …).
5. The mutation, usually inside `try/catch` returning `fromErrorToFormState(error)`.
6. `revalidatePath(...)` then `toFormState('SUCCESS', message)`.

Deviations from this order (premium checks before rate limits, validation before auth, etc.) are noted per-action below where they exist.

---

## `actions.ts` (1,447 lines) — tests, forum, custom categories, testimonials

The largest and oldest action file. See [`11-pages-panel-core.md`](./11-pages-panel-core.md) and [`31-flows-testing.md`](./31-flows-testing.md) for the full test-session lifecycle walkthrough.

| Function | Line | Behavior |
|---|---|---|
| `startTestAction` | `:73` | Rate-limited (`test:start`), `StartTestSchema`. **Transactional with a row lock**: `SELECT ... FOR UPDATE` on the user row first, then (a) bulk-expires the user's own stale `ACTIVE` sessions (past `expiresAt` **or** no heartbeat in 5 min), (b) rejects if a genuinely-live session still exists ("finish it before starting a new one"), (c) inserts the new `testSessions` row. The lock is what makes the check-then-insert safe against two tabs starting a test simultaneously. Returns `sessionId`/`expiresAt`/`durationMinutes`/`numberOfQuestions` **as extra top-level fields on the FormState**, not inside `values` — an unusual shape worth knowing when reading the client side. A malformed `meta` JSON is warned-and-ignored (`{}`), not an error. |
| `submitTestAction` | `:196` | Rate-limited (`test:submit`). Collects every `answer*` field off the FormData, validates with `CreateAnswersSchema(allowedLengths)` — a **schema factory**, since the valid array length depends on whether this was a 10/20/40-question session. Grades server-side (`countTestScore`), then in one transaction: re-fetches the session with a raw `SELECT ... FOR UPDATE` scoped to `(id, userId, status='ACTIVE')`, **re-checks `expiresAt` server-side** (a client racing past its own timer gets the session marked `EXPIRED` and the submission rejected), updates the `users` aggregate counters via SQL `+` expressions, inserts `completedTestes`, and marks the session `COMPLETED` — all atomic. Afterwards, off the response path: `after(() => onQuizCompleted(...))` recomputes the student's memory facts (fail-safe internally, never blocks or fails the submission). Note it throws a named `AuthError` rather than a plain error when unauthenticated. |
| `sendEmail` | `:325` | Contact form. **Rate-limited on the submitted email address, not a userId** (`email:send`, 3/hr) — this is the one action reachable without auth, so the email doubles as the rate-limit identity; falls back to the literal `"anonymous"` bucket if no email was supplied, meaning all anonymous submissions share one bucket. Writes `customersMessages`. |
| `deleteTestAction` | `:368` | Deletes a `tests` row (admin/content-management). |
| `updateUsername` / `updateMotto` | `:411` / `:455` | Profile field updates on `users`. |
| `createForumPostAction` | `:496` | Rate-limited (`forum:post:create`), `CreatePostSchema`. Derives `authorRole` server-side from `sessionClaims.metadata.role` (a client can't claim to be an admin). Looks up the username inside a transaction, then calls `createForumPost`. **`readonly` is accepted from the form with no role check** — see README audit note #11: any user can disable comments on their own post at creation, and nothing can re-enable it afterwards. |
| `deletePostAction` | `:574` | Rate-limited (`forum:post:delete`), validates `postId`, then calls `deleteForumPost(postId, userId)`. The query atomically scopes deletion to both the post id and authenticated owner id; no client-submitted author id is accepted. A missing or unowned post returns the same error. |
| `createCommentAction` | `:610` | Rate-limited (`forum:comment:create`), validates content, re-fetches the post to enforce its `readonly` flag server-side. |
| `deleteCommentAction` | `:686` | Rate-limited (`forum:comment:delete`), validates `commentId`, then calls `deleteForumComment(commentId, userId)`. The atomic query permits the comment author or owning post's author, matching the UI, and accepts no client-submitted ownership claim. |
| `createTestimonialAction` | `:718` | Rate-limited (`testimonial:create`, 2/hr), inserts `testimonials`. |
| `createTestAction` | `:801` | Manual single-question custom test creation. Validates the chosen `linkedCategory` against `getAccessibleCategories()` server-side (can't file a question under a course you don't own), and enforces **exactly one correct answer**. ⚠️ Returns a non-empty top-level message *and* `fieldErrors` at `:848–850` — the anti-pattern root `CLAUDE.md` explicitly names (the message repeats under every field). |
| `uploadTestsFromFile` | `:889` | **Admin-only**, despite living on the premium-gated `/panel/dodaj-test` page — re-checks `sessionClaims.metadata.role === 'admin'` server-side, and `CreateTab.tsx` only renders the form behind `{isAdmin && ...}`. Also requires ≥1 course enrollment, rate-limited (`file:upload`, 10/hr), 5 MB file cap, streamed and parsed against `TestFileSchema`. |
| `saveAIGeneratedTestsAction` | `:1004` | Persists the questions previewed by `generateAITestsAction` (`aiTests.ts`) and links them to a custom category. |
| `expireSessionAction` | `:1095` | Plain function call (takes a `sessionId` string, not a form) — marks a session `EXPIRED` via `expireTestSession`. **Deliberately returns `SUCCESS` even on failure** (the catch block returns the same success shape), since this is a best-effort beacon target from `useBeaconCleanup`/`useSessionHeartbeat` and a failure has nothing useful to report to a page that's already unloading. See README audit note #16 for the wider session-expiry issue those hooks cause. |
| `deleteUserCustomTestAction` / `deleteUserCustomTestsByCategoryAction` | `:1118` / `:1167` | Ownership-scoped deletes on `userCustomTests`. |
| `createCustomCategoryAction` | `:1220` | `userCustomCategories` insert. |
| `addQuestionToCategoryAction` / `removeQuestionFromCategoryAction` | `:1260` / `:1315` | Mutate a category's `questionIds` array. |
| `deleteCustomCategoryAction` | `:1367` | Ownership-scoped delete. |
| `updateCategoryNameAction` | `:1405` | Rename, ownership-scoped. |

## `rag-actions.ts` (697 lines) — the AI tutor's main entry point

| Function | Line | Behavior |
|---|---|---|
| `askRagQuestion` | `:142` | **The tutor chat entry point** and the single most orchestration-heavy action in the codebase. Gate order: creates an SSE progress job **first** (`createJob(jobId)`, before auth) so the client's stream has something to attach to, then auth → premium (`checkPremiumAccessAction`) → rate limit (`rag:query`) → `RagQuerySchema`. Every failure path calls `errorJob(jobId, ...)` so the SSE stream is closed rather than left hanging. Then: `parseMcpCommands()` splits the question into a clean query, `@resource` attachments, and any `/command`; `retrieveContext()` (the single retrieval entry point per root `CLAUDE.md`'s retrieval rules) gathers grounded context; `requiresSource` commands abort with a message rather than letting the model invent content; the **"no source, no output" gate** (`!context.hasCanonical && context.chunks.length === 0` → `getNoDataFoundMessage()`) is the load-bearing anti-hallucination check; tool calls dispatch through `executeToolLocally`. Progress is emitted at each stage (`progressStep`) to `/api/rag/progress` — see [`14-api-routes.md`](./14-api-routes.md) and [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md) for the full trace. |
| `generateLectureAction` | `:537` | Generates an AI audio lecture (script + TTS). Dedupes via `getLectureByHash` on a content hash before spending a model call, then delegates the DB write + upload to `saveLectureInternal` (`lectures.ts`). |

## `blog.ts` (597 lines) — blog CRUD + likes

Every admin-facing action here independently re-checks `sessionClaims.metadata.role === 'admin'` (defense-in-depth over the `admin/layout.tsx` gate).

| Function | Line | Behavior |
|---|---|---|
| `createBlogPostAction` / `updateBlogPostAction` | `:21` / `:114` | Admin-gated, `CreateBlogPostSchema`/`UpdateBlogPostSchema`, manages the `blogPostTags` join rows alongside the post. |
| `deleteBlogPostAction` | `:225` | Admin-gated form action. |
| `deleteBlogPost` | `:571` | A second delete path taking a plain `{id}` object instead of FormData — same effect, different call shape (for non-form callers). |
| `publishBlogPostAction` / `archiveBlogPostAction` | `:259` / `:303` | Status transitions (`draft → published → archived`), admin-gated. |
| `incrementViewCountAction` | `:336` | `(postId) => Promise<void>` — fire-and-forget, no `FormState`, no auth check (view counts are public and non-sensitive). |
| `likeBlogPostAction` / `unlikeBlogPostAction` | `:353` / `:412` | The **older explicit pair**, superseded by the toggle below but still exported. |
| `toggleBlogLikeAction` | `:457` | **The current like flow.** Auth + rate limit (`blog:like`) + `LikeBlogPostSchema`, then check-then-insert-or-delete, returning the fresh `{liked, count}` in `values`. The check-then-act is theoretically racy, but `blogLikes` has a composite PK on `(userId, postId)`, so a true double-insert race fails the constraint rather than double-counting — worst case is one transient error toast. See [`10-pages-public.md`](./10-pages-public.md) → Blog likes. |
| `getBlogLikeState` | `:537` | `(postId) => {liked, count}` — read-only, hydrates `BlogLikeButton` client-side because the blog detail page is user-agnostic/cacheable. |

## `planner.ts` (433 lines) — learning planner

All rate-limited on `planner:update` (or `planner:log`), all ownership-checked. `archivePlanAction`/`completePlanAction` are thin wrappers over a shared module-private `setPlanStatus(userId, formData, status, message)` helper.

| Function | Line | Behavior |
|---|---|---|
| `createPlanAction` | `:41` | `CreatePlanSchema`, writes `learningPlans` + its `learningPlanConcepts` rows. |
| `updatePlanAction` | `:124` | `UpdatePlanSchema`. |
| `archivePlanAction` / `completePlanAction` | `:208` / `:223` | Status transitions via `setPlanStatus`. |
| `toggleConceptAction` | `:243` | **Ownership checked twice, deliberately**: re-fetches the concept and compares `concept.userId !== userId` *before* the update, and scopes the `UPDATE ... WHERE` on both `id` and `userId` — the pattern `deletePostAction` above is missing. Toggles `completedAt` between a timestamp and `null`. |
| `addConceptAction` / `removeConceptAction` | `:289` / `:345` | Mutate a plan's concept list, ownership-scoped. |
| `logStudySessionAction` | `:386` | `LogStudySchema`, writes a `studyLogs` row (the shared ledger — see `insertStudyLog` in [`28-queries.md`](./28-queries.md)). |

## `blogCategories.ts` (290 lines) — blog categories & tags

`createBlogCategoryAction` (`:19`), `updateBlogCategoryAction` (`:71`), `deleteBlogCategoryAction` (`:135`), `createBlogTagAction` (`:168`), `updateBlogTagAction` (`:208`), `deleteBlogTagAction` (`:259`). Each independently calls `auth()` and checks `sessionClaims.metadata.role === 'admin'` — same defense-in-depth pattern as `blog.ts` and `admin-rag-actions.ts`.

## `admin-rag-actions.ts` (256 lines) — RAG corpus management

Every function starts with `await ensureAdmin()` (which **throws** rather than redirecting — the Server Action variant, see [`25-helpers.md`](./25-helpers.md)). See [`13-pages-admin.md`](./13-pages-admin.md) → `/admin/rag`.

| Function | Behavior |
|---|---|
| `createFileSearchStoreAction` | Bootstraps a Vertex corpus, records `ragConfig`. |
| `uploadFilesAction` | Validates extensions (`.md`/`.txt`/`.pdf`) up front and rejects the whole batch naming the offending files, then calls `uploadFiles()`, which uploads **sequentially** and tracks per-file success/failure. ⚠️ The action reports only **counts** back to the admin (`"Przesłano N dokumentów. Błędy: M"`) — `uploadFiles()` returns the actual failed filenames in `results.failed`, but they're discarded before reaching the UI, so an admin whose 5-file batch partly failed can't tell which files to retry. |
| `getStoreStatusAction` | Read-only status probe; returns `{isConfigured: false}` rather than an error when no corpus is configured yet. |
| `listStoreDocumentsAction` | Lists ingested documents. |
| `testRagQueryAction` | Runs a probe through the **real production path** (`retrieveContext` + `generateGroundedAnswer`) in `canonical_only` mode, so a green result means the tutor works and isn't contaminated by the admin's own notes. Deliberately reads the store from `ragConfig` rather than the submitted `storeName` field. |
| `deleteFileSearchStoreAction` | Tears down the entire corpus + config — the **only** deletion path, with no single-document removal (README audit note #12). |

## `generatedQuizzes.ts` (217 lines) — AI procedure quizzes

| Function | Behavior |
|---|---|
| `generateProcedureQuizAction` | **Premium is checked per-course, not globally**: fetches the procedure, then `checkCourseAccessAction(procedure.course)` and `hasAccessToTier(tier, 'premium')` — holding premium on one course must not unlock AI quizzes for a procedure belonging to a different course held at a lower tier (the inline comment states this explicitly). Rate-limited (`quiz:generate`). Grounding comes from the **procedure's own algorithm steps inlined into the prompt, not RAG** — procedures aren't in the corpus. Model output is JSON-parsed and validated against a per-challenge-type schema (`QUIZ_SCHEMAS` map) before being persisted; the client receives an **answer-stripped** view (`stripQuizAnswers`) so correct answers never reach the browser. |
| `submitGeneratedQuizAction` | Rate-limited (`challenge:submit`), re-fetches the stored quiz **with its answers server-side** and grades there (`gradeGeneratedQuiz`) — the client only ever submits picks. Then in one transaction: `saveChallengeCompletion` → `checkAllChallengesComplete` → `awardBadge` if all types are done, exactly mirroring `submitOrderStepsAction`. |

## `challenges.ts` (184 lines) — procedure challenges

| Function | Behavior |
|---|---|
| `getChallengeProgressAction` | `(procedureId, procedureName) => ActionResult<ProcedureProgress>` — read-only, returns a plain result object (not `FormState`). Reshapes completions into a map keyed by challenge type for `ChallengesHub`. |
| `submitOrderStepsAction` | Rate-limited (`challenge:submit`), `SubmitOrderStepsSchema`. **Server-side scoring**: re-loads the procedure from the DB and compares the submitted order against `procedure.data.algorithm` position by position — the client's drag-and-drop UI never computes or reports a score. Then one transaction: `saveChallengeCompletion` (never downgrades a previous best — see [`28-queries.md`](./28-queries.md)) → `checkAllChallengesComplete` → `awardBadge`, so a badge can't be awarded without its triggering completion being recorded. |

## `diagnozy.ts` (184 lines) — diagnozy fill-in & exam

All four gate on `hasDiagnozyAccess()` and return **discriminated-union result objects** (`{status: 'SUCCESS', data} | {status: 'ERROR', message}`), not `FormState` — these are called directly from hooks (`useDiagnozyExam`, `useWypelnijForm`), not bound to `<form action>`.

| Function | Behavior |
|---|---|
| `getDiagnozaFillDataAction` | On-demand option lists once a student picks a formulation — deliberately not preloaded for every record. |
| `markDiagnozaCompletedAction` | Rate-limited (`diagnozy:complete`), writes `diagnozyProgress` (idempotent via `onConflictDoNothing`). |
| `startDiagnozyExamAction` | Draws a random case server-side and builds option pools via `buildDiagnozyExam` — **the payload carries no correctness flags**, so the client cannot infer answers from the data's shape. |
| `submitDiagnozyExamAction` | Rate-limited (`diagnozy:exam:submit`), re-fetches the real case by slug (never trusts client-supplied answers), grades via `gradeDiagnozyExam`, writes `diagnozyExamAttempts`. |

## `praktyczny.ts` (149 lines) — practical exams

| Function | Behavior |
|---|---|
| `gradePracticalExamAction` | Uses a **custom `PracticalExamState`** shape (`{status, message, timestamp, result}`), not `FormState`. Course-gated (`opiekun-medyczny`) + rate-limited (`egzamin:grade`). Resolves the exam **static-first, then generated** as a fallback, so a static exam sharing an id would always win. Grades entirely server-side (`gradePracticalExam`). Logs study time to the shared ledger, **clamped to `[1, 120]` minutes** — the official MED.14 practical allows 120 min, and the clamp guards against a runaway timer from an abandoned tab. A study-log failure is caught and logged without failing the grading. |
| `generatePracticalExamAction` | Course-gated **and** premium-gated, rate-limited (`egzamin:generate`, 5/day). Model output is JSON-parsed and re-validated against `GeneratedPracticalExamSchema` before persisting; assigns a fresh `crypto.randomUUID()` and defaults `year` to the current year. |

## `materials.ts` (194 lines) — uploaded study materials

| Function | Behavior |
|---|---|
| `uploadMaterialAction` | The **record-creation half** of the upload (file bytes go through UploadThing's own route first). Rate-limited (`material:upload`, 5/hr), `MaterialsSchema`. Inside one transaction: lazily creates the `userLimits` row if absent, **enforces the storage quota transactionally** (`currentUsage + size > currentLimit` → throw), inserts the `materials` row, and bumps `storageUsed` atomically via a SQL `+` expression. If the transaction throws, the `catch` calls `utapi.deleteFiles([key])` so a rejected upload doesn't leave an orphaned file consuming real storage. Non-premium uploads are marked `indexStatus: UNINDEXED_STATUS` at insert (storage ships with the course; premium buys the *model call* that reads the file). Extraction runs `after()` the response, with the `library-index` cron as a backstop. |
| `deleteMaterialAction` | Verifies ownership by fetching the row first, then one transaction: deletes the `materials` row **and refunds the quota** (`GREATEST(0, storageUsed - size)`, floored so a double-delete race can't go negative). Afterwards removes `libChunks` (`removeMaterialChunks`) and best-effort deletes the UploadThing file — a storage-provider failure is logged but doesn't fail the action, since the DB is already consistent. |

## `lectures.ts` (118 lines) — AI audio lectures

| Function | Behavior |
|---|---|
| `saveLectureInternal` | **Not a form action** — a plain internal helper called by `rag-actions.ts`'s `generateLectureAction`. Checks the storage quota **before** uploading anything, uploads the MP3 to UploadThing, then in one transaction lazily creates `userLimits` and adds `audioSize` to `storageUsed` before inserting the lecture row. If the transaction fails, it deletes the just-uploaded file — the same orphan-cleanup discipline as `uploadMaterialAction`. |
| `deleteLectureAction` | `(lectureId) => FormState`. Rate-limited (`lecture:delete`), ownership-scoped delete, then deletes the UploadThing file. ⚠️ **Never refunds the storage quota** — unlike `deleteMaterialAction`, there's no `userLimits` update. It also *cannot*: the `lectures` table has no `size` column, so the byte count added at creation is never persisted anywhere. See Findings. |
| `updateLectureDurationAction` | `(lectureId, duration) => Promise<void>` — fire-and-forget (empty `catch`), no `FormState`. Duration is only knowable once the client's `<audio>` element loads metadata, so it's patched in after creation. |

## `flashcardDecks.ts` (206 lines) / `flashcards.ts` (114 lines) / `flashcardFetch.ts` (34 lines)

All ownership checks go through `findOwnedDeck`/`findOwnedCard` (`src/server/flashcardAccess.ts`), and all use the `rateLimitFormState` helper rather than inline rate-limit boilerplate.

| Function | File | Behavior |
|---|---|---|
| `createGeneratedDeckAction` | `flashcardDecks.ts` | `(name, cards) => {success, deckId?, error?}` — a plain object, not `FormState`, because it's called from a hook (`useInsertGeneratedCell`) rather than a form. One transaction inserts the deck then all its cards with sequential `position` values. |
| `createEmptyDeckAction` | `flashcardDecks.ts` | Manual empty deck; returns the new `deckId` in `values`. Uses the **correct** field-error pattern (empty top-level message + `fieldErrors`). |
| `createNoteFlashcardAction` | `flashcardDecks.ts` | Re-validates the source note exists, then `resolveNoteDeckId()` (module-private): inserts a deck with `.onConflictDoNothing()` against the `(userId, sourceRef)` unique constraint and re-selects if the insert lost a race — so **a note can only ever have one deck**, created lazily on its first flashcard. |
| `renameFlashcardDeckAction` / `deleteFlashcardDeckAction` | `flashcardDecks.ts` | Ownership-checked via `findOwnedDeck`. |
| `createFlashcardAction` / `updateFlashcardAction` / `deleteFlashcardAction` | `flashcards.ts` | Individual card CRUD; each re-checks ownership via `findOwnedDeck`/`findOwnedCard` before touching a row. New cards get `position: await nextCardPosition(deckId)`. |
| `fetchFlashcardDecksAction` / `fetchFlashcardDeckAction` / `fetchNoteFlashcardDeckAction` | `flashcardFetch.ts` | Read-only, return `[]`/`null` for unauthenticated callers rather than throwing — they back React Query hooks that shouldn't error-boundary on a signed-out flash. |

## `notes.ts` (201 lines)

`createNoteAction` (`:19`) and `updateNoteContentAction` (`:137`) are declared as `export const … = async (…)`; `deleteNoteAction` (`:97`) uses `export async function` — a stylistic inconsistency inside one file (README audit notes).

| Function | Behavior |
|---|---|
| `createNoteAction` | Rate-limited (`note:create`), `NoteSchema`, then `parseLexicalContent()` validates the editor JSON before insert. **The premium/indexing split**: chunk rows are written synchronously (pure Postgres, transactional with the note) only if `getIsPremium()`; embedding those chunks is a model call, so it runs `after()` the response. A basic plan writes **no chunk rows at all**, which is what keeps `embedding IS NULL` meaning "queued" and nothing else. |
| `updateNoteContentAction` | Same pattern, plus it's **the upgrade path**: a note written on a basic plan gets its chunks the first time it's edited on a premium one. |
| `deleteNoteAction` | Rate-limited (`note:delete`). Deletes the note, removes its `libChunks`, then **manually deletes any flashcard deck referencing it** — the inline comment explains why: note decks reference the note by id **without a foreign key**, so nothing cascades. |

## `cells.ts` (80 lines) — board cells

| Function | Behavior |
|---|---|
| `saveCellsAction` | Rate-limited (`cells:update`), `UserCellsListSchema` over JSON-parsed `order`/`cells`. Then insert-or-update depending on `checkUserCellsList`. **Full unconditional overwrite** with no version check — README audit note #17. ⚠️ The `db.transaction()` wrapper here is **inert**: the three functions called inside it (`checkUserCellsList`, `updateUserCellsList`, `createUserCellsList`) each use the module-level `db` handle, not the `tx` passed into the callback, so none of them join the transaction. Harmless today (the body is one logical write), but it reads as atomic when it isn't — contrast `submitOrderStepsAction`, which correctly threads `tx` into every call. |
| `syncCellsAction` | `() => {success, data?, error?}` — no form args. **Not a merge or reconciliation** despite the name: a plain read (`getUserCellsList`) wired to a manual `SyncCellsButton`. Nothing calls it automatically. |

## `course-actions.ts` (134 lines) — enrollment & access

| Function | Behavior |
|---|---|
| `checkCourseAccessAction` | `(courseSlug) => {hasAccess, accessTier}`. **DB-authoritative only.** Its docstring explains a deliberate past change: an earlier `currentUser()` Clerk-metadata fast-path was removed because this runs once per category on the learning hub (fanned out via `Promise.all`) and tripped Clerk's dev rate limit (429) — the DB query was already authoritative, so the pre-check added load without changing the answer. Swallows errors to `{hasAccess: false}` (fail-closed). |
| `getUserEnrollmentsAction` | `() => {enrollments}`, `[]` for signed-out or on error. |
| `checkPremiumAccessAction` | `() => boolean`. Checks **both** courses in parallel and returns true if either is held at premium or above. ⚠️ Its docstring still claims it "uses the same two-layer check… Clerk metadata for fast-path ownership, DB for authoritative tier" — **stale**, describing the metadata fast-path that `checkCourseAccessAction` documents having removed. The code is correct; the comment describes an architecture that no longer exists. |
| `enrollUserAction` | `(userId, courseSlug, accessTier='basic')`. **Update-if-exists, insert otherwise** — which is why a duplicated Stripe webhook can't create a duplicate enrollment (relevant to README audit note #13). Called by the Stripe webhook, not by a form. |

## `mindmap.ts` (72 lines)

`generateMindMapAction` — premium-gated **before** validation, then `GenerateMindMapSchema`, then rate-limited (`mindmap:generate`). Generates via `generateTree()` (which calls `retrieveContext` internally — grounded, not raw model knowledge), then **re-validates the model's tree against `MindMapNodeSchema` even after the generation library normalized it** ("never trust model output even after normalization"). Collapses below `INITIAL_EXPANDED_DEPTH = 1` so a fresh map opens showing only the root and its first ring. **Persists nothing** — returns the tree JSON in `values.content`; the cell stores it in the `userCellsList` blob. ⚠️ Its validation-failure branch pairs `toFormState("ERROR", "Popraw błędy w formularzu.")` with `fieldErrors` — the *exact* anti-pattern root `CLAUDE.md` names by that exact string.

## `aiTests.ts` (120 lines)

`generateAITestsAction` — premium-gated, `GenerateAITestsSchema`, then validates `linkedCategory` against `getAccessibleCategories()` server-side, then rate-limited (`quiz:generate`). Retrieves grounding in **`canonical_only` mode** with an explicit rationale: a generated test is study material, and questions built partly on a student's own note could carry their misunderstanding into an answer key. **Falls back to the raw topic** if retrieval throws, so the feature degrades rather than failing. Model output is reshaped and re-validated against `TestFileSchema`. Preview only — persistence is `saveAIGeneratedTestsAction` in `actions.ts`. Uses the **correct** field-error pattern.

## `memory-actions.ts` (70 lines) — tutor preferences

`updatePreferencesAction` — rate-limited (`profile:update:preferences`), validates each submitted value against the allowed `options` in `PREFERENCE_DEFS` (not a Zod schema — an allow-list walk, since the shape is a flat key-value map), so "the store never holds junk". Skips empty fields rather than clearing them. `getUserPreferencesAction` — `() => Record<string,string>`, **fail-safe**: returns `{}` on any error including memory tables not being migrated yet.

## `forum-notifications.ts` (52 lines)

`markForumSeenAction(scope)` — takes a plain `ForumSeenScope` argument, rate-limited (`forum:seen`, 120/hr) with an **empty error message** on limit (a silently-dropped badge clear isn't worth a toast). Upserts `forumReadState`. The subtle part: on the **first** insert it explicitly writes `FORUM_NOTIFICATIONS_EPOCH` into the *other* scope's column, because letting that column default to `now()` would silently clear a badge the user hasn't actually looked at yet.

## `pptx.ts` (71 lines)

`importPptxAction(formData) => ImportPptxResult` — **admin-only** (`sessionClaims.metadata.role`), `.pptx` MIME/extension check, 20 MB cap. Parses via `parsePptx()` and returns `{title, slug, excerpt, content}` for the caller to pre-fill a blog-post form. **Writes nothing** — see [`20-forms-catalog.md`](./20-forms-catalog.md); the persistence happens later via `createBlogPostAction`.

## `stripe.ts` (66 lines)

`createCheckoutSession` — redirects unauthenticated users to `/sign-in?redirect_url=…` back to the course page. Creates a Stripe Checkout session (`mode: 'payment'`, Polish locale, tax-ID collection) with `client_reference_id: userId` and `courseSlug`/`accessTier` in `metadata` for the webhook. ⚠️ **No idempotency key** on `stripe.checkout.sessions.create()` — unlike `getOrCreateStripeCustomer` one line above, which has one (README audit note #13). The `redirect()` is deliberately called **outside** the try/catch, since Next.js implements redirects by throwing.

## `messages.ts` (30 lines)

`markMessageAsReadAction` — `ensureAdmin()`, coerces `messageId` to a `Number` and rejects `NaN` (this table uses a serial integer PK, unlike the UUIDs everywhere else).

## `fetchQuestionDetails.ts` (37 lines) / `fetchProblematicQuestionDetails.ts` (49 lines)

**Not Server Actions** — no `'use server'` (see the note at the top). Both are batch-hydration helpers with the same shape: take a list of question refs, dedupe the ids into a `Set`, fetch every matching `tests` row in **one** `inArray` query, and build a `Map` for O(1) joining back to the input. `fetchQuestionDetails`'s own comment notes this replaced a version doing 12,984 individual queries. `fetchProblematicQuestionDetails` additionally derives `errorRate: 100 - accuracy` and pulls the correct answer's text for display.

---

## Findings from this pass

**1. Resolved: forum deletes now enforce ownership in the database.** `deletePostAction` and `deleteCommentAction` no longer accept client-submitted `authorId`. Their query functions are uncached mutations with atomic authorization predicates: posts require `(id, authorId) = (postId, userId)`; comments require the authenticated user to own either the comment or its parent post. Both return whether a row was deleted, allowing the actions to reject missing and unauthorized records identically.

**2. Deleting an AI lecture never refunds its storage quota, and cannot.** `saveLectureInternal` adds the MP3's byte size to `userLimits.storageUsed`, but `deleteLectureAction` deletes the row and the file without touching `userLimits`. The `lectures` table has **no `size` column**, so the byte count is never persisted — the refund is impossible to compute after the fact without re-querying UploadThing. Every generated-then-deleted lecture permanently consumes part of the user's 20 MB quota. Contrast `materials`, which stores `size` and refunds correctly via `GREATEST(0, storageUsed - size)`. Fix needs a schema change (add `size`) plus the refund in the delete path.

**3. Two actions violate the field-error anti-pattern root `CLAUDE.md` names explicitly.** `generateMindMapAction` (`mindmap.ts:38`) pairs `toFormState("ERROR", "Popraw błędy w formularzu.")` with `fieldErrors` — that is verbatim the example `CLAUDE.md` gives as the thing never to do, because `FieldError` renders `state.message` under *every* field, so the generic text repeats on each one. `createTestAction` (`actions.ts:848`) does the same with a different message. `aiTests.ts` and `flashcardDecks.ts` show the correct form (empty top-level message + `fieldErrors`).

**4. `saveCellsAction`'s transaction is inert.** The `db.transaction(async (tx) => {...})` callback never uses `tx` — the three query functions inside all use the module-level `db` handle, so nothing actually runs in the transaction. Harmless today (one logical write), but it reads as atomic when it isn't. `submitOrderStepsAction`/`submitGeneratedQuizAction` show the correct pattern of threading `tx` through.

**5. `checkPremiumAccessAction`'s docstring describes an architecture that was deliberately removed.** It claims a "two-layer check… Clerk metadata for fast-path ownership" — but `checkCourseAccessAction`, which it calls, documents having removed exactly that fast-path to stop tripping Clerk's rate limit. The code is right; the comment would mislead anyone reasoning about where access decisions come from.

**6. `uploadFilesAction` discards which files failed.** `uploadFiles()` returns `results.failed: string[]`; the action reports only `results.failed.length`. An admin whose batch partly failed sees a count and has no way to tell which files to retry. (Carried over from round 14's F-26, confirmed here in the action itself.)

**7. Two files in `src/actions/` are not Server Actions** — `fetchQuestionDetails.ts` and `fetchProblematicQuestionDetails.ts` lack `'use server'`. Currently safe (only imported by Server Components), but a future contributor importing either into a client component would get a confusing build/runtime failure, since everything else in this directory *is* callable that way.

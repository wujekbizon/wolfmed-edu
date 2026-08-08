# Server Actions Catalog

[← Back to index](./README.md)

All files in `src/actions/`, `"use server"`. Every action validates with a Zod schema from `src/server/schema.ts` unless noted otherwise (a handful of read-only/internal actions skip validation because they take no user-supplied shape, e.g. `getStoreStatusAction`). Cross-reference: [`20-forms-catalog.md`](./20-forms-catalog.md) for which client form drives which of these, [`01-database-schema.md`](./01-database-schema.md) for the tables written.

---

## `actions.ts` (1447 lines) — tests, forum, custom categories, testimonials

The largest, oldest action file — core test-taking + forum + custom-test-authoring logic. See [`11-pages-panel-core.md`](./11-pages-panel-core.md) for the full test-session lifecycle walkthrough of `startTestAction`/`submitTestAction`.

| Function | Purpose |
|---|---|
| `startTestAction` | Rate-limited, transactional: expires the user's stale sessions, rejects if one is still active, creates a new `testSessions` row. |
| `submitTestAction` | Grades answers, updates `users` aggregates, inserts `completedTestes`. |
| `sendEmail` | Contact form → `customersMessages` (rate-limited 3/hr). |
| `deleteTestAction` | Deletes a `tests` row (admin/content-management use). |
| `updateUsername` / `updateMotto` | Profile field updates on `users`. |
| `createForumPostAction` / `deletePostAction` | Forum thread CRUD, `forumPosts`. |
| `createCommentAction` / `deleteCommentAction` | Forum comment CRUD, `forumComments`. |
| `createTestimonialAction` | Insert into `testimonials`. |
| `createTestAction` | Manual single-question test creation (used by `/panel/dodaj-test`). |
| `uploadTestsFromFile` | Bulk test import from an uploaded file. |
| `saveAIGeneratedTestsAction` | Persists AI-generated test questions previewed via `generateAITestsAction` (`aiTests.ts`) and links them to a category. |
| `expireSessionAction` | Manually marks a `testSessions` row `EXPIRED` (plain function call, not a form action). |
| `deleteUserCustomTestAction` / `deleteUserCustomTestsByCategoryAction` | Remove custom test(s), `userCustomTests`. |
| `createCustomCategoryAction` / `updateCategoryNameAction` / `deleteCustomCategoryAction` | `userCustomCategories` CRUD. |
| `addQuestionToCategoryAction` / `removeQuestionFromCategoryAction` | Mutate a custom category's `questionIds` array. |

## `admin-rag-actions.ts` (256 lines) — RAG corpus management

Every function starts with `await ensureAdmin()`. See [`13-pages-admin.md`](./13-pages-admin.md) → `/admin/rag` for the full flow.

| Function | Purpose |
|---|---|
| `createFileSearchStoreAction` | Bootstraps a new Vertex corpus, records `ragConfig`. |
| `uploadFilesAction` | Ingests `.md`/`.txt`/`.pdf` files into the corpus. |
| `getStoreStatusAction` | Read-only: is a corpus configured, and what does it report. |
| `listStoreDocumentsAction` | Lists ingested documents. |
| `testRagQueryAction` | Runs a `canonical_only` probe query through the real production retrieval + generation path. |
| `deleteFileSearchStoreAction` | Tears down the corpus + config. |

## `aiTests.ts` — AI-generated test questions
`generateAITestsAction` — generates candidate questions for preview only (`FormState.values`); the user must separately call `saveAIGeneratedTestsAction` (in `actions.ts`) to persist them. Premium-gated.

## `blog.ts` (597 lines) — Blog CRUD + likes
| Function | Purpose |
|---|---|
| `createBlogPostAction` / `updateBlogPostAction` / `deleteBlogPostAction` / `deleteBlogPost` | Post CRUD (two delete variants — form-style and a plain `{id}` object call). |
| `publishBlogPostAction` / `archiveBlogPostAction` | Status transitions (`draft → published → archived`). |
| `incrementViewCountAction` | Fire-and-forget view counter, no `FormState` return. |
| `likeBlogPostAction` / `unlikeBlogPostAction` | Older explicit like/unlike pair. |
| `toggleBlogLikeAction` | **The current like flow** — see [`10-pages-public.md`](./10-pages-public.md) → Blog likes; auth + rate-limit (`blog:like`) + `LikeBlogPostSchema`, insert-if-absent/delete-if-present, idempotent. |
| `getBlogLikeState` | Read-only per-user like state, used to hydrate `BlogLikeButton` client-side. |

## `blogCategories.ts` (290 lines) — Categories & tags
`createBlogCategoryAction`, `updateBlogCategoryAction`, `deleteBlogCategoryAction`, `createBlogTagAction`, `updateBlogTagAction`, `deleteBlogTagAction` — each independently calls `auth()` and checks `sessionClaims.metadata.role === 'admin'` (defense-in-depth alongside the `admin/layout.tsx` gate, same pattern as `admin-rag-actions.ts`).

## `cells.ts` — Mind-map/board cells
`saveCellsAction` — persists the `userCellsList` blob (`cells` + `order`). `syncCellsAction` — reconciliation/sync variant (no form args, returns a result object directly).

## `challenges.ts` — Procedure challenges
`getChallengeProgressAction(procedureId, procedureName)` — read-only progress summary for `ChallengesHub`. `submitOrderStepsAction` — **server-side score calculation** for the drag-to-reorder challenge (client never computes or can spoof its own score), writes `challengeCompletions` and potentially `procedureBadges`.

## `course-actions.ts` — Enrollment & access checks
Covered in depth in [`10-pages-public.md`](./10-pages-public.md) and [`12-pages-panel-learning.md`](./12-pages-panel-learning.md): `checkCourseAccessAction`, `getUserEnrollmentsAction`, `checkPremiumAccessAction`, `enrollUserAction`. DB-authoritative (`courseEnrollments`), not Clerk-metadata-authoritative.

## `diagnozy.ts` — Diagnozy fill-in & exam
| Function | Purpose |
|---|---|
| `getDiagnozaFillDataAction` | On-demand option list once the student picks a diagnosis formulation — deliberately not preloaded for every record. |
| `markDiagnozaCompletedAction` | Writes `diagnozyProgress`. |
| `startDiagnozyExamAction` | Draws a random case server-side and builds option pools **without correctness flags in the payload** — the client cannot infer answers from the shape of the data it receives. |
| `submitDiagnozyExamAction` | Grades the exam attempt, writes `diagnozyExamAttempts`. |

## `fetchProblematicQuestionDetails.ts` / `fetchQuestionDetails.ts`
Small read-only lookups: given a list of question refs (from a completed test's result), hydrate the full question text/options for display (used by `TestResultCard` and similar).

## `flashcardDecks.ts` / `flashcardFetch.ts` / `flashcards.ts` — Flashcards
| File | Functions |
|---|---|
| `flashcardDecks.ts` | `createGeneratedDeckAction` (AI-sourced), `createEmptyDeckAction` (manual), `createNoteFlashcardAction` (from a note), `renameFlashcardDeckAction`, `deleteFlashcardDeckAction` — all on `flashcardDecks`. |
| `flashcardFetch.ts` | `fetchFlashcardDecksAction`, `fetchFlashcardDeckAction`, `fetchNoteFlashcardDeckAction` — read-only. |
| `flashcards.ts` | `createFlashcardAction`, `updateFlashcardAction`, `deleteFlashcardAction` — individual card CRUD within a deck. |

## `forum-notifications.ts`
`markForumSeenAction(scope, ...)` — clears the "new posts"/"new comments" unread badge; backs `<MarkForumSeen>` used on `/forum`, `/forum/[postId]`, and `/admin/forum`.

## `generatedQuizzes.ts` — AI procedure quizzes
`generateProcedureQuizAction` — premium/per-course-gated AI quiz generation for a procedure challenge. `submitGeneratedQuizAction` — grades the attempt, writes `generatedQuizzes`/`challengeCompletions`.

## `lectures.ts` — AI audio lectures
`saveLectureInternal` — **internal helper, not a form action** (no `formState`/`formData` signature; called directly by `rag-actions.ts`'s `generateLectureAction`). `deleteLectureAction`, `updateLectureDurationAction` (duration is only known once the audio element loads client-side, so it's patched in after creation).

## `materials.ts` — Uploaded study materials
`deleteMaterialAction` — deletes a `materials` row, refunds the storage quota, and (confirmed against source) deletes both the `libChunks` (`removeMaterialChunks`) and the underlying UploadThing file (`utapi.deleteFiles`, best-effort — a failure here is logged but doesn't fail the action). `uploadMaterialAction` — the record-creation half of the upload flow (the file bytes go via UploadThing's own route; this persists the `materials` row + triggers extraction).

## `memory-actions.ts` — Tutor preferences
`updatePreferencesAction` — validates values against `PREFERENCE_DEFS` before writing `memPreferences` (a store that "never holds junk", per the inline comment). `getUserPreferencesAction` — fail-safe read (`{}` if memory tables aren't migrated yet), backs `/panel/ustawienia`.

## `messages.ts`
`markMessageAsReadAction` — admin marks a `customersMessages` row read.

## `mindmap.ts`
`generateMindMapAction` — generates a mind map from RAG-retrieved content; the result is stored inside a cell's `content` via the cells store (reuses the same `userCellsList` blob as the planner/media cells, rather than a dedicated table).

## `notes.ts`
`createNoteAction`, `updateNoteContentAction` (both `export const ... = async (...)` rather than `function` — same Server Action contract, stylistic difference worth normalizing, see README audit notes), `deleteNoteAction`.

## `planner.ts` (433 lines) — Learning planner
| Function | Purpose |
|---|---|
| `createPlanAction` / `updatePlanAction` | `learningPlans` CRUD. |
| `archivePlanAction` / `completePlanAction` | Status transitions. |
| `toggleConceptAction` | Mark a `learningPlanConcepts` row done/undone. |
| `addConceptAction` / `removeConceptAction` | Mutate a plan's concept list. |
| `logStudySessionAction` | Writes a `studyLogs` row (manual or auto-sourced study time). |

## `pptx.ts`
`importPptxAction` — parses an uploaded `.pptx` (via `src/lib/parsePptx.ts`) into structured content. Confirmed via its one caller, `PptxImportPanel.tsx` (rendered inside `BlogPostForm.tsx`, see [`13-pages-admin.md`](./13-pages-admin.md)): this is specifically an **admin blog-post-authoring aid** — importing a slide deck's content as a starting point for a new post — not a general note/material creation path.

## `praktyczny.ts` — Practical exams
`gradePracticalExamAction` — grades a submitted practical exam attempt. `generatePracticalExamAction` — AI-generates a new practical exam, writes `generatedPracticalExams`.

## `rag-actions.ts` (697 lines) — The AI tutor's main entry point
The largest and most central AI action file.

| Function | Purpose |
|---|---|
| `askRagQuestion` | **The tutor chat entry point.** Pulls together retrieval (`retrieveContext`), tool/command parsing (`parseMcpCommands`, `TOOL_DEFINITIONS`, `executeToolLocally`), progress streaming (`createJob`/`emitProgress`/`completeJob` — feeds `/api/rag/progress`, see [`14-api-routes.md`](./14-api-routes.md)), rate limiting, and premium gating. This is the orchestration point tying together nearly every subsystem in [`00-architecture.md`](./00-architecture.md)'s "Directory map for AI/RAG subsystems". |
| `generateLectureAction` | Generates an AI audio lecture (script + TTS), dedupes via content hash, delegates the actual DB write to `saveLectureInternal` (`lectures.ts`). |

## `stripe.ts`
`createCheckoutSession` — see [`10-pages-public.md`](./10-pages-public.md) → Purchase flow for the full walkthrough.

---

## Cross-cutting conventions

- **Return shape**: form-bound actions return `FormState` (`src/types/actionTypes.ts`) via `toFormState`/`fromErrorToFormState` (`src/helpers/toFormState.ts`); a handful of non-form actions (read-only lookups, internal helpers) return plain typed objects instead — noted per-function above.
- **Rate limiting**: `checkRateLimit(identifier, bucket)` (`src/lib/rateLimit.ts`, Upstash-backed) gates the abuse-prone actions (`test:start`, `email:send`, `blog:like`, RAG queries).
- **Auth**: nearly every action starts with `auth()` (Clerk) for the plain user-scoped case, or `ensureAdmin()`/`requireAdmin()`-equivalent inline checks for admin actions — see the specific pattern noted in `blogCategories.ts` and `admin-rag-actions.ts` above.

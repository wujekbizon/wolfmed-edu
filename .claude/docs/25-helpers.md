# Helpers Catalog

[← Back to index](./README.md)

All 121 files in `src/helpers/`, one function per file per the project convention (Golden Rule #3: "check here before writing any helper"). Grouped by domain.

## Auth & access

| File | Signature | Purpose |
|---|---|---|
| `requireUser.ts` | `requireUser()` | Clerk `auth.protect()` wrapper — see [`00-architecture.md`](./00-architecture.md). |
| `requireAdmin.ts` | `requireAdmin()` | `requireUser()` + role check, redirects. |
| `ensureAdmin.ts` | `ensureAdmin()` | Same check but **throws** instead of redirecting — for Server Actions, not pages (see [`13-pages-admin.md`](./13-pages-admin.md)). |
| `isAdmin.ts` | `isAdmin()` | Boolean-returning role check (no throw/redirect) for conditional rendering. |
| `accessTiers.ts` | `TIER_HIERARCHY`, `hasAccessToTier(tier, required)` | The tier-comparison logic used throughout course/category access gates. |
| `hasDiagnozyAccess.ts` | `hasDiagnozyAccess()` | Diagnozy-feature-specific access check. |
| `getUserIdWithRetry.ts` | `getUserIdWithRetry(...)` | Retries a Clerk `userId` lookup (mitigates a transient auth race). |
| `ownsCourse.ts` | `ownsCourse(courseSlug, ownedCourses)` | Checks whether `ownedCourses` (the `"${slug}-${accessTier}"` strings from `getUserEnrollmentsAction()`) contains either the `-basic` or `-premium` variant of `courseSlug` — used by `PathStoryHero`/`PathQuestionsHero` to decide whether to show a `CourseCheckoutButton`. |

## Forms & Server Action plumbing

| File | Signature | Purpose |
|---|---|---|
| `toFormState.ts` | `toFormState(status, message)`, `fromErrorToFormState` | Builds the `FormState` shape every action returns. |
| `rateLimitFormState.ts` | `rateLimitFormState(...)` | Wraps a rate-limit check into a ready-to-return `FormState` error. |
| `safeJsonParse.ts` | `safeJsonParse<T>(...)` | JSON.parse that returns a fallback instead of throwing. |
| `extractAnswerData.ts` | `extractAnswerData(formData)` | Pulls structured answer data out of a submitted test form. |
| `determineTestCategory.ts` | `determineTestCategory(formData)` | Resolves which category a submitted test belongs to. |

## Retrieval / RAG / AI tutor

The implementation behind the retrieval rules in root `CLAUDE.md` and [`00-architecture.md`](./00-architecture.md).

| File | Signature | Purpose |
|---|---|---|
| `reciprocalRankFusion.ts` | `reciprocalRankFusion<T>(...)` | Merges corpus + library rankings by rank, not raw score (Retrieval Rule #3). |
| `dropMissedSources.ts` | `dropMissedSources(hits)` | Drops a whole personal-library document if its best chunk misses (Retrieval Rule #4). |
| `isCorpusMiss.ts` | `isCorpusMiss(chunks)` | Judges the corpus's best chunk against `CORPUS_MISS_DISTANCE`. |
| `stripQueryFiller.ts` | `stripQueryFiller(query)` | Strips prose wrappers before a library search query (Retrieval Rule #2). |
| `stripContextCitations.ts` | `stripContextCitations(answer)` | Backstop that strips any `[1]`/source-label citation the model still emitted (Retrieval Rule #5). |
| `formatContextChunks.ts` | `formatContextChunks(chunks)` | Formats retrieved chunks into the prompt block sent to the model — unnumbered, per Retrieval Rule #5. |
| `logRetrievalScores.ts` | `logRetrievalScores(...)` | Debug logging of corpus vs. personal scores for a given query. |
| `appendRagExchange.ts` | `appendRagExchange(...)` | Appends a Q&A turn to a RAG chat cell's history. |
| `buildRagCellContent.ts` | `buildRagCellContent(topic, seed?)` | Builds the initial content string for a new RAG chat cell. |
| `parseRagCellContent.ts` | `parseRagCellContent(raw)` | Parses a RAG cell's stored content back into structured `RagCellContent`. |
| `parse-mcp-commands.ts` | `parseMcpCommands(...)` | Parses `/commands` typed into the tutor chat. |
| `resolveCommandCount.ts` | `resolveCommandCount(...)` | Resolves a count argument on a `/command` (e.g. "/fiszki 10"). |
| `extractLeadingCount.ts` | `extractLeadingCount(text)` | Pulls a leading number off a string (used by the above). |
| `resolveTutorRoute.ts` | `resolveTutorRoute(result)` | Maps the validated semantic intent contract to typed memory, clarification, or the unchanged RAG path; router unavailability degrades to existing RAG. |
| `toTutorContextMessages.ts` | `toTutorContextMessages(messages)` | Reduces cell history to six bounded role/text turns; sources never ride back as conversational context. |
| `formatTutorConversation.ts` | `formatTutorConversation(messages)` | Adds explicit user/assistant labels for semantic routing and memory answers. |
| `renderMemoryPreferences.ts` | `renderMemoryPreferences(preferences)` | Shared exact preference rendering. |
| `getMemoryPerformanceLabel.ts` | `getMemoryPerformanceLabel(percent)` | Shared Polish assessment wording. |
| `getChallengeTypeLabel.ts` | `getChallengeTypeLabel(type)` | Converts internal challenge keys to Polish labels before promotion. |
| `stripContentParameter.ts` | `stripContentParameter(definition)` | Strips a tool definition's `content` param before sending it to the model (keeps the schema the model sees lean). |
| `rag-prompts.ts` | `SYSTEM_PROMPT`, `getNoDataFoundMessage(...)` | The tutor's system prompt and the "no source, no output" refusal message (root `CLAUDE.md` → "No source, no output"). |
| `progress-helpers.ts` | `getStageMessage(stage, tool?)`, `formatSSEMessage`, `formatKeepAlive` | Human-readable progress-stage text + SSE wire-format helpers for `/api/rag/progress`. |

## Diagrams & mind maps (Excalidraw / Mermaid / `@xyflow/react`)

| File | Signature | Purpose |
|---|---|---|
| `applyDiagramTheme.ts` | `applyDiagramTheme(mermaid)` | Injects theme styling into raw Mermaid source. |
| `buildSceneSignature.ts` | `buildSceneSignature(...)` | Content hash/signature for change-detection on a diagram scene. |
| `countMermaidNodes.ts` | `countMermaidNodes(mermaid)` | Node count, used against `DIAGRAM_BUDGET_OVERRUN_FACTOR`. |
| `isMermaidSyntax.ts` | `isMermaidSyntax(content)` | Detects whether a string is Mermaid source. |
| `parseDiagramCellContent.ts` | `parseDiagramCellContent(raw)` | Parses a diagram cell's stored content. |
| `parseDiagramRoles.ts` | `parseDiagramRoles(mermaid)` | Extracts the semantic role map from Mermaid class annotations. |
| `quoteMermaidLabels.ts` / `stripMermaidLabels.ts` | — | Mermaid label sanitization (quoting for parser safety / stripping for display). |
| `repairMermaidSubgraphs.ts` | `repairMermaidSubgraphs(mermaid)` | Fixes malformed subgraph syntax the model sometimes emits. |
| `serializeDiagramCell.ts` | `serializeDiagramCell(source, scene)` | Serializes an Excalidraw scene back into a cell's stored string. |
| `parseMindMapCellContent.ts` | `parseMindMapCellContent(raw)` | Parses a mind-map cell's stored content into `MindMapCellContent`. |

## Mannequin / 3D anatomy viewer

| File | Signature | Purpose |
|---|---|---|
| `buildMannequinGeometry.ts` | `buildMannequinGeometry(scene)` | Extracts a `THREE.BufferGeometry` from the loaded 3D model. |
| `createMannequinMaterial.ts` | `createMannequinMaterial(...)` | Builds the Three.js material for the mannequin mesh. |
| `getMannequinCameraPosition.ts` | `getMannequinCameraPosition(...)` | Computes camera position for a named view. |
| `getShortestAngleDelta.ts` | `getShortestAngleDelta(from, to)` | Shortest-path angle interpolation (camera rotation). |
| `getZoneDebugColor.ts` | `getZoneDebugColor(zone)` | Debug-only zone highlight color. |
| `paintMannequinZones.ts` | `paintMannequinZones(...)` | Applies per-zone coloring to the mesh. |
| `setMannequinHighlight.ts` | `setMannequinHighlight(...)` | Highlights a selected anatomical zone. |

## Diagnozy

| File | Signature | Purpose |
|---|---|---|
| `buildDiagnozyExam.ts` | `buildDiagnozyExam(...)` | Assembles the exam payload server-side (no answer leakage — see `startDiagnozyExamAction`). |
| `compareDiagnozySection.ts` | `compareDiagnozySection(a, b)` | Sort comparator for diagnozy sections. |
| `filterAndSortDiagnozy.ts` | `filterAndSortDiagnozy(...)` | Browse-page filter/sort logic. |
| `filterAndSortExamAttempts.ts` | `filterAndSortExamAttempts(...)` | Exam-attempts history filter/sort. |
| `getDiagnozyChapterSelectOptions.ts` / `getDiagnozySortSelectOptions.ts` / `getDiagnozyStatusSelectOptions.ts` | — | `SelectOption[]` builders for the browse filters. |
| `getDiagnozyChapters.ts` | `getDiagnozyChapters(items)` | Derives chapter groupings from a flat item list. |
| `getDiagnozyTitlesBySlug.ts` | `getDiagnozyTitlesBySlug(rows)` | Bulk slug→title lookup map (used by the exam-attempts panel, see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md)). |
| `getEgzaminStepAt.ts` | `getEgzaminStepAt(...)` | Resolves the current exam step. |
| `getExamAttemptStats.ts` | `getExamAttemptStats(attempts)` | Aggregate stats (pass rate, etc.) over attempt history. |
| `gradeDiagnozyExam.ts` | `DIAGNOZY_EXAM_PASS_THRESHOLD = 75`, grading function | Scoring logic + the pass threshold constant. |
| `groupDiagnozyByChapter.ts` | `groupDiagnozyByChapter(items)` | Groups the browse list by chapter. |

## Tests, quizzes & challenges

| File | Signature | Purpose |
|---|---|---|
| `calculateAverageScore.ts` | `calculateAverageScore(totalScore, totalQuestions)` | Used for `users` aggregate display. |
| `selectSessionTests.ts` | `selectSessionTests(tests, count, sessionId)` | Deterministically selects and orders a session's questions and answers. |
| `gradeSessionAnswers.ts` | `gradeSessionAnswers(tests, submittedAnswers)` | Rejects missing, extra or invalid option indexes and grades against canonical answers. |
| `generatedRandomTests.ts` | `generateRandomTests(testArray, numOfQuestions)` | Random-subset sampling for a test session. |
| `shuffleArray.ts` | `shuffleArray<T>(array)` | Generic Fisher–Yates shuffle (question/option randomization). |
| `enforceItemCount.ts` | `enforceItemCount<T>(items, requested)` | Pads/trims a list to an exact requested count. |
| `gradeGeneratedQuiz.ts` | `gradeGeneratedQuiz(...)` | Scores an AI-generated procedure quiz attempt. |
| `stripQuizAnswers.ts` | `stripQuizAnswers(row)` | Removes correctness data before sending a generated quiz to the client (see `types/generatedQuizTypes.ts`'s `GeneratedQuizPlayView`). |
| `toProcedureQuizInput.ts` / `toQuizReview.ts` / `withQuizItemIds.ts` | — | Shape-conversion helpers between DB rows, generation input, and the review UI. |
| `testCellHelpers.ts` | `parseQuestions(content)` | Parses draft questions typed into a "test" board cell. |
| `challengeTypesForCourse.ts` | `challengeTypesForCourse(course)` | Which `ChallengeType`s are valid for a given course (e.g. `ORDER_STEPS` is `opiekun-medyczny`-only — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md)). |
| `praktycznyGrading.ts` | `gradePracticalExam(exam, answers)` | Practical-exam scoring engine. |

## Categories

| File | Signature | Purpose |
|---|---|---|
| `buildAccessibleCategories.ts` | `buildAccessibleCategories(categories)` | Filters a supplied category list to ones the user can access (`checkCourseAccessAction` + `hasAccessToTier`). One caller: `NaukaCategoriesSection.tsx`. See the next row — this duplicates rather than composes with `populateCategories.ts`. |
| `populateCategories.ts` | `getAccessibleCategories()` | The higher-level entry point used directly by pages (`/panel/testy`, etc.). **Correction from an earlier pass of this doc, which guessed it composes `buildAccessibleCategories.ts`** — checked both files directly: it does not. `getAccessibleCategories` inlines its own copy of the same course-access/tier-filtering logic (`checkCourseAccessAction` + `hasAccessToTier`, filtering to `hasAccess`) independently of `buildAccessibleCategories()`, which implements the identical algorithm over a caller-supplied category list for its one caller, `NaukaCategoriesSection.tsx`. See the audit note below — this looks like genuine duplicated logic, not composition. |
| `countCategoryContent.ts` | `countCategoryContent(details)` | Question/content counts for a category detail view. |
| `getCategorySelectOptions.ts` | `getCategorySelectOptions(...)` | `SelectOption[]` builder for category pickers. |
| `titleizeCategory.ts` | `titleizeCategory(key)` | `some-category-key` → `Some Category Key` display formatting. |

## Learning planner

| File | Signature | Purpose |
|---|---|---|
| `autoPlanName.ts` | `autoPlanName(subjectLabel)` | Auto-generates a plan name from its focus subject. |
| `examTemplateConcepts.ts` | `buildExamTemplateConcepts(...)` | Seeds a plan's concepts from an exam-focused template. |
| `getConceptSelectOptions.ts` | `getConceptSelectOptions(concepts)` | `SelectOption[]` for the concept picker. |
| `planCapacity.ts` | `computePlanCapacity(...)` | How much study time a plan's schedule can hold. |
| `planCompletionPercent.ts` | `planCompletionPercent(...)` | Progress percentage for `PlanDashboard`. |
| `scaledConceptMinutes.ts` | `scaledConceptMinutes(entry)` | Scales a catalog concept's default minutes to fit the plan's pace. |

## Notes & rich text (Lexical)

| File | Signature | Purpose |
|---|---|---|
| `getLexicalContent.ts` | `getLexicalContent(jsonString)` | Extracts plain text from a Lexical JSON tree (feeds `notes.plainText`). |
| `lexicalToHtml.ts` | `lexicalToHtml(jsonString)` | Renders Lexical JSON to HTML (for excerpts/previews). |
| `sanitizeHtml.ts` | `sanitizeHtml(content)` | XSS-safe HTML sanitization — the guard between any rendered rich text/markdown and `dangerouslySetInnerHTML`-style rendering. |

## Flashcards & media cells

| File | Signature | Purpose |
|---|---|---|
| `flashcardCellHelpers.ts` | `parseFlashcardContent(content: string): { flashcards: {questionText, answerText}[], topic: string }` | Parses the **AI-generation preview** shape — a flashcard cell mid-generation, before a deck exists (`content` is a JSON blob with a `flashcards` array + `topic`, defaults to `[]`/`'Fiszki'` on parse failure). |
| `parseFlashcardCellContent.ts` | `parseFlashcardCellContent(content: string): string \| null` | Parses the **saved** shape — a flashcard cell that already points at a real deck (`content` is JSON with just a `deckId`; returns that id or `null`). Confirmed not a duplicate of the above: different input shape, different point in the generate-then-save lifecycle (see [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 3). |
| `mediaCellHelpers.ts` | `seededBars(seed, count = 30)` | Deterministic waveform-bar heights for an audio player UI, seeded so the same lecture always renders the same waveform. |
| `resolveSource.ts` | `resolveSrc(m)` | Resolves a media source URL from a loosely-typed input. |

## Formatting & dates

| File | Signature | Purpose |
|---|---|---|
| `formatBytes.ts` | `formatBytes(bytes)` | Human-readable file size (storage quota display). |
| `formatCompactMinutes.ts` | `formatCompactMinutes(minutes: number): string` | Chart-axis-tick formatting only — `37 → "37"`, `1500 → "1,5k"`. Deliberately terse: the inline comment explains `formatMinutes` would render `"37 h 30 min"` for one tick and blow out the axis width. Not for general display. |
| `formatMinutes.ts` | `formatMinutes(minutes: number): string` | General human-readable duration — `30 → "30 min"`, `60 → "1 h"`, `90 → "1 h 30 min"`. This is the one to reach for outside a chart axis. |
| `formatDate.ts` / `formatPlDate.ts` / `formatRelativeDate.ts` | — | Date formatting: ISO/generic, Polish-locale, and relative ("2 dni temu") variants. |
| `formatExamClock.ts` | `formatExamClock(totalSeconds)` | `MM:SS` countdown display. |
| `pluralizePl.ts` | `pluralizePl(count, [one, few, many])` | Polish plural-form selection (Polish has three plural forms, unlike English's two). |
| `textHelpers.ts` | `getQuestionWord(count)` | Polish word-form selection specifically for "pytanie/pytania/pytań" (question count). |
| `toDateInputValue.ts` / `toLocalDateInputValue.ts` | — | `Date` → `<input type="date">` value string, UTC vs. local-time variants. |
| `groupByYear.ts` | `groupByYear(...)` | Groups a dated list by year (e.g. practical exam sessions). |

## Forum

| File | Signature | Purpose |
|---|---|---|
| `forumWatermark.ts` | `forumWatermark(lastSeenAt)` | Computes the "unread since" cutoff timestamp for notifications. |

## Misc / generic utilities

| File | Signature | Purpose |
|---|---|---|
| `findOptionByPrefix.ts` | `findOptionByPrefix(options, prefix)` | Finds a select option by typed-prefix match (keyboard navigation). |
| `getNextOptionIndex.ts` | `getNextOptionIndex(...)` | Index arithmetic for cycling through options. |
| `getInitials.ts` | `getInitials(username)` | Avatar-fallback initials. |
| `randomId.ts` | `randomId()` | Generic random ID generator. |
| `shapeGenerators.ts` | `generateRandomNumber(min, max)`, more | Random-value generators backing the decorative shape hooks. |
| `uploadErrors.ts` | `parseUploadError(...)` | Maps an UploadThing error into a user-facing message. |
| `mergeProgressTimeline.ts` | `mergeProgressTimeline(...)` | Merges SSE progress events into a display timeline. |
| `limitPageBookmarks.ts` | `limitPageBookmarks(bookmarks)` | Caps a stored bookmarks map's size. |
| `buildResizableProps.ts` | `buildResizableProps({...})` | Props builder for `re-resizable` panels. |
| `clampPercent.ts` | `clampPercent(ratio)` | Clamps a `0–1` ratio to `[0,1]` and rounds to a whole percent — the scroll-progress math backing `useHorizontalPath` (see [`22-hooks.md`](./22-hooks.md)). |
| `getDeviceMeta.ts` | `getDeviceMeta()` (default export) | Captures browser/screen/network/system/performance metadata (user agent, screen size, connection type, timezone, JS heap usage, etc.). Confirmed one caller: `StartTestForm.tsx` — this is metadata attached to a **test-start event**, not a general analytics or responsive-layout signal as an earlier pass of this doc guessed. |
| `getCourseSubjectTitles.ts` | `getCourseSubjectTitles(courseSlug)` | Subject-title list for a course (used on `/kierunki/[slug]`, see [`10-pages-public.md`](./10-pages-public.md)). |
| `generateRandomMotto.ts` | `generateRandomMotto()` | Random starter motto for new users (used by the Clerk `user.created` webhook, see [`14-api-routes.md`](./14-api-routes.md)). |
| `slugify.ts` | `generateProcedureSlug(name)` | Procedure-name-to-slug conversion. |
| `blogUtils.ts` | `generateSlug(title)` | Blog-post-title-to-slug conversion. |
| `blogMarkdown.ts` | `toSentenceCase(text)` | Sentence-case formatting for blog markdown rendering. |

---

**Resolved from an earlier audit note**: `flashcardCellHelpers.ts` and `parseFlashcardCellContent.ts` looked redundant by name alone. Reading both (see their entries above) confirmed they parse two different points in the flashcard-cell lifecycle — not a duplication.

**New audit finding (round 7 of doc-testing, from checking a hedged claim rather than trusting it)**: `buildAccessibleCategories.ts` and `populateCategories.ts`'s `getAccessibleCategories` genuinely do duplicate the same course-access/tier-filtering algorithm independently, rather than one composing the other as an earlier pass of this doc assumed without checking. Different callers (`NaukaCategoriesSection.tsx` vs. most of `/panel`), same logic, copy-pasted rather than shared. Flagged in the README audit list — this is exactly the kind of thing Golden Rule #3 ("check `/src/helpers` for an existing one") is meant to prevent, and here it looks like it didn't.

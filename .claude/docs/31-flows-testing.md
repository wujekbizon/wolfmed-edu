# Business Flow: Testing & Exams

[← Back to index](./README.md)

---

## Flow 1 — User takes a theory test

1. **Category pick**: `/panel/testy` → `TestsCategoriesList` → user picks a category, which triggers `startTestAction` (`src/actions/actions.ts:73`).
2. **Session start** (`startTestAction`): rate-limited (`test:start`), Zod-validated (`StartTestSchema`). Inside a DB transaction:
   - Locks the user's row (`FOR UPDATE`) to serialize concurrent start attempts.
   - Auto-expires the user's own stale `ACTIVE` sessions (past `expiresAt`, or no heartbeat in 5 minutes).
   - **Rejects** if a genuinely active session still exists ("finish it before starting a new one") — a user cannot run two timed tests at once.
   - Inserts a new `testSessions` row (`category`, `numberOfQuestions`, `durationMinutes`, `expiresAt` computed from now, `status: ACTIVE`).
   - Returns `{ sessionId, expiresAt, durationMinutes, numberOfQuestions }` in `FormState`.
3. Client navigates to `/panel/testy/[category]?sessionId=<id>`. The page (`src/app/panel/testy/[value]/page.tsx`) loads `getTestSessionDetails(sessionId)` + the category's question pool, renders `<GenerateTests tests durations sessionId .../>`.
4. **While the test is in progress**: two client hooks keep the session alive and honest:
   - `useSessionHeartbeat(sessionId)` (`src/hooks/useSessionHeartbeat.ts`) calls `POST /api/session/heartbeat` every `HEARTBEAT_INTERVAL = 2 * 60 * 1000` (2 min — well inside the 5-minute abandonment threshold), bumping `testSessions.lastActivityAt` — this is what the 5-minute check in step 2 and the `cleanup-sessions` cron both key off. It also sends an extra heartbeat immediately whenever the tab becomes visible again (`visibilitychange` → `!document.hidden`).
   - `useBeaconCleanup(sessionId)` (`src/hooks/useBeaconCleanup.ts`) fires `POST /api/session/expire` via `navigator.sendBeacon` on tab close/navigation-away (`pagehide`) — **but also on the `visibilitychange` event whenever `document.hidden` becomes true**, i.e. switching tabs, minimizing the window, OS-level backgrounding, or a phone screen lock, not only a true close. There's no grace period and no check against the heartbeat's own tolerance: the session is expired the instant the tab is hidden. `useSessionHeartbeat`'s own effect-cleanup function *also* independently fires the same `sendBeacon` expire call on any cleanup of that effect. **This means a student who briefly switches tabs or has their phone lock mid-test loses their in-progress session exactly as if they'd closed it** — see README audit note #16 for whether this is intended (anti-cheating) or a bug; nothing in the source frames it as deliberate, and it contradicts the heartbeat/threshold design's own tolerance for brief inactivity.
   - `useCountdownTestTimer` drives the visible countdown and a low-time warning.
5. **Submission** (`submitTestAction`, `src/actions/actions.ts:196`): auth-checked, rate-limited (`test:submit`), requires `sessionId`. Extracts every `answer*` field from the submitted `FormData`, validates against `CreateAnswersSchema(allowedLengths)` — a **schema factory** because the valid shape depends on how many questions (10/20/40) this specific session actually had.
   - Inside a DB transaction: re-fetches the session **`FOR UPDATE`**, scoped to `(id, userId, status='ACTIVE')` — a session that's already completed, expired, or belongs to someone else cannot be submitted against.
   - If the session's `expiresAt` has already passed: marks it `EXPIRED` and aborts the submission with "czas się skończył" — a client that races past its own timer cannot smuggle in a late answer.
   - Grades via `countTestScore()` (`src/helpers/countTestScore.ts`) and reshapes via `parseAnswerRecord()` (`src/helpers/parseAnswerRecord.ts`).
   - Updates `users` aggregates (`testsAttempted += 1`, `totalScore += correct`, `totalQuestions += answered`), inserts the `completedTestes` row, and marks the session `COMPLETED` — all in the same transaction, so a mid-write failure can't leave the session orphaned as `ACTIVE` while a result silently failed to save.
6. **Side effect, off the request path**: `after(() => onQuizCompleted({ userId, sessionId, category }))` (`src/server/memory/extract.ts`) — recomputes the student's per-category performance and writes it into the AI tutor's memory layer (a `memFacts`/episode-style record) **after** the response has already been sent to the user, so this never adds latency to "did my test submit." Fails safe internally — a memory-extraction error never surfaces as a failed submission.
7. `revalidatePath('/panel', 'page')`, returns `SUCCESS`. Client redirects to `/panel/wyniki/[testId]` to show the result (`TestResultCard`).

**Files**: `src/actions/actions.ts` (`startTestAction`, `submitTestAction`), `src/app/panel/testy/[value]/page.tsx`, `src/hooks/useSessionHeartbeat.ts`, `src/hooks/useBeaconCleanup.ts`, `src/app/api/session/{heartbeat,expire}/route.ts`, `src/helpers/{countTestScore,parseAnswerRecord}.ts`, `src/server/memory/extract.ts`.

---

## Flow 2 — User generates an AI test on a topic (premium)

1. `/panel/dodaj-test` → `CreateTestTabs` → AI-generation tab → form submits `generateAITestsAction` (`src/actions/aiTests.ts:22`) with `topic`, `linkedCategory`, `categoryName`, `questionCount`.
2. Premium-gated (`checkPremiumAccessAction`); `linkedCategory` must be one of the user's actually-accessible categories (checked against `getAccessibleCategories()`, not trusted from the client); rate-limited (`quiz:generate`).
3. **Grounding**: calls `retrieveContext({ userId, query: topic, mode: 'canonical_only' })` — deliberately **excludes the personal library**. The inline comment explains why: a generated test is study material with an answer key, and building test questions partly from a student's own (possibly wrong) note could bake their misunderstanding into the "correct" answer. Falls back to the raw topic text if the corpus has nothing relevant, so generation still works rather than hard-failing.
4. Calls the `utworz_test` tool via `executeToolLocally()` (`src/server/tools/executor.ts`) with the grounded content, parses the model's JSON response, reshapes it into the `TestFileSchema` shape, and **re-validates it** — the model's output is never trusted as-is.
5. Returns the generated questions in `FormState.values` (`questionsJson`) for **preview only** — nothing is written to the DB yet.
6. User reviews the preview and separately submits `saveAIGeneratedTestsAction` (`src/actions/actions.ts:1004`), which persists the questions into `userCustomTests` and links them to the target category. Two distinct actions (generate-for-preview vs. save) so a student can discard a bad generation without polluting their test bank.

**Files**: `src/actions/aiTests.ts`, `src/server/tools/executor.ts`, `src/server/retrieval/context.ts`, `src/actions/actions.ts` (`saveAIGeneratedTestsAction`).

---

## Flow 3 — User attempts a practical exam (`opiekun-medyczny`)

1. `/panel/egzaminy` (course-gated: `opiekun-medyczny` enrollment required) → picks an exam sheet → `/panel/egzaminy/[slug]` resolves it via `getPublicPracticalExamById(slug)` (a seeded, static arkusz) or falls back to `getGeneratedPracticalExamById(slug, userId)` for an AI-generated one — see Flow 4.
2. `<PracticalExamRunner exam={exam} />` presents the documentation-filling exercise; on completion, submits `gradePracticalExamAction` (`src/actions/praktyczny.ts:24`).
3. Course-access-gated (`opiekun-medyczny`), rate-limited (`egzamin:grade`), validated (`GradePracticalExamSchema`).
4. Resolves the exam definition the same two ways as step 1 (static-first, then generated), parses the submitted `answers` JSON, and grades via `gradePracticalExam()` (`src/helpers/praktycznyGrading.ts`) — **all grading logic runs server-side**; the client never computes or could spoof its own score.
5. **Side effect**: logs a `studyLogs` entry (`insertStudyLog`) crediting the attempt as learning time — clamped to `[1, 120]` minutes (120 = the real MED.14 practical exam's official time limit), guarding against a runaway timer from an abandoned browser tab inflating a student's logged study time.
6. Returns `{ status, message, result }` with the percent score and a pass/fail message (`75%` threshold, stated inline in the return message).

**Files**: `src/actions/praktyczny.ts`, `src/helpers/praktycznyGrading.ts`, `src/lib/praktycznyUtils.ts`, `src/server/queries.ts` (`insertStudyLog`).

## Flow 4 — User generates an AI practical exam (premium)

1. Same course + **premium** gate (stacked on top of the course gate — practical exams are `opiekun-medyczny`-only, AI generation is additionally premium-only), rate-limited (`egzamin:generate`).
2. Calls the `egzamin_praktyczny_tool` via `executeToolLocally()`, parses + validates the result against `GeneratedPracticalExamSchema`.
3. Assigns a fresh `crypto.randomUUID()` as the exam's id and persists it via `saveGeneratedPracticalExam(userId, exam)` → `generatedPracticalExams` table.
4. Returns the new `examId`; the client navigates to `/panel/egzaminy/[examId]`, which (per Flow 3 step 1) resolves generated exams as a fallback after checking the static set — so a generated exam's id never collides with a seeded one in practice, but the lookup order means a static exam of the same slug would always win. Grading afterward runs through the exact same `gradePracticalExamAction` as a static exam.

**Files**: `src/actions/praktyczny.ts` (`generatePracticalExamAction`).

---

## Flow 5 — User attempts a diagnozy practical exam

1. `/panel/diagnozy/egzamin` (diagnozy-access-gated via `hasDiagnozyAccess()`) → `<EgzaminRunner />` calls `startDiagnozyExamAction()` (`src/actions/diagnozy.ts:112`) with no arguments.
2. **Server draws a random case**: pulls all exam-eligible diagnozy (`getDiagnozyForExam()`), picks one at random, and builds the full exam payload — including plausible-but-wrong option pools drawn from the other ("sibling") diagnozy — via `buildDiagnozyExam(drawn, siblings)` (`src/helpers/buildDiagnozyExam.ts`). The inline comment is explicit: **the payload carries no correctness flags** — a client inspecting the response has no way to infer which option is right.
3. Student works through the case in the UI (`WykonanieStep`/`WykonanieMannequinPanel` etc. — see [`26-components.md`](./26-components.md) → `diagnozy/egzamin/`), including a body-zone-picking interaction on the 3D mannequin (`egzamin/mannequin/`). The mannequin subsystem (model asset, vertex→zone mapping, click-to-zone raycasting, and how to regenerate the zone map) has its own deep-dive at `scripts/MANNEQUIN.md` — not duplicated here, but worth knowing it exists before touching anything in `egzamin/mannequin/` or `scripts/*mannequin*`.
4. Submits `submitDiagnozyExamAction({ slug, answers, zones, timeSpent })` (`:132`) — rate-limited (`diagnozy:exam:submit`), validated (`SubmitDiagnozyExamSchema`).
5. Re-fetches the actual diagnoza by slug (never trusts a client-supplied "correct answer" — only the slug and the student's picks) and grades via `gradeDiagnozyExam()` (`src/helpers/gradeDiagnozyExam.ts`, pass threshold `DIAGNOZY_EXAM_PASS_THRESHOLD = 75`).
6. Inserts a `diagnozyExamAttempts` row (`score`, per-step `stepScores`, `timeSpent`, `passed`). Returns the full result for the UI to render.
7. Attempt history is visible on the same page via a separately-suspended panel reading `getUserDiagnozyExamAttempts` — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md).

**Files**: `src/actions/diagnozy.ts`, `src/helpers/{buildDiagnozyExam,gradeDiagnozyExam}.ts`, `src/components/diagnozy/egzamin/`.

## Flow 6 — User completes a diagnoza's "fill in the nursing process" exercise (`wypelnij`)

1. `/panel/diagnozy/[slug]` → `wypelnij` tab → `getDiagnozaFillDataAction(slug)` (`:33`) fetches the option lists (care goals, interventions, expected outcomes) **on demand**, only once the student opens this tab — the inline comment notes this is deliberate so the client never loads every diagnoza's fill-in data up front.
2. Student fills in the form (`<WypelnijRunner />`); on completion, `markDiagnozaCompletedAction(slug)` (`:64`) is called — rate-limited (`diagnozy:complete`), validated, inserts a `diagnozyProgress` row via `insertDiagnozaCompletion`. Unlike the exam flow, **this path does not grade correctness** — it's a completion/practice tracker, not a scored assessment (scoring for diagnozy only happens via the separate exam flow above).

**Files**: `src/actions/diagnozy.ts` (`getDiagnozaFillDataAction`, `markDiagnozaCompletedAction`).

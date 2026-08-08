# Business Flow: Learning Content (Notes, Materials, Flashcards, Mind Maps, Procedures, Planner)

[← Back to index](./README.md)

---

## Flow 1 — User creates a note (and it becomes AI-searchable, if premium)

1. `/panel/nauka` → note editor (Lexical, `src/components/editor/`) → submits `createNoteAction` (`src/actions/notes.ts:19`, note the `export const ... = async` style — see README audit notes).
2. Rate-limited (`note:create`), validated (`NoteSchema`) — `content` (the raw Lexical JSON string from the client) is parsed via `parseLexicalContent()` (`src/helpers/safeJsonParse.ts`), which fails the whole action with a specific "Błąd zapisu treści" message rather than a generic validation error if the editor sent malformed JSON.
3. Inserts the `notes` row.
4. **Personal-library indexing branch** — this is the cost-boundary rule from root `CLAUDE.md` made concrete:
   - `getIsPremium()` (`src/server/premium.ts`) gates everything past this point. A **basic** plan's note is saved in full and stops here — no `libChunks` rows are written at all, which is exactly what keeps `embedding IS NULL` meaning "queued" and nothing else (per the schema doc's cost-boundary note).
   - On **premium**: `syncNoteChunks()` (`src/server/library/sync-note.ts`) runs **synchronously**, before the response — this is pure Postgres (chunking + inserting `libChunks` rows), so it's cheap and the note is immediately findable via the trigram index even before embedding finishes.
   - `after(() => embedPendingChunks({ userId, sourceId: noteId }))` — the actual embedding (a model call per chunk) runs **after** the response is sent, so creating a note never waits on an AI API call.
5. `revalidatePath("panel/nauka")`.

**Editing** (`updateNoteContentAction`, `:141`) follows the same pattern — and is explicitly also the **upgrade path**: a note written while on a basic plan (no chunks) gets indexed the first time it's edited after upgrading to premium, since the premium check re-runs on every save rather than being fixed at creation time.

**Deleting** (`deleteNoteAction`, `:100`) removes the note, calls `removeNoteChunks()` to clean up any `libChunks` rows, and also deletes any flashcard deck sourced from this note (`flashcardDecks.sourceRef === noteId`) — the inline comment notes this relationship is **not** a foreign key, so nothing would cascade automatically; the action does it explicitly.

**Files**: `src/actions/notes.ts`, `src/server/library/sync-note.ts`, `src/server/library/embed-pending.ts`, `src/server/premium.ts`, `src/helpers/safeJsonParse.ts`.

---

## Flow 2 — User uploads a study material

Two-phase upload: the file bytes go through UploadThing's own route; this action persists the database record and enforces the storage quota.

1. Client uploads the file via the UploadThing widget (`UploadMaterialModal` → `UploadMaterialForm`), which hits `POST /api/uploadthing` directly (`src/app/api/uploadthing/route.ts` → `ourFileRouter`) — bytes never pass through a Server Action.
2. Once UploadThing returns the file's `key`/`url`, the client calls `uploadMaterialAction` (`src/actions/materials.ts:77`) with the file's metadata (`title`, `key`, `fileUrl`, `type`, `category`, `size`).
3. Rate-limited (`material:upload`, 5/hour), validated (`MaterialsSchema`).
4. Inside a DB transaction:
   - Ensures a `userLimits` row exists (creates one with the default 20 MB cap if this is the user's first upload).
   - **Enforces the storage quota inside the transaction**: if `currentUsage + newFileSize > currentLimit`, throws — and the `catch` block explicitly calls `utapi.deleteFiles([key])` to clean up the orphaned UploadThing file rather than leaving storage consumed for a DB row that was never created.
   - Inserts the `materials` row. **Storage is sold with every plan** (per root `CLAUDE.md`'s cost boundary) — so `indexStatus` is only forced to `UNINDEXED_STATUS` for non-premium users; premium uploads default to `pending`.
   - Atomically increments `userLimits.storageUsed`.
5. **Indexing, premium only**: `after(() => syncMaterialChunks(userId, materialId))` — reading the file (PDF text extraction, a model call measured in seconds) runs **after** the response, so the upload itself never blocks on it. The file is usable immediately; it becomes searchable once extraction finishes. If the serverless function is torn down mid-`after()`-call, the `library-index` cron backstop (see [`14-api-routes.md`](./14-api-routes.md)) picks up any material still `pending`/`failed` on its next run.

**No upgrade path for materials, unlike notes**: a basic-plan upload is saved with `indexStatus: 'not_indexed'` (`UNINDEXED_STATUS`), which is a different, terminal status from `pending`/`failed` — the cron backstop above never touches it. There is also no `updateMaterialAction` to re-trigger indexing the way editing a note does (Flow 1 above). A material uploaded before an upgrade to premium stays permanently unsearchable unless deleted and re-uploaded — worth confirming this is the intended policy rather than an oversight (see [`40-testing-guide.md`](./40-testing-guide.md) → TC-8).

**Deleting** (`deleteMaterialAction`, `:20`): deletes the `materials` row and **atomically refunds** the storage quota (`GREATEST(0, storageUsed - size)`, floored at zero so a double-delete race can't go negative), cleans up `libChunks` via `removeMaterialChunks()`, then best-effort deletes the actual file from UploadThing (a failure here is logged but doesn't fail the whole action — the DB record and quota are already consistent regardless of whether the storage-provider delete succeeds).

**Files**: `src/actions/materials.ts`, `src/server/library/sync-material.ts`, `src/server/premium.ts`, `src/server/library/config.ts` (`UNINDEXED_STATUS`).

---

## Flow 3 — User creates flashcards (three different origins)

All three write to the same `flashcardDecks`/`flashcards` tables but originate differently:

1. **AI-generated deck** — `createGeneratedDeckAction(name, cards)` (`src/actions/flashcardDecks.ts:21`), called with plain arguments rather than `FormData` (the cards array comes from a prior AI-generation step, not a form field). Inserts a deck (`sourceType: 'ai'`) and its cards in one transaction.
2. **Manual empty deck** — `createEmptyDeckAction` (`:63`): user names a deck, gets an empty `sourceType: 'manual'` deck to add cards to one at a time via `createFlashcardAction` (`src/actions/flashcards.ts`).
3. **From a note** — `createNoteFlashcardAction` (`:93`): re-validates the source note still exists (`getNoteById`), then `resolveNoteDeckId()` (`:131`) either finds the note's existing deck or creates one — using `.onConflictDoNothing()` against the `flashcardDecks` unique constraint on `(userId, sourceRef)` (see [`01-database-schema.md`](./01-database-schema.md)), then re-selecting if the insert lost a race. This means **a note can only ever have one deck**, created lazily on its first flashcard rather than up front.

All three paths share `nextCardPosition(deckId)` (`src/server/flashcardAccess.ts`) to append new cards in order, and `findOwnedDeck(userId, deckId)` to scope rename/delete operations to decks the caller actually owns before mutating them.

**Files**: `src/actions/flashcardDecks.ts`, `src/actions/flashcards.ts`, `src/server/flashcardAccess.ts`.

---

## Flow 4 — User generates a mind map (premium)

1. A "Mapa Myśli" board cell → `MindMapGenerateForm` → submits `generateMindMapAction` (`src/actions/mindmap.ts:23`) with `topic` (+ optional `subjectId`).
2. Premium-gated, Zod-validated (`GenerateMindMapSchema`), rate-limited (`mindmap:generate`).
3. `generateTree(userId, topic)` (`src/lib/mindmap/generateTree.ts`) — the actual AI generation, presumably calling `retrieveContext()` internally the same way `generateAITestsAction` does (grounded generation, not raw model knowledge — consistent with root `CLAUDE.md`'s "No source, no output" rule).
4. **Re-validates the generated tree** against `MindMapNodeSchema` even after the generation library has already normalized it — the inline comment is explicit: "never trust model output even after normalization."
5. Collapses the tree below `INITIAL_EXPANDED_DEPTH = 1` via `collapseBelowDepth()` (`src/lib/mindmap/treeOps.ts`) — a freshly generated map opens showing only the root and its first ring, not the whole tree at once.
6. **Returns the tree in `FormState.values.content` — nothing is persisted by this action.** The mind-map cell stores the JSON string in its own `cell.content` via the cells store, which is saved through the same `userCellsList` blob write path used by every other cell type (plan cells, media cells) — see `saveCellsAction` in [`21-server-actions.md`](./21-server-actions.md). There is no dedicated `mindmaps` table.

**Files**: `src/actions/mindmap.ts`, `src/lib/mindmap/generateTree.ts`, `src/lib/mindmap/treeOps.ts`, `src/actions/cells.ts`.

---

## Flow 5 — User completes a procedure challenge and earns a badge

1. `/panel/procedury/[course]/[slug]/wyzwania/order-steps` → `<OrderStepsChallenge />` → user drags steps into order → submits `submitOrderStepsAction` (`src/actions/challenges.ts:82`).
2. Rate-limited (`challenge:submit`), validated (`SubmitOrderStepsSchema`).
3. **Server-side scoring, not client-side**: re-loads the procedure from the DB (`getProcedureById`) and compares the user's submitted step order against `procedure.data.algorithm` step-by-step, computing `score = round(correctCount / totalSteps * 100)` — the client's drag-and-drop UI never computes or reports its own score.
4. Inside a transaction: `saveChallengeCompletion()` writes the `challengeCompletions` row, then `checkAllChallengesComplete(tx, userId, procedureId)` checks whether **all 5** challenge types for this procedure are now complete for this user — if so, `awardBadge(tx, {...})` inserts a `procedureBadges` row **in the same transaction**, so a badge is never awarded without its triggering completion actually having been recorded (or vice versa).
5. `revalidatePath` on both the challenge page and `/panel` (badges show on the dashboard).

This is the general pattern for challenges — AI-generated quiz challenges (`submitGeneratedQuizAction`, `src/actions/generatedQuizzes.ts`) follow the same shape (server-side grading, `challengeCompletions` write, same all-5-complete badge check), just against a different content source (an AI-generated quiz row instead of the static `algorithm` array).

**Files**: `src/actions/challenges.ts`, `src/server/queries.ts` (`saveChallengeCompletion`, `checkAllChallengesComplete`, `awardBadge`).

---

## Flow 6 — User creates a learning plan

1. `/panel/plan` (no active plan) → `<PlanWizard />` walks the user through goal/scope/time steps → submits `createPlanAction` (`src/actions/planner.ts:41`).
2. Rate-limited (`planner:create`); parses with `CreatePlanSchema.parse()` (throws on failure, caught and converted via `fromErrorToFormState` — the one Zod usage in this file that throws instead of `safeParse`, worth noting as a style difference from the rest of the codebase).
3. **Business rule enforced server-side, not just in the wizard's UI flow**: rejects if the user already has an active plan (`getActivePlan(userId)`) — "finish or archive it first." Also re-verifies the user is actually enrolled in the chosen `courseSlug` (never trusts the wizard's own course-picker state).
4. Inside a transaction: inserts the `learningPlans` row, then all of its `learningPlanConcepts` in one batch insert, with `sortOrder` taken from the submitted array's index — so concept ordering is exactly what the wizard displayed, encoded as a column rather than re-derived later.
5. From here, `/panel/plan` renders `<PlanDashboard />` instead of the wizard (see [`11-pages-panel-core.md`](./11-pages-panel-core.md)) — daily progress comes from `getPlanProgress()` (`src/server/planner/progress.ts`), and logging study time (`logStudySessionAction`) or toggling a concept done (`toggleConceptAction`) are the two ongoing-interaction actions once a plan exists.

**Files**: `src/actions/planner.ts`, `src/server/planner/{catalog,engine,progress}.ts`.

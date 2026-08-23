# Business Flow: AI Tutor / RAG Chat

[← Back to index](./README.md)

Everything here funnels through one Server Action, `askRagQuestion` (`src/actions/rag-actions.ts:142`), the most central piece of orchestration in the app — see [`00-architecture.md`](./00-architecture.md)'s subsystem map. This doc traces it branch by branch, since it is genuinely one function with several distinct user-facing flows inside it.

## Shared entry gate (every branch below passes through this first)

1. If the client sent a `jobId`, `createJob(jobId)` (`src/server/progress-store.ts`) opens a progress job — the client is already subscribed to `GET /api/rag/progress?jobId=...` (SSE, see [`14-api-routes.md`](./14-api-routes.md)) and will render each `progressStep(...)` call below as a live status line.
2. Auth check, **premium gate** (the AI tutor is a premium-only feature — `checkPremiumAccessAction()`), rate limit (`rag:query`). Any failure here calls `errorJob(jobId, ...)` so the SSE stream terminates cleanly instead of hanging.
3. Validates the raw form fields (`question`, `cellId`, optional `searchTopic`/`command`/`commandCount`) against `RagQuerySchema`.
4. `parseMcpCommands(question, { commandsEnabled })` (`src/helpers/parse-mcp-commands.ts`) extracts, from the raw question text: a leading `/command` if typed, any `@resource` mentions, and a "clean" question with those stripped out. **A command chip from the UI palette wins over a typed `/command`** — both converge on the same `tools` array, so downstream logic doesn't care which surface it came from.
5. Command-count resolution: `resolveCommandCount(commandSpec, rawCount)` (`src/helpers/resolveCommandCount.ts`) takes either the palette's explicit `commandCount` field or a leading number parsed out of the question text (`extractLeadingCount`), and clamps it against the command's own spec. The inline comment explains why this matters: leaving count-extraction to the dispatch model turned "10 pytań" into 5 when the model silently under-counted — resolving it deterministically in code closes that gap.
6. An unrecognized `/command` with no other tool selected fails fast with the list of valid commands, rather than silently falling through to a free-form answer where the model might invent tool arguments on its own.

From here the function branches into one of four flows:

---

## Flow A — `/command` execution (e.g. `/utworz_test`, `/mapa_mysli`, `/wyklad`)

1. Resolves the command against `TOOL_COMMANDS` (`src/constants/toolCommands.ts`) → `TOOL_DEFINITIONS` (`src/server/tools/definitions.ts`).
2. **Resolves any `@resource` mentions first** (`resolveDisplayNameToUri` → `fetchResourceContent`), splitting results into plain text (concatenated into `additionalContext`) vs. PDF files (kept as base64 for direct model input) — see [`14-api-routes.md`](./14-api-routes.md) → `/api/mcp/resources` for where the resource list itself comes from.
3. **Builds the tool's input content in two labeled tiers**, in this priority order:
   - `=== GŁÓWNE ŹRÓDŁO (wybrane przez użytkownika) ===` — the user's `@resource`, if any. This is the Attachments tier from root `CLAUDE.md` → Data Sources: primary, not sampled.
   - `=== DODATKOWE INFORMACJE (z bazy wiedzy) ===` — corpus chunks from `retrieveContext({ mode: 'canonical_only' })`, but **only fetched if the user did not already attach their own resource** — the inline comment calls the extra RAG round-trip "pure waste" once a primary source is already provided. `canonical_only` here specifically excludes the student's personal library — a generator building study material (a test, a mind map) built partly on the student's own possibly-wrong note would be "indistinguishable from material built on the curriculum," which the source-tier rule exists to prevent.
4. **`requiresSource` enforcement** (root `CLAUDE.md`'s "No source, no output" rule, made executable): if the resolved `command.requiresSource` is true and there's no grounded content at all (no corpus hit, no attachment, no PDF), the action **stops and tells the student** rather than letting the dispatch call invent a subject from nothing — the inline comment notes the dispatch call forces a function call, so a source-required tool handed an empty prompt would otherwise fabricate one.
5. Calls `executeToolWithContent(toolName, toolDefinition, { request, content, pdfFiles, overrideArgs })` (`src/server/vertex-rag/generate.ts:116` — corrected this round; an earlier pass of this doc hedged with "`index.ts` or `executor.ts`," neither of which is actually right) — the actual model call.
6. **Shortfall handling**: if the tool returned fewer items than requested (`generated.shortfall > 0`), the success message says so explicitly ("Utworzono 7 z 10") instead of silently returning a partial result — per the same "no source, no output" honesty principle applied to partial generations.
7. Returns the generated payload in `FormState.values` (`answer`, `toolResults`) for the calling cell to render — `FormState.message` stays a short human status line (what `useToastMessage` shows), while the actual generated content is data, not toast text.

## Flow B — Self-state questions ("jak mi idzie z farmakologią?", "co powinienem powtórzyć?")

1. Only reached if the student didn't attach their own resource (`@resource`/PDF).
2. `classifyTutorIntent(cleanQuestion)` uses a constrained Flash-Lite JSON response to classify the information required as `self_state`, `medical_question`, or `ambiguous`. It does not extract or rewrite the RAG query. If classification is unavailable, the existing RAG path remains the availability fallback.
3. `self_state` calls `buildSelfStateContext(userId)`, which returns an explicit `ready`, `empty`, or `unavailable` state. `ready` is answered by `answerFromMemory` from typed memory alone; `empty` and `unavailable` return honest fixed responses. None of these outcomes consults the corpus or displays source chips.
4. `medical_question` continues through Flow C unchanged. `ambiguous` instructs the student to send a complete standalone question instead of guessing. Memory answers are complete and actionable; they never end with a question or invite a contextual follow-up, because prior turns are not yet sent back to the server.

## Flow C — Free-form question (the conversational tutor)

The default path when there's no command and it's not a self-state question.

1. **Memory assembly, both halves, both fail-safe** (return `''` if memory is unavailable rather than erroring the whole answer):
   - `buildStaticPrefix(userId)` — active policies + preferences, the cacheable static prompt prefix (Path A memory, per root `CLAUDE.md`).
   - `buildMemoryTail(userId, question)` — retrieved facts + recent episodes relevant to this question, the volatile tail (Path B memory).
2. **Retrieval mode decision**: `hasAttachment` (an `@resource` or PDF was provided) picks `mode: 'explicit_resource'` (whole source, no sampling); otherwise `mode: 'canonical_with_personal'` (corpus + the student's own library, fused). **The query sent to retrieval is `searchTopic || cleanQuestion`** — a separate, subject-only field the UI can populate distinctly from the conversational question text, because (per Retrieval Rule #2 in root `CLAUDE.md`) prose wrappers measurably hurt corpus-match quality. Memory and attachments are never part of the retrieval query — they ride along in the generation prompt instead.
3. **The "no source, no output" gate**: if `!context.hasCanonical && context.chunks.length === 0` — nothing from the curriculum and nothing the student attached — the action returns `getNoDataFoundMessage()` (`src/helpers/rag-prompts.ts`) instead of letting the model answer from its own pretrained knowledge. This is the single most load-bearing check in the whole function for the "don't hallucinate curriculum content" guarantee.
4. `generateGroundedAnswer(question, context, { userContext, memoryTail, memoryPrefix })` (`src/server/vertex-rag/generate.ts`) — the actual grounded generation call, with memory folded in as prompt context (never as retrieval input, never as evidence — per Data Sources tier 4).
5. Returns `{ answer, sources }` — `sources` come from `context.sources` (deduped `{label, origin}` pairs from `retrieveContext()`), rendered by the client as the visible source chips; the model's own text is never trusted to self-cite (Retrieval Rule #5 — `stripContextCitations` is the backstop if it tries).

## Flow D — Generated lecture (a related, separate action)

`generateLectureAction(planContent, jobId)` (`:537`) is a sibling action, not a branch of `askRagQuestion`, but shares its plumbing:

1. Premium-gated, rate-limited (`lecture:generate`).
2. **Dedup by content hash**: `sha256(planContent)` looked up via `getLectureByHash(userId, hash)` — if this exact lecture content was already generated for this user, the existing `lectures` row is returned immediately (audio URL + transcript) rather than regenerating (and re-billing) an identical script.
3. Otherwise: `retrieveContext({ mode: 'canonical_only' })` grounds the lecture script the same way a generated test does — "a lecture is study material, so it is built on the curriculum alone," per the inline comment — then generates a spoken-style script and (implied by the surrounding code, not shown above) synthesizes audio and persists it via `saveLectureInternal()` (`src/actions/lectures.ts`, see [`21-server-actions.md`](./21-server-actions.md)).

---

## Progress streaming, throughout every flow above

Every branch calls `progressStep(jobId, stage, percent, userMessage, logCategory, technicalDetail)` at each meaningful step (parsing → resolving/fetching resources → searching → calling a tool/generating → finalizing). This writes to the same job the client is already listening to via SSE (`GET /api/rag/progress`), giving the UI a live "Przeszukuję bazę wiedzy... → Generuję zawartość z AI... → Gotowe" sequence rather than a single opaque loading spinner for what can be a multi-second, multi-step operation. `completeJob`/`errorJob` terminate the stream on success/failure respectively — see [`14-api-routes.md`](./14-api-routes.md) for the SSE mechanics and [`22-hooks.md`](./22-hooks.md) → `useRagProgress` for the client side.

**Files**: `src/actions/rag-actions.ts`, `src/server/retrieval/context.ts`, `src/server/vertex-rag/`, `src/server/memory/` (`gate.ts`, `assemble.ts`, `classifyTutorIntent.ts`), `src/helpers/{parse-mcp-commands,resolveCommandCount,extractLeadingCount,resolveTutorRoute,rag-prompts,formatContextChunks}.ts`, `src/server/progress-store.ts`, `src/constants/{toolCommands,memoryMessages}.ts`.

---

## How to add a new `/command` (previously undocumented — surfaced by a round-6 onboarding-style doc test)

Every doc in this set mentions pieces of the command system, but none assembled them into a checklist, and doing so surfaced the file-location error fixed above. Adding a new `/command` (e.g. `/przyklad`) touches exactly **three** files, in this order:

1. **`src/constants/toolCommands.ts`** — add an entry to `TOOL_COMMANDS`: `name` (the slash word), `toolName` (must match the `TOOL_DEFINITIONS` entry below), `label`/`description`/`example` (UI copy), `requiresSource` (true for anything that produces study material — see root `CLAUDE.md`'s "No source, no output" rule), optionally `count` (if the command produces a numbered set of things — see `utworz`/`fiszka` for the pattern: `{ param, label, defaultValue, min, max }`) and `hiddenFromPalette` (keeps it slash-only, out of the chip row — the only current use is `wyklad`, which is triggered from `PlanCellPreview` rather than typed). This file's own header comment states the reason it's the single source of truth: "all three [routing, chip palette, slash autocomplete] read this list, so a command cannot exist in one surface and be missing from another." `TOOL_COMMAND_NAMES`, `TOOL_COMMAND_LIST`, and `PALETTE_COMMANDS` are all derived from this object — nothing else to touch here.
2. **`src/server/tools/definitions.ts`** — add a matching entry to the `TOOL_DEFINITIONS` array: `name` (= the `toolName` from step 1), a natural-language `description` (this is what the model reads to decide when/how to call it), and a JSON-schema `parameters` object (`type: 'object'`, `properties`, `required`). This is the model-facing function-calling schema — a structurally different shape from `TOOL_COMMANDS`, not a duplicate of it.
3. **`src/server/tools/executor.ts`** — add a `case '<toolName>':` to the `switch (toolName)` dispatch (line ~162) that calls whatever generation logic actually produces the content (a new function, or reuse of an existing generator).

A command that skips step 1 is reachable by nothing (no chip, no autocomplete, no dispatch target — `askRagQuestion`'s "unknown command" error fires, see Flow A above). A command that skips step 2 will fail at the model call, since the dispatcher can't function-call a tool it was never told about. A command that skips step 3 will validate and dispatch, then hit an unhandled `switch` case server-side. All three are required, and none of them alone is sufficient — worth stating plainly since no single file's comments make that dependency explicit.

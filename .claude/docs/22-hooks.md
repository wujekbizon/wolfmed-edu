# Custom Hooks Catalog

[← Back to index](./README.md)

All 60 files in `src/hooks/`. Grouped by domain. Note the naming collision: `src/hooks/useStore.ts` (a generic hydration-safe Zustand selector wrapper, `useStore(store, callback)` — delays returning the selected value until after mount to avoid SSR/CSR hydration mismatch) is a different thing from `src/store/useStore.ts` (an actual Zustand store instance — see [`27-state-stores.md`](./27-state-stores.md)). Import paths disambiguate them (`@/hooks/useStore` vs `@/store/useStore`), but the shared name is a trap when skimming imports.

## Forms & mutations

| Hook | Purpose |
|---|---|
| `useOnFormSuccess(state, onSuccess)` | Fires a callback once a `useActionState` result transitions to `SUCCESS` — the standard way to close a modal/reset UI after a form submit succeeds. |
| `useInvalidateOnSuccess(state, queryKeys)` | Same trigger, but invalidates React Query cache keys instead of calling a callback — keeps server-fetched lists in sync after a mutation. |
| `useToastMessage.tsx` | Exports `showToast(status, message)` plus the hook that renders `state.message` as a toast and returns the no-JS `<noscript>`-safe fallback markup — this is the `noScriptFallback` used in every canonical form. |

## Test-taking & timers

| Hook | Purpose |
|---|---|
| `useCountdown(initialTime)` | Generic countdown timer primitive. |
| `useCountdownTestTimer({ durationMinutes, warningThresholdSeconds })` | Test-session-specific countdown built on top of it, with a low-time warning state. |
| `useSessionHeartbeat(sessionId)` | Periodically calls `POST /api/session/heartbeat` while a test is active (see [`14-api-routes.md`](./14-api-routes.md)). |
| `useBeaconCleanup(sessionId)` | Fires `POST /api/session/expire` via `navigator.sendBeacon` on unload/navigation-away, so an abandoned session is marked expired immediately rather than waiting for the cron sweep. |
| `useGeneratedTest.tsx(tests, numberTests)` | Drives the in-progress answer state for a test-taking session. |
| `useSortedTests(tests)` | Client-side sort for completed test results. |
| `useQuestionsQuery({ questions, searchQuery, currentPage, questionsPerPage })` | React Query-backed search/paginate over a question list — the pattern Golden Rule #5 requires. |

## Diagnozy

| Hook | Purpose |
|---|---|
| `useDiagnozyExam()` | Drives the diagnozy practice-exam runner state machine. |
| `useWypelnijForm(diagnoza, alreadyCompleted)` | Drives the "fill in the nursing process" exercise form state. |

## Procedures / challenges / quizzes

| Hook | Purpose |
|---|---|
| `useGeneratedQuiz(initialQuiz)` | State for an AI-generated procedure-challenge quiz in progress. |

## Notes, editor & rich text

| Hook | Purpose |
|---|---|
| `useNoteEditor()` | Lexical editor state/wiring for the note editor. |
| `useEditorToolbar()` | Toolbar button state for the Lexical editor (active formatting marks, etc.). |
| `useTextSelection(isStudyMode)` | Tracks the user's text selection (used to trigger "explain this" / attach-to-mind-map actions in study mode). |

## Flashcards

| Hook | Purpose |
|---|---|
| `useFlashcardDecks(initialDecks)` | List/CRUD state for a user's flashcard decks. |
| `useNoteFlashcardDeck(noteId, initialDeck?)` | The specific deck derived from one note. |
| `useFlashcardCell(cellContent)` | Flashcard rendering/interaction inside a "cell" (board widget). |

## Mind maps & diagrams (Excalidraw / `@xyflow/react`)

| Hook | Purpose |
|---|---|
| `useMindMapCanvas({...})` | Core canvas state for the mind-map editor. |
| `useMindMapFocus(nodes)` | Focus/highlight state when navigating mind-map nodes. |
| `useAttachExplanationToMindMap({...})` | Wires the tutor's explanation output into a mind-map node. |
| `useInsertGeneratedCell()` | Inserts an AI-generated result as a new board cell. |
| `useMermaidScene({...})` | Converts/manages a Mermaid diagram scene (see `@excalidraw/mermaid-to-excalidraw`). |
| `useDiagramCamera(excalidrawAPI)` | Camera/viewport control for the Excalidraw canvas. |
| `useDiagramFocus({...})` | Focus a specific diagram element. |
| `useDiagramPersistence(cellId, sourceRef)` | Saves/loads diagram state to/from its owning cell. |
| `useDiagramSelection()` | Tracks selected diagram elements. |
| `useDiagramViewport({...})` | Viewport/pan/zoom state. |
| `useCanvasChrome({...})` | Chrome/UI-frame state around a canvas (toolbars, panels). |

## AI tutor chat / RAG UI

| Hook | Purpose |
|---|---|
| `useRagAutoSubmit({...})` | Auto-submits a tutor query under certain trigger conditions (e.g. arriving with a pre-filled question). |
| `useRagCellConversation({ cell, state, isPending })` | Conversation state for a chat "cell" on the board. |
| `useRagCellInput()` | Input box state/handlers for a RAG chat cell. |
| `useRagProgress()` | Subscribes to `/api/rag/progress` SSE stream, exposes job progress state — see [`14-api-routes.md`](./14-api-routes.md). |
| `useRagToolResults({ state, cellId })` | Extracts/renders tool-call results from a RAG response. |
| `useCommandAutocompleteInput({...})` | Autocomplete for `/commands` while typing in the tutor input (`TOOL_COMMANDS` — see [`24-constants.md`](./24-constants.md)). |
| `useCommandSelection()` | Selection state for the command-autocomplete dropdown. |
| `useResourceAutocomplete()` / `useResourceAutocompleteInput(resources)` | Autocomplete for `@resource` attachment mentions (see the Attachments tier in `CLAUDE.md` → Data Sources). |
| `useSpeechRecognition(onResult)` | Browser speech-to-text for voice input into the tutor chat. |
| `useStickToBottom({...})` | Keeps a scrollable chat log pinned to the bottom as new messages stream in, unless the user has scrolled up. |

## Media

| Hook | Purpose |
|---|---|
| `useAudioPlayer({ onDurationLoaded })` | Playback state for AI-generated lecture audio. |
| `useVideoPlayer({ onDurationLoaded })` | Playback state for video content (procedure demonstration videos). |

## Planner

| Hook | Purpose |
|---|---|
| `usePlanWizard({...})` | Multi-step state machine for the learning-plan creation wizard (`PlanWizard`). |

## Access / entitlement

| Hook | Purpose |
|---|---|
| `usePremiumAccess()` | Client-side convenience wrapper for premium-gating UI (reads from context/props rather than re-querying the DB — the DB-authoritative check is always `checkPremiumAccessAction` server-side, see [`21-server-actions.md`](./21-server-actions.md)). |

## Generic UI/UX utilities

| Hook | Purpose |
|---|---|
| `useDebouncedValue<T>(value, delay)` (`.tsx`) | Standard debounce — backs every React-Query search input per Golden Rule #5. |
| `useDropdownSelect({...})` | Generic dropdown open/select state. |
| `useInfiniteScroll<T>({ data, itemsPerPage, threshold, delay })` | Generic infinite-scroll pagination over an in-memory list. |
| `useScroll(threshold, container?)` | Tracks whether the page/container has scrolled past a threshold (drives the Navbar's shrink/blur-on-scroll effect). |
| `useScrollToTopOnChange(dependency)` | Resets scroll position when a dependency changes (e.g. page/tab switch). |
| `useCarousel({...})` | Embla-carousel wiring (testimonials, etc.). |
| `useSortedForumPosts(posts)` | Client-side forum post sorting. |
| `useProgressState()` | Generic multi-stage progress indicator state. |

## Decorative / landing-page animation

| Hook | Purpose |
|---|---|
| `useFloatingShapes({...})` | Drives the `FloatingShapes` background decoration. |
| `useRandomPositions(count = 6)` | Random layout positions for decorative elements. |
| `useSparkles(count = 30)` | Sparkle particle animation state. |
| `useSceneReveal(count, once = false)` | `IntersectionObserver`-driven reveal sequencing: returns `{ active, setScene }`, an `active: boolean[]` plus a ref-callback per index (`setScene(index)`), tracking which of `count` scenes currently cross a `0px 0px -25% 0px` root-margin line. `once` latches an item on permanently rather than toggling it off on scroll-back — needed for scenes inside a `sticky` column that stops moving once pinned. Used by `PathQuestionList`/`PathShotCollage` (`once=true`, one-shot reveal) and `PathTimeline` (`once=false`, tracks which step is centered while pinned — see `useHorizontalPath` below). |
| `useHorizontalPath(count)` | Drives `PathTimeline`'s pin-and-scroll horizontal step track (`/kierunki/[slug]` career-path timeline). Returns `{ section, viewport, track, percent, near, height, pinned }` — three refs to attach to the section/viewport/track elements, `percent` (0–100, via `clampPercent` — see [`25-helpers.md`](./25-helpers.md)) for the progress bar, `near: boolean[]` for which step is centered, and `height`/`pinned` for the scroll-jacked layout. Writes the track's `transform` directly on scroll/resize (rAF-throttled) rather than through state, and falls back to a plain vertical list below the `xl` breakpoint (`height: null`, `pinned: false`, progress computed from the section's own scroll position instead of track travel). |
| `useWigglyText(text, startIdx = 1)` | Per-character "wiggle" animation for hero/marketing text. |

# Optimizations

A running log of performance and correctness improvements across the codebase.

---

## `useSparkles` hook — 2026-03-10

**File:** `src/hooks/useSparkles.ts`

### 1. Unnecessary `useCallback` on a module-level candidate

**Problem:** `getRandomColor` was wrapped in `useCallback([])` even though it has no dependencies and is only ever called inside `useEffect`. Same anti-pattern as `useFloatingShapes` — `useCallback` is only useful when a stable reference is needed for child props or as an effect dependency that would otherwise re-trigger. Here it just added indirection.

**Fix:** Promoted to a plain module-level function. `getRandomColor` is now a stable reference by definition (module scope), so `[count]` is the only `useEffect` dependency — accurate and minimal.

### 2. `colors` array allocated inside the function on every call

**Problem:** The `colors` array was defined inside `getRandomColor`, meaning a new 3-element array was heap-allocated on every call — once per sparkle, per `count` change.

**Fix:** Extracted to a module-level `SPARKLE_COLORS` constant. The same array is reused across all calls.

### 3. Dead `||` fallback on color lookup

**Problem:** `colors[Math.floor(Math.random() * colors.length)] || 'rgba(248, 113, 113'` — the index is always 0, 1, or 2 on a 3-element array, so the lookup is never `undefined`. The fallback is unreachable dead code.

**Fix:** Removed the fallback entirely.

---

## `useSortedTests` hook — 2026-03-10

**File:** `src/hooks/useSortedTests.ts` (renamed from `.tsx`)

### 1. Wrong file extension

**Problem:** The hook contained no JSX but used a `.tsx` extension. `.tsx` enables the JSX transform and slightly increases compile overhead for no reason.

**Fix:** Renamed to `.ts`.

### 2. Missing `useMemo`

**Problem:** The sort ran on every render regardless of whether `tests` or `sortOption` changed — same issue as `useSortedForumPosts`.

**Fix:** Wrapped in `useMemo([tests, sortOption])`.

### 3. `switch` inside the sort comparator — wasteful Date construction for score sorts

**Problem:** The `switch` was placed inside the `.sort()` comparator, and `dateA`/`dateB` were computed via `new Date()` at the top of the comparator on every comparison — including for `scoreAsc` and `scoreDesc` where those values are never used. With N tests, every comparison wasted two `Date` constructions even when sorting by score.

**Fix:** Moved the `switch` outside the comparator. Score sorts now have zero Date construction. Date sorts use the Schwartzian transform (pre-compute once in O(N), sort on numbers).

### 4. Duplicate fallback string literal extracted to constant

**Problem:** `'1970-01-01T00:00:00Z'` appeared twice (once for `dateA`, once for `dateB`) as an inline string. Duplication is a maintenance hazard.

**Fix:** Extracted to a module-level `FALLBACK_DATE` constant.

---

## `useSortedForumPosts` hook — 2026-03-10

**File:** `src/hooks/useSortedForumPosts.ts`

### 1. Missing `useMemo`

**Problem:** The sort ran on every render regardless of whether `posts` or `sortOption` changed. For a page with many posts, this means a full array copy + sort on every unrelated re-render.

**Fix:** Wrapped the entire `switch` in `useMemo([posts, sortOption])`. The sort now only recomputes when the data or the sort option actually changes.

### 2. `Math.max(...array.map(...))` in `recent_activity`

**Problem:** The spread operator (`...`) passes all comment timestamps as individual arguments to `Math.max`. JavaScript has a call stack argument limit — on a post with thousands of comments this would throw a `RangeError: Maximum call stack size exceeded`. It also creates an intermediate mapped array.

**Fix:** Replaced with `reduce`, which iterates in O(N) with no intermediate array and no stack risk:

```ts
p.comments.reduce(
  (max, c) => Math.max(max, new Date(c.createdAt).getTime()),
  new Date(p.createdAt).getTime(),
)
```

### 3. `new Date()` called inside sort comparator (`newest` / `oldest`)

**Problem:** The sort comparator called `new Date(x.createdAt).getTime()` for both `a` and `b` on every comparison. With N posts, a sort does O(N log N) comparisons, meaning the same post's Date object is constructed multiple times across separate comparisons.

**Fix:** Applied the Schwartzian transform — pre-compute timestamps once per post in O(N), sort by the pre-computed numbers, then extract the posts:

```ts
[...posts]
  .map((p) => ({ p, t: new Date(p.createdAt).getTime() }))
  .sort((a, b) => b.t - a.t)
  .map(({ p }) => p)
```

Total Date constructions drops from O(N log N) to O(N). Same pattern applied to `recent_activity`.

---

## `useEditorToolbar` hook — 2026-03-09

**File:** `src/hooks/useEditorToolbar.ts`

### 1. Split `lexical` imports merged

**Problem:** `lexical` was imported in two separate `import` statements — one on line 3 and another on line 7. This is redundant noise with no functional difference.

**Fix:** Merged into a single import block.

### 2. `$getNearestNodeOfType` called 3× with identical arguments

**Problem:** Inside the `registerUpdateListener` callback, `$getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)` was called three times in a row — once per heading level — with the exact same arguments. Each call walks the node tree upward, doing the same work three times.

**Fix:** Called once, stored in `headingNode`, then derived `headingTag` from it. All three heading checks now just compare against `headingTag`.

```ts
const headingNode = $getNearestNodeOfType(selection.anchor.getNode(), HeadingNode)
const headingTag = headingNode?.getTag()
// ...
h1: headingTag === 'h1',
h3: headingTag === 'h3',
h5: headingTag === 'h5',
```

### 3. Missing `useCallback` on all three returned functions

**Problem:** `formatText`, `formatHeading`, and `handleCommand` were plain functions recreated on every render. They are passed as props to toolbar button components, so those components received new references every render and could not bail out.

**Fix:** All three wrapped in `useCallback([editor])`. The `editor` instance is stable for the lifetime of the `LexicalComposer`, so in practice these callbacks are created only once.

### 4. Selection lost after heading toggle (runtime error)

**Problem:** Both branches of `formatHeading` orphaned the selection's anchor/focus nodes:
- `headingNode.replace($createParagraphNode())` — created a new empty paragraph and swapped it in; the selection's anchor/focus still pointed to `TextNode` instances that were children of the *old* heading, which was now removed from the tree.
- `selection.insertNodes([$createHeadingNode(tag)])` — inserted a new heading at the selection point but did not migrate the existing text content into it, leaving the old block in place and the new one empty.

Lexical detected the orphaned nodes and emitted: *"updateEditor: selection has been lost because the previously selected nodes have been removed and selection wasn't moved to another node."*

**Fix:** Before calling `.replace()`, migrate every child from the old block into the new block. Because we move the *same* `TextNode` objects (not copies), the selection's anchor/focus references remain valid after the swap. Both toggle directions now share a single path:

```ts
const anchorNode = selection.anchor.getNode()
const existingBlock =
  $getNearestNodeOfType(anchorNode, HeadingNode) ??
  anchorNode.getTopLevelElementOrThrow()
const isActive = $getNearestNodeOfType(anchorNode, HeadingNode)?.getTag() === tag

const newBlock = isActive ? $createParagraphNode() : $createHeadingNode(tag)

existingBlock.getChildren().forEach((child) => newBlock.append(child))
existingBlock.replace(newBlock)
```

---

## `useSpeechRecognition` hook — 2026-03-09

**Files:** `src/hooks/useSpeechRecognition.ts`, `src/components/editor/speech/SpeechToTextButton.tsx`

### 1. Moved from component-local to `src/hooks/`

The hook lived at `src/components/editor/speech/useSpeechRecognition.ts` alongside a component. Hooks belong in `src/hooks/`. The associated type definitions were moved to `src/types/speechTypes.ts`.

### 2. `onResult` as a `useEffect` dependency caused the handler effect to re-run every render

**Problem:** `onResult` was listed in the `useEffect` dep array that attaches `onresult`/`onerror` to the recognition instance. In `SpeechToTextButton`, `handleResult` was an inline arrow function — a new reference every render — so the effect re-ran on every render, re-attaching event handlers unnecessarily.

**Fix:** Store `onResult` in a `useRef` updated synchronously on each render. The event handler reads from the ref, so it always calls the latest version without `onResult` being a dependency.

```ts
const onResultRef = useRef(onResult)
onResultRef.current = onResult
// effect dep array: [isListening, speechRecognition] — no onResult
```

### 3. Visible delay — only `isFinal` results were shown

**Problem:** The hook called `onResult` only when `lastResult.isFinal === true`. Interim results fire continuously while the user speaks, but were discarded. The user saw nothing until the browser finalised the segment (~1–2 seconds of silence).

**Fix:** The hook now emits on every result with a boolean flag: `onResult(transcript, isFinal)`. `SpeechToTextButton` tracks how many interim characters are currently in the editor (`interimLengthRef`). On each new result it extends the selection anchor backward by that amount — selecting the old interim text — then calls `insertText`, which replaces the selection with the new transcript in one operation. On a final result the trailing space is appended and `interimLengthRef` is reset to `0`.

```ts
// Extend anchor backward to cover previous interim text
if (interimLengthRef.current > 0) {
  const anchor = selection.anchor
  selection.anchor.set(anchor.getNode().getKey(), anchor.offset - interimLengthRef.current, 'text')
}
selection.insertText(isFinal ? transcript + ' ' : transcript)
interimLengthRef.current = isFinal ? 0 : transcript.length
```

### 4. `handleResult` in `SpeechToTextButton` wrapped in `useCallback`

Was an inline function passed directly to the hook. Now wrapped in `useCallback([editor])` — stable reference, and the ref pattern in the hook means it doesn't need to be a dep there either.

### 5. `stopListening` dependency removed via inlining

`stopListening` was defined above the handler effect but depended on `speechRecognition`, which was already a dep. Inside `handleError` it was called instead of directly calling `speechRecognition.stop()` + `setIsListening(false)`. Removed `stopListening` from the dep array by inlining those two calls directly in `handleError`.

---

## `useDebouncedValue` hook — 2026-03-09

**File:** `src/hooks/useDebounceValue.tsx`

### Removed redundant `prevValue` state

**Problem:** The hook tracked a `prevValue` state variable solely to guard against re-running the debounce timer when the value hadn't changed. This introduced an extra `setState` call and an extra `useEffect` run after every debounce fire — `setPrevValue(value)` would trigger the effect again, which would then early-return via `if (value === prevValue) return`.

**Fix:** Removed `prevValue` state and the guard entirely. The cleanup-based timer pattern already handles this correctly: `value` and `delay` are the only deps, so the effect only runs when the input actually changes. When the timer fires it calls `setDebouncedValue(value)`, which does not re-trigger the effect because `debouncedValue` is not in the dep array. React's same-reference bailout also ensures no re-render occurs if the value is unchanged.

```ts
// Before — extra state, extra re-render, extra effect run after every debounce
const [prevValue, setPrevValue] = useState<T>(value)
useEffect(() => {
  if (value === prevValue) return
  const timer = setTimeout(() => {
    setDebouncedValue(value)
    setPrevValue(value)
  }, delay)
  return () => clearTimeout(timer)
}, [value, delay, prevValue])

// After — minimal, correct
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), delay)
  return () => clearTimeout(timer)
}, [value, delay])
```

---

## `useAudioPlayer` hook — 2026-03-09

**File:** `src/hooks/useAudioPlayer.ts`

### 1. Stable `useEffect` deps via callback ref

**Problem:** `onDurationLoaded` was listed as a `useEffect` dependency. If the parent passes an inline function, it creates a new reference on every render, causing the effect to re-run and re-attach all audio event listeners each time.

**Fix:** Store the callback in a `useRef` and update it on every render. The effect now has a stable `[]` dependency array and only runs once on mount.

```ts
const onDurationLoadedRef = useRef(onDurationLoaded)
onDurationLoadedRef.current = onDurationLoaded
// inside effect:
onDurationLoadedRef.current?.(audio.duration)
```

### 2. Read `audio.duration` from DOM ref, not state

**Problem:** `handleSkipForward` clamped against the `duration` state variable, which required it as a `useCallback` dependency. State can lag behind the real value, so under rapid seeks the clamp could be slightly off.

**Fix:** Read `audio.duration` directly from the DOM element — it's always the live value — so the dep array becomes `[]`.

---

## `useBeaconCleanup` hook — 2026-03-09

**File:** `src/hooks/useBeaconCleanup.ts`

### Use `Blob` with explicit `Content-Type` in `sendBeacon`

**Problem:** Passing a raw `JSON.stringify(...)` string to `navigator.sendBeacon` sends the payload as `text/plain;charset=UTF-8`. Some server middlewares and edge runtimes fail to parse the body because the `Content-Type` does not match `application/json`.

**Fix:** Wrap the payload in a `Blob` with `type: 'application/json'` so the correct content-type header is sent with the beacon request.

```ts
navigator.sendBeacon(
  '/api/session/expire',
  new Blob([JSON.stringify({ sessionId })], { type: 'application/json' })
)
```

> **Note:** Session expiry only works correctly in production builds. In development, sessions expire immediately — always test with `pnpm build && pnpm start`.

---

## `useSessionHeartbeat` hook — 2026-03-09

**File:** `src/hooks/useSessionHeartbeat.ts`

### Use `Blob` with explicit `Content-Type` in cleanup `sendBeacon`

**Problem:** Same as `useBeaconCleanup` — the cleanup beacon on effect teardown used a raw string, sending the wrong `Content-Type`.

**Fix:** Wrapped the payload in a `Blob` with `type: 'application/json'`.

```ts
navigator.sendBeacon(
  '/api/session/expire',
  new Blob([JSON.stringify({ sessionId })], { type: 'application/json' })
)
```

> **Note:** Session expiry only works correctly in production builds. In development, sessions expire immediately — always test with `pnpm build && pnpm start`.

---

## `useCarousel` hook — 2026-03-09

**File:** `src/hooks/useCarousel.ts`

### 1. Event listener memory leak

**Problem:** The hook registered two Embla listeners — `"select"` and `"pointerDown"` — inside a `useEffect` but never removed them when the effect cleaned up. Every time the effect re-ran (e.g. when `emblaApi` or `onSelect` changed), a new pair of listeners was added on top of the old ones. Over the component's lifetime this caused stale callbacks to accumulate in memory and fire multiple times per event.

**Fix:** Store the `pointerDown` handler in a local variable so it can be passed to both `on` and `off`, then return a cleanup function that removes both listeners.

### 2. `|| 0` operator bug on index

**Problem:** `emblaApi?.selectedScrollSnap() || 0` evaluates to `0` when the selected index *is* `0`, because `0` is falsy. This means sliding to the first slide would set `selected` to `0` correctly by accident, but if the API ever returned any other falsy-ish value the logic would silently break. More importantly it signals the wrong intent to anyone reading the code.

**Fix:** Replaced with the nullish coalescing operator `?? 0`, which only falls back to `0` when the value is `null` or `undefined`, not when it is a legitimate `0`.

### 3. Redundant `setSelected` in `scrollTo`

**Problem:** `scrollTo` called `setSelected(index)` manually right after calling `emblaApi.scrollTo(index)`. Embla fires a `"select"` event as part of `scrollTo`, which already triggers the `onSelect` callback, which already calls `setSelected`. The manual call was a double-update that caused an unnecessary extra render.

**Fix:** Removed the manual `setSelected(index)` from `scrollTo`. State is now updated solely through the `"select"` event listener, keeping a single source of truth.

### 4. Autoplay interval resetting on emblaApi change

**Problem:** The autoplay `setInterval` listed `scrollNext` in its dependency array. `scrollNext` is a `useCallback` that depends on `emblaApi`. When `emblaApi` initialises (changing from `undefined` to the live API object), `scrollNext` gets a new reference, which triggers the interval effect to tear down and re-create the timer — resetting the countdown mid-cycle.

**Fix:** Stored `emblaApi` in a `useRef` that is kept current via a dedicated synchronising effect. The interval now calls `emblaApiRef.current?.scrollNext()` directly, removing `scrollNext` from the dependency array entirely. The timer is now only ever reset when `isPlaying` or `autoplayDelay` genuinely change.

### 5. Default options object recreated each render

**Problem:** The default value for the `options` parameter was written as an object literal inside the function signature. JavaScript evaluates default parameter values on every call, so a brand new object was allocated on every render when no `options` prop was passed.

**Fix:** Extracted the defaults to a module-level `DEFAULT_OPTIONS` constant. The same object reference is reused across all renders, which also avoids `useEmblaCarousel` seeing a "new" options object and potentially re-initialising the carousel.

---

## `useCommandAutocompleteInput` hook — 2026-03-09

**File:** `src/hooks/useCommandAutocompleteInput.ts`

### 1. `filteredCommands` not memoized

**Problem:** `COMMANDS.filter(...)` ran inline on every render. Arrow-key navigation updates `commandSelectedIndex`, which triggers a re-render, which re-ran the filter — even though `commandQuery` had not changed.

**Fix:** Wrapped in `useMemo` with `[commandQuery]` as the only dependency. The filter now only re-runs when the typed query actually changes.

### 2. Missing `useCallback` on exported functions

**Problem:** `handleCommandInputChange`, `handleCommandKeyDown`, and `insertCommand` were plain functions recreated on every render. `insertCommand` is passed directly as the `onSelect` prop to `<CommandAutocomplete>`, so the component received a new function reference every render and could not bail out of re-renders.

**Fix:** All three wrapped in `useCallback` with appropriate dependency arrays. `handleCommandInputChange` has no deps (only calls stable state setters). `insertCommand` depends on `textareaRef` only. `handleCommandKeyDown` depends on `showCommandAutocomplete`, `filteredCommands`, `commandSelectedIndex`, and `insertCommand`.

### 3. Duplicate Enter / Tab branches

**Problem:** `handleCommandKeyDown` had two identical `else if` blocks — one checking `e.key === 'Enter'` and one checking `e.key === 'Tab'` — with the exact same body: prevent default, read the selected command, call `insertCommand`.

**Fix:** Merged into a single condition: `(e.key === 'Enter' || e.key === 'Tab') && filteredCommands.length > 0`.

### 4. Dead code in slash-detection condition

**Problem:** In `handleCommandInputChange`, when `lastSlashIndex === 0` the ternary already assigns `charBeforeSlash = ' '`, making `charBeforeSlash === ' '` true. The extra `|| lastSlashIndex === 0` clause in the `if` was therefore unreachable — it could never be the reason the condition passed.

**Fix:** Removed the redundant `|| lastSlashIndex === 0` clause, leaving only `charBeforeSlash === ' '`.

### 5. `|| 0` operator bug on `selectionStart`

**Problem:** `textarea.selectionStart || 0` — same pattern as `useCarousel`. `selectionStart` returns `0` when the cursor is at the very start of the text, and `|| 0` treats that as falsy. The result happens to be `0` either way, so it worked by accident, but the intent is wrong.

**Fix:** Replaced with `textarea.selectionStart ?? 0`, which only falls back when the value is `null` or `undefined`.

### 6. Unused type import removed

**Problem:** `import type { Command }` was imported from `@/types/commandTypes` but never referenced in the hook — the array type is inferred from `COMMANDS`.

**Fix:** Import removed.

---

## `useResourceAutocompleteInput` hook — 2026-03-09

**File:** `src/hooks/useResourceAutocompleteInput.ts`

### 1. `filteredResources` not memoized

**Problem:** `resources.filter(...)` ran inline on every render. Arrow-key navigation updates `selectedIndex`, which triggers a re-render and re-ran the filter even though neither `resources` nor `autocompleteQuery` had changed. Unlike the command hook where the list is a static constant, `resources` is a dynamic prop loaded from the API, so both are needed as dependencies.

**Fix:** Wrapped in `useMemo` with `[resources, autocompleteQuery]` as dependencies.

### 2. Missing `useCallback` on all three functions

**Problem:** `handleInputChange`, `handleKeyDown`, and `insertResource` were plain functions recreated on every render. `insertResource` is passed directly as `onSelect` to `<ResourceAutocomplete>`, so the component received a new reference every render and could not bail out of re-renders.

**Fix:** All three wrapped in `useCallback` with appropriate dependency arrays. `handleInputChange` has no deps (only calls stable state setters). `insertResource` depends on `textareaRef` only. `handleKeyDown` depends on `showAutocomplete`, `filteredResources`, `selectedIndex`, and `insertResource`.

### 3. Tab key support added

**Problem:** `handleKeyDown` had no `Tab` case. The command hook (`useCommandAutocompleteInput`) handles Tab to confirm a selection, but the resource hook did not — making the two autocompletes behave inconsistently from the user's perspective.

**Fix:** Added `Tab` alongside `Enter` in a single combined condition: `(e.key === 'Enter' || e.key === 'Tab') && filteredResources.length > 0`.

### 4. `|| 0` operator bug on `selectionStart` — appeared twice

**Problem:** `e.target.selectionStart || 0` in `handleInputChange` and `textarea.selectionStart || 0` in `insertResource` — same recurring pattern. Both return `0` by accident when the cursor is at position `0`, but `||` is semantically wrong here.

**Fix:** Both replaced with `?? 0`.

### 5. Missing synthetic `input` event dispatch in `insertResource`

**Problem:** After inserting a resource name into the textarea via direct DOM mutation, the hook did not dispatch a synthetic `input` event. This meant the parent `handleInputChange` in `RagCellForm` was never notified, leaving any dependent state (e.g. the command autocomplete check) out of sync after insertion. The command hook had this dispatch — the resource hook was missing it.

**Fix:** Added `textarea.dispatchEvent(new Event('input', { bubbles: true }))` at the end of `insertResource`, matching the command hook's behaviour.

---

## `useResourceAutocomplete` hook — 2026-03-09

**File:** `src/hooks/useResourceAutocomplete.ts`

### 1. No AbortController — fetch continued after unmount

**Problem:** The `useEffect` started a `fetch` but had no cleanup function. If the component unmounted before the request completed (e.g. user navigated away), the `fetch` still resolved and called `setResources` / `setError` on an unmounted component, leaking state updates and producing a React warning.

**Fix:** Created an `AbortController` inside the effect, passed its `signal` to `fetch`, and returned `controller.abort()` as the cleanup function. React calls the cleanup on unmount, which cancels the in-flight request automatically.

```ts
const controller = new AbortController();
const res = await fetch('/api/mcp/resources', { signal: controller.signal });
return () => controller.abort();
```

### 2. HTTP errors silently ignored

**Problem:** The code called `res.json()` without checking `res.ok` first. A `500` or `401` response from the API would still reach the JSON parse step, and unless the response body happened to contain a `data.error` field, the error would be silently swallowed and `resources` left empty with no feedback.

**Fix:** Added an explicit `!res.ok` guard that throws before attempting to parse the body, so any HTTP error is caught by the existing `catch` block and surfaced as an error state.

```ts
if (!res.ok) {
  throw new Error(`Request failed: ${res.status}`);
}
```

### 3. Variable shadowing in `catch` block

**Problem:** The `catch` parameter was named `error`, which shadowed the `error` state variable declared in the outer scope. This made the two look interchangeable in a quick read and could cause confusion if the code was extended.

**Fix:** Renamed the catch parameter to `err`. Added an `AbortError` guard so intentional cancellations don't log a spurious console error or update error state.

```ts
} catch (err) {
  if (err instanceof Error && err.name === 'AbortError') return;
  // ...
}
```

---

## `useCountdown` hook — 2026-03-09

**File:** `src/hooks/useCountdown.ts`

### 1. Unnecessary `useCallback` on an internal-only function

**Problem:** `updateTime` was wrapped in `useCallback([])` and then passed to `useEffect([updateTime])`. Because `updateTime` has no dependencies, `useCallback` produces a permanently stable reference — which means `useEffect` effectively has `[]` deps anyway. Since `updateTime` is never returned or passed to any child, memoizing it adds indirection with zero benefit.

**Fix:** Removed `useCallback` entirely. The interval callback is now defined inline inside `useEffect`, which has a clean `[]` dependency array. `useCallback` import removed.

### 2. `let` used for a never-reassigned variable

**Problem:** `totalSeconds` was declared with `let` inside the `setTimeLeft` updater, but the value was computed once and never mutated.

**Fix:** Changed to `const`.

### 3. Interval drift — decrementing state instead of reading wall-clock time

**Problem:** Each tick called `setTimeLeft` with `prevTime - 1 second`. `setInterval` is not perfectly precise — the browser can delay ticks when the tab is hidden, the CPU is busy, or the JS thread is blocked. Over time this causes the displayed countdown to fall behind real elapsed time.

**Fix:** Store the absolute end timestamp in a `useRef` on mount. Each tick computes `remaining = Date.now() - endTimeRef.current` against real wall-clock time, so the displayed value is always accurate regardless of how late any individual tick fires.

```ts
const endTimeRef = useRef(Date.now() + toSeconds(initialTime) * 1000)

setInterval(() => {
  const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
  setTimeLeft(fromSeconds(remaining))
}, 1000)
```

Also extracted `toSeconds` and `fromSeconds` as module-level helpers to keep the interval callback readable.

---

## `SpeechToTextButton` — crash when recording starts with no cursor — 2026-03-09

**File:** `src/components/editor/speech/SpeechToTextButton.tsx`

### Fix: wrong point type when editor has no selection

**Problem:** When the user clicked the microphone button without first clicking into the editor, `$getRoot().getLastDescendant()` returned the empty `ParagraphNode` (key `"1"`). The fallback code called `PointType.set(..., 'text')` on it, which Lexical rejects because text points require a `TextNode`:

```
PointType.set: node with key 1 is paragraph and can not be used for a text point
```

**Fix:** Replaced the manual `$createRangeSelection` / `$setSelection` fallback with `lastChild.selectEnd()`. `ElementNode.selectEnd()` walks to the last descendant text node when one exists (text point), or falls back to an element-type point on itself when the paragraph is empty — always producing a valid selection.

```ts
// Before — crashes on empty editor
const newSelection = $createRangeSelection()
newSelection.anchor.set(lastNode.getKey(), lastNode.getTextContent().length, 'text')
newSelection.focus.set(lastNode.getKey(), lastNode.getTextContent().length, 'text')
$setSelection(newSelection)

// After — handles empty and non-empty correctly
$getRoot().getLastChild()?.selectEnd()
```

Also removed the now-unused `$createRangeSelection` and `$setSelection` imports.

---

## Speech-to-text — punctuation (future improvement)

**Files:** `src/hooks/useSpeechRecognition.ts`, `src/components/editor/speech/SpeechToTextButton.tsx`

The Web Speech API returns raw words with no punctuation. Two options:

**Option A — Word substitution** (simple, no dependencies):
Post-process the transcript in `handleResult` before inserting it. Map spoken words to symbols:

```ts
const PUNCT_MAP: Record<string, string> = {
  'kropka': '.', 'period': '.', 'punkt': '.',
  'przecinek': ',', 'comma': ',',
  'nowa linia': '\n', 'nowy akapit': '\n', 'new line': '\n',
  'pytajnik': '?', 'wykrzyknik': '!',
}

function applyPunctuation(text: string): string {
  return Object.entries(PUNCT_MAP).reduce(
    (t, [word, sym]) => t.replace(new RegExp(`\\b${word}\\b`, 'gi'), sym),
    text
  )
}
```

Call `applyPunctuation(transcript)` before passing to `selection.insertText`. For newlines, use `selection.insertParagraph()` instead of `insertText('\n')` so Lexical creates a proper paragraph node.

**Option B — LLM post-processing** (accurate, adds latency and cost):
On each `isFinal` result, send the transcript to an AI endpoint that restores punctuation, then commit the corrected text. Not worth it unless transcription quality is a priority.

---

## `useFlashcardCell` hook — 2026-03-10

**File:** `src/hooks/useFlashcardCell.ts`

### 1. Double store subscription + `useShallow` infinite loop

**Problem:** The hook originally called `useFlashcardStore(useShallow(...))` for the cards selector and a second bare `useFlashcardStore()` for the actions. The second call subscribed to the entire store, causing a re-render on any state change. A first attempt merged both into one `useShallow` call, but this introduced a new crash:

```
The result of getSnapshot should be cached to avoid an infinite loop
```

Root cause: `useShallow((s) => ({ ...filter... }))` creates a new wrapper function on every render. React's `useSyncExternalStore` (which Zustand uses internally) detects a new snapshot object each call and loops.

**Fix:** Removed `useShallow` entirely. Actions are stable Zustand references — plain individual selectors work without shallow comparison. `cards` (a filtered array — new reference every call) is derived via `useMemo` from the stable `flashcards` array that Zustand returns as a stable reference between unrelated updates.

```ts
// Before — useShallow with inline selector causes infinite loop
const { cards, ... } = useFlashcardStore(
  useShallow((s) => ({
    cards: s.flashcards.filter((f) => f.noteId === cellId),
    updateFlashcard: s.updateFlashcard,
    ...
  })),
)

// After — stable individual selectors + useMemo for derived value
const allFlashcards = useFlashcardStore((s) => s.flashcards)
const updateFlashcard = useFlashcardStore((s) => s.updateFlashcard)
const removeFlashcard = useFlashcardStore((s) => s.removeFlashcard)
const addFlashcardsFromCell = useFlashcardStore((s) => s.addFlashcardsFromCell)

const cards = useMemo(
  () => allFlashcards.filter((f) => f.noteId === cellId),
  [allFlashcards, cellId],
)
```

### 2. `initialized.current` boolean doesn't reset on `cellId` change — bug

**Problem:** The seeding guard was `const initialized = useRef(false)`. Once `initialized.current` was set to `true` on the first render, any subsequent `cellId` change would trigger the effect (because `cellId` is a dep) but immediately bail out via `if (initialized.current) return`. A new cell whose flashcards hadn't been loaded yet would never be seeded.

**Fix:** Changed the ref to track the last initialized `cellId` (`useRef<string | null>(null)`). The guard becomes `if (initializedForRef.current === cellId) return`, which passes for new cell IDs and blocks re-runs for the same one.

```ts
// Before — boolean, doesn't distinguish between cellIds
const initialized = useRef(false)
if (initialized.current) return
initialized.current = true

// After — tracks which cellId was last seeded
const initializedForRef = useRef<string | null>(null)
if (initializedForRef.current === cellId) return
initializedForRef.current = cellId
```

### 3. `addFlashcardsFromCell` read from closure inside effect — stale closure risk

**Problem:** The effect called `addFlashcardsFromCell` from the component closure (i.e. from the render-time value), but `addFlashcardsFromCell` was not listed in the effect's dependency array. Zustand actions are stable in practice, but the lint warning is valid and the pattern is fragile.

**Fix:** Read both the check query and the action directly from `useFlashcardStore.getState()` inside the effect. `getState()` always returns the current store state without creating a subscription, so no dep array entry is needed.

```ts
const existing = useFlashcardStore.getState().flashcards.filter((f) => f.noteId === cellId)
if (existing.length === 0) {
  // ...
  useFlashcardStore.getState().addFlashcardsFromCell(cellId, flashcards, topic)
}
```

### 4. `addCard` not wrapped in `useCallback`

**Problem:** `addCard` was a plain arrow function recreated on every render. If passed as a prop to a child component, the child receives a new reference every render and cannot bail out.

**Fix:** Wrapped in `useCallback([addFlashcardsFromCell, cellId, topic])`.

```ts
const addCard = useCallback(
  (questionText: string, answerText: string) =>
    addFlashcardsFromCell(cellId, [{ questionText, answerText }], topic),
  [addFlashcardsFromCell, cellId, topic],
)

---

## `parseFlashcardContent` helper extracted — 2026-03-10

**Files:** `src/helpers/flashcardCellHelpers.ts`, `src/hooks/useFlashcardCell.ts`

### Moved inline `parseContent` to `/helpers`

`parseContent` was a module-level function defined directly in `useFlashcardCell.ts`. Moved to `src/helpers/flashcardCellHelpers.ts` and exported as `parseFlashcardContent` to follow the project convention of keeping pure utility functions in `/helpers`, making the hook file contain only hook logic.

---

## `FlashcardsSection` — missing remove action — 2026-03-10

**File:** `src/components/FlashcardsSection.tsx`

### Added per-group delete button

**Problem:** The flashcard section displayed groups with only a "Przeglądaj" (review) button. There was no way to remove a group of flashcards from the UI — the store's `removeFlashcard` and `clearFlashcardsByNoteId` actions were never wired to any UI element.

**Fix:** Added a trash icon button to each `FlashcardGroupCard`. `handleRemoveGroup` in the parent uses the most efficient store method per source type:

- `source === 'note'` → `clearFlashcardsByNoteId(group.id)` — single call, removes all cards for that note at once
- `source === 'cell'` → `group.cards.forEach((card) => removeFlashcard(card.cardId))` — cell groups are keyed by topic, not noteId, so individual removal is used

```ts
function handleRemoveGroup(group: FlashcardGroup) {
  if (group.source === 'note') {
    clearFlashcardsByNoteId(group.id)
  } else {
    group.cards.forEach((card) => removeFlashcard(card.cardId))
  }
}
```

---

## `useFlashcardGroups` hook — 2026-03-10

**File:** `src/hooks/useFlashcardGroups.ts`

### `notes.find()` inside a loop — O(n²) lookup

**Problem:** For every flashcard with `source === 'note'`, the `useMemo` body called `notes.find((n) => n.id === card.noteId)` to resolve the group name. `Array.find` is O(n) — with `f` flashcards and `n` notes this is O(f × n) comparisons per memoized computation, and `find` is called once per unique note group (i.e. on the first card seen for each noteId). With 50 cards across 20 notes that's up to 1,000 comparisons per recompute.

**Fix:** Build a `Map<noteId, title>` from the `notes` array once before the loop. Each lookup is then O(1).

```ts
// Before — O(n) scan per group
notes.find((n) => n.id === card.noteId)?.title ?? 'Notatka'

// After — O(1) map lookup
const notesById = new Map(notes.map((n) => [n.id, n.title]))
notesById.get(card.noteId) ?? 'Notatka'
```

---

## `useFlashcards` hook — 2026-03-10

**File:** `src/hooks/useFlashcards.ts`

### 1. `.filter().map()` — two passes, intermediate array

**Problem:** The `useMemo` derived `flashcards` by chaining `.filter()` then `.map()`. This allocates a full intermediate array for the filtered results before mapping it, meaning two full iterations and two heap allocations per recompute.

**Fix:** Replaced with a single `.reduce()` pass. Filters and transforms in one iteration with one output array — no intermediate allocation.

```ts
// Before — two passes, intermediate array
allFlashcards
  .filter((card) => card.noteId === noteId)
  .map((card) => ({ cardId: card.id, ... }))

// After — single pass
allFlashcards.reduce<FlashcardData[]>((acc, card) => {
  if (card.noteId === noteId) {
    acc.push({ cardId: card.id, questionText: card.questionText, answerText: card.answerText })
  }
  return acc
}, [])
```

### 2. Inconsistent selector parameter name

**Problem:** Both store selectors used `state` as the parameter name (`(state) => state.flashcards`) while every other hook in the codebase uses `s` for brevity.

**Fix:** Renamed to `s` for consistency.

---

## `useFloatingShapes` hook — 2026-03-10

**File:** `src/hooks/useFloatingShapes.ts`

### Unnecessary `useCallback` wrapping an effect-only function

**Problem:** `generateShapes` was wrapped in `useCallback` even though it was only ever called inside a `useEffect` — never passed to a child component or memoized for render stability. `useCallback` is only beneficial when a stable function reference is needed to avoid re-rendering children or to satisfy exhaustive-deps in another hook. Here it just added an extra memoization layer and an indirect dependency chain (`useEffect` → `generateShapes` → config values) with no benefit.

**Fix:** Removed `useCallback` and inlined the shape generation directly in the `useEffect` with the raw config values as dependencies. Also removed the now-unused `useCallback` import.

```ts
// Before — pointless useCallback indirection
const generateShapes = useCallback(() => {
  return Array.from({ length: count }, (_, i) =>
    generateShape(i, { minSize, maxSize, minDuration, maxDuration, colors: SHAPE_COLORS })
  )
}, [count, maxDuration, maxSize, minDuration, minSize])

useEffect(() => {
  setShapes(generateShapes())
}, [generateShapes])

// After — direct, flat effect
useEffect(() => {
  setShapes(
    Array.from({ length: count }, (_, i) =>
      generateShape(i, { minSize, maxSize, minDuration, maxDuration, colors: SHAPE_COLORS }),
    ),
  )
}, [count, minSize, maxSize, minDuration, maxDuration])
```

---

## `useGeneratedTest` hook — 2026-03-10

**File:** `src/hooks/useGeneratedTest.tsx`

### 1. Redundant inline comments describing obvious code

**Problem:** Nearly every statement had an inline comment restating what the code already clearly expresses (`// State variable to store generated tests`, `// Generate tests using provided data and number`, `// Return the generated tests array for consumption by components`). These add visual noise without communicating intent or reasoning.

**Fix:** Removed all "what" comments. The JSDoc block already covers usage context.

### 2. JSDoc used `{Type}` braces on `@param` and `@returns`

**Problem:** The JSDoc used `@param {Test[]} tests` style with explicit type annotations in braces. In a TypeScript project the types are already present in the function signature — duplicating them in JSDoc creates a maintenance burden (two places to update on type changes) and is not the project convention.

**Fix:** Removed type braces from all `@param` and `@returns` tags.

### 3. Blank line between JSDoc block and function declaration

**Problem:** An empty line separated the closing `*/` of the JSDoc from the `export function` line, detaching the doc from its target — some tooling may not associate them correctly.

**Fix:** Removed the blank line.

### 4. Intermediate variable for `generateRandomTests` result

**Problem:** The result of `generateRandomTests` was assigned to `generatedTests` before immediately passing it to `setRandomTestsArray`. The variable served no purpose.

**Fix:** Inlined the call directly into `setRandomTestsArray(...)`.

---

## `useInfiniteScroll` hook — 2026-03-10

**File:** `src/hooks/useInfiniteScroll.ts`

### 1. `isLoading` state in `useEffect` dependency array caused unnecessary observer churn

**Problem:** `isLoading` was listed as a dependency of the `useEffect` that creates the `IntersectionObserver`. Because `isLoading` is a state value, every load cycle caused the effect to re-run twice — once when `isLoading` flipped to `true`, and again when it flipped back to `false`. Each re-run called `observer.disconnect()` and created a brand new observer, adding unnecessary overhead on every page load.

**Fix:** Introduced `isLoadingRef = useRef(false)` as a parallel ref-based guard. The callback now reads and writes `isLoadingRef.current` instead of the `isLoading` state for the guard check, so `isLoading` no longer needs to be a dependency. The state itself (`isLoading`) is still set for consumers to drive loading UI, but it no longer triggers observer recreation.

```ts
// Before — isLoading in deps caused observer to disconnect/reconnect twice per load
}, [displayedItems, data.length, itemsPerPage, threshold, delay, isLoading])

// After — ref guards against concurrent triggers, state kept only for the return value
const isLoadingRef = useRef(false)
// ...
if (entries[0]?.isIntersecting && displayedItems < data.length && !isLoadingRef.current) {
  isLoadingRef.current = true
  setIsLoading(true)
  setTimeout(() => {
    setDisplayedItems(...)
    setIsLoading(false)
    isLoadingRef.current = false
  }, delay)
}
}, [displayedItems, data.length, itemsPerPage, threshold, delay]) // isLoading removed
```

---

## `useIsMobile` hook — 2026-03-10

**File:** `src/hooks/useIsMobile.ts`

### 1. Full store subscription just to obtain a setter

**Problem:** `useMobileStore()` (called without a selector) creates a subscription to the entire store state. Any change to any value in `useMobileStore` — not just `isMobile` — would trigger a re-render of every component using this hook. The only reason for that call was to get `setIsMobile`, a setter whose reference is stable and never changes.

**Fix:** Replaced the `useMobileStore()` call with `useMobileStore.getState().setIsMobile(...)` accessed imperatively inside the effect. `getState()` reads the current store snapshot without creating a React subscription, so no re-renders occur from obtaining the setter.

### 2. `setIsMobile` as an unnecessary `useEffect` dependency

**Problem:** Because `setIsMobile` was sourced from the subscribed hook, it had to be listed in the `useEffect` dependency array. Zustand setters are stable references so this didn't cause repeated effect runs in practice, but it was semantically misleading and coupled the effect's dep list to an implementation detail of how the setter was retrieved.

**Fix:** With `getState()` access inside the effect, the setter is no longer a React value and does not belong in the dep array. `breakpoint` is now the only dependency, which accurately represents when the effect should re-run.

```ts
// Before — full store subscription + setter in deps
const { setIsMobile } = useMobileStore()
useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
  ...
}, [breakpoint, setIsMobile])

// After — imperative getState(), breakpoint is the sole dep
useEffect(() => {
  const checkMobile = () => useMobileStore.getState().setIsMobile(window.innerWidth < breakpoint)
  ...
}, [breakpoint])
```

---

## `useNoteEditor` hook — 2026-03-10

**File:** `src/hooks/useNoteEditor.ts`

### 1. `editorState: any` — untyped Lexical callback parameter

**Problem:** The `handleEditorChange` callback typed `editorState` as `any`, losing all type safety for the Lexical editor state API. Calls like `editorState.toJSON()` and `editorState.read()` were unchecked.

**Fix:** Imported `EditorState` from `"lexical"` and used it as the parameter type.

### 2. `useRef<HTMLInputElement>(null!)` — non-null assertion on an inherently nullable init

**Problem:** `null!` is a TypeScript assertion that strips `null` from the type, making `current` appear as `HTMLInputElement` instead of `HTMLInputElement | null`. The actual runtime value is still `null` until the ref attaches to the DOM, so the type was a lie. The downstream `contentRef.current!.value = ...` accesses then compounded this with additional `!` assertions, masking a real possibility of a null-dereference if the callback fired before the refs were attached.

**Fix:** Changed all three refs to `useRef<HTMLInputElement>(null)` (correct nullable type) and added an early return guard inside `handleEditorChange`:

```ts
// Before
const contentRef = useRef<HTMLInputElement>(null!)
contentRef.current!.value = jsonContent

// After
const contentRef = useRef<HTMLInputElement>(null)
if (!contentRef.current || !plainTextRef.current || !excerptRef.current) return
contentRef.current.value = jsonContent
```

### 3. JSDoc — 2026-03-10

Added JSDoc to both the hook function and `handleEditorChange`:

- **Hook-level doc** explains the hidden-input bridge pattern, which three values are derived (`content`, `plainText`, `excerpt`), what each is used for (database, search, previews), and how to wire the hook into a `<LexicalComposer>` via `OnChangePlugin`.
- **Callback-level doc** notes the no-op guard behaviour before refs attach.

---

## `useQuestionsQuery` hook — 2026-03-10

**File:** `src/hooks/useQuestionsQuery.ts`

### 1. `enabled: !!debouncedSearchTerm || true` — always-true dead code

**Problem:** The `|| true` short-circuits the expression unconditionally. The `!!debouncedSearchTerm` check is never evaluated, making `enabled` permanently `true` — identical to omitting the option entirely.

**Fix:** Removed the `enabled` option. TanStack Query defaults to `true`, which is the correct and intended behaviour.

```ts
// Before
enabled: !!debouncedSearchTerm || true,

// After
// (option removed — defaults to true)
```

### 2. Static `queryKey: ['categoryQuestions']` — cross-category cache collision

**Problem:** Both query keys (`'categoryQuestions'` and `'filteredCategoryQuestions'`) had no category discriminator. If the user navigated between categories, both caches continued serving the first category's data for up to 10 minutes (`staleTime: 10 * 60 * 1000`).

**Fix:** Added `questions[0]?.meta.category` to both keys, giving each category its own isolated cache slot.

```ts
// Before
queryKey: ['categoryQuestions']
queryKey: ['filteredCategoryQuestions', debouncedSearchTerm]

// After
queryKey: ['categoryQuestions', questions[0]?.meta.category]
queryKey: ['filteredCategoryQuestions', questions[0]?.meta.category, debouncedSearchTerm]
```

---

## `useRandomPositions` hook — 2026-03-10

**File:** `src/hooks/useRandomPositions.ts`

### 1. `useMemo` used to memoize a function — should be `useCallback`

**Problem:** `generateRandomPositions` was wrapped in `useMemo` returning an inner arrow function. `useMemo` memoizes a *value* — using it to memoize a *function* is semantically wrong and misleading, even though the result is functionally equivalent.

**Fix:** Replaced `useMemo` with `useCallback`, the correct primitive for memoizing functions.

### 2. Positions re-randomized on every resize

**Problem:** `setPositions(generateRandomPositions())` was called inside the resize/svgSize `useEffect`, meaning decorative floating elements jumped to new random positions every time the window was resized. Only `svgSize` should respond to resize — positions should stay stable.

**Fix:** Moved position generation into its own `useEffect` keyed on `generateRandomPositions` (which only changes when `count` changes). The resize effect now only updates `svgSize`.

```ts
// Before — positions re-randomized on every resize
useEffect(() => {
  setSvgSize(size)
  setPositions(generateRandomPositions())
}, [debouncedWindowSize, generateRandomPositions])

// After — positions generated once on mount (or when count changes)
useEffect(() => {
  setPositions(generateRandomPositions())
}, [generateRandomPositions])

useEffect(() => {
  setSvgSize(size)
}, [debouncedWindowSize])
```

---

## `useScroll` hook — 2026-03-10

**File:** `src/hooks/useScroll.ts`

### `scrollY` in state caused a re-render on every scroll frame

**Problem:** `scrollY` was part of the `ScrollState` object and included in the `prev` equality guard:

```ts
if (
  prev.isScrolled === isScrolled &&
  prev.scrollDirection === direction &&
  prev.scrollY === currentScrollY
) return prev
```

Because `scrollY` changes on every scroll event, the guard almost never returned `prev`. This meant `setScrollState` produced a new object every frame, triggering a re-render of every consumer — `Navbar` and `TopPanel` — on every animation frame while scrolling, even when neither `isScrolled` nor `scrollDirection` had changed. Neither consumer uses `scrollY`.

**Fix:** Removed `scrollY` from `ScrollState` and the guard. The guard now only compares `isScrolled` and `scrollDirection`, so state (and therefore re-renders) only update when those values actually change.

```ts
// Before — scrollY in state, guard fails on every frame
interface ScrollState {
  isScrolled: boolean
  scrollDirection: 'up' | 'down' | null
  scrollY: number
}
if (prev.isScrolled === isScrolled && prev.scrollDirection === direction && prev.scrollY === currentScrollY) return prev
return { isScrolled, scrollDirection: direction, scrollY: currentScrollY }

// After — only meaningful state, guard is effective
interface ScrollState {
  isScrolled: boolean
  scrollDirection: 'up' | 'down' | null
}
if (prev.isScrolled === isScrolled && prev.scrollDirection === direction) return prev
return { isScrolled, scrollDirection: direction }
```

---

## `TopPanel` component — 2026-03-10

**File:** `src/components/TopPanel.tsx`

### `document.getElementById` called in the render body on every render

**Problem:** `scrollContainer` was computed inline during render:

```ts
const scrollContainer =
  typeof window !== 'undefined'
    ? document.getElementById('scroll-container')
    : null
```

This has two problems: DOM access in the render body is a side effect and runs on every re-render; and on the first render the element may not be mounted yet, causing `useScroll` to fall back to `window` and never reattach to the correct container (because `null → element` transitions in `container` were unreliable with this pattern).

**Fix:** Captured the element once after mount with `useState` + `useEffect`:

```ts
const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)

useEffect(() => {
  setScrollContainer(document.getElementById('scroll-container'))
}, [])
```

The element is looked up exactly once, after the DOM is ready. `useScroll` receives a stable reference thereafter.

# Optimizations

A running log of performance and correctness improvements across the codebase.

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

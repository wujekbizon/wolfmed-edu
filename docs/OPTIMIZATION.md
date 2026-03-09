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

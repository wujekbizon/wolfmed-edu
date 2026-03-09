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

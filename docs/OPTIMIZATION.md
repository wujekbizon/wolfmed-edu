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

**Problem:** `handleSkipForward` used the `duration` state variable, which required `[duration]` in its `useCallback` deps. This is a stale-closure risk — if state lags, the clamped value could be wrong.

**Fix:** Read `audio.duration` directly from the DOM element. The value is always current and the dep array becomes `[]`.

```ts
audio.currentTime = Math.min(audio.duration, audio.currentTime + 15)
```

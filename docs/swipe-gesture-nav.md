# Swipe Gesture Navigation (NavDrawer)

Deferred — not worth the debugging time at this stage.
All implementation artifacts have been removed. This document preserves the design so it can be picked up later.

---

## What Was Built

Two hooks were implemented and wired into `NavDrawer`:

### `useMediaQuery(query: string): boolean`
`src/hooks/useMediaQuery.ts` (deleted)

SSR-safe reactive wrapper around `window.matchMedia`.
Subscribes to `MediaQueryList.change` so the return value updates on viewport/capability changes.
Returns `false` on the server and on first render, then syncs after hydration.

### `useSwipeGesture(options)`
`src/hooks/useSwipeGesture.ts` (deleted)

Attaches `pointerdown` / `pointerup` listeners to `document` via the Pointer Events API.

| Option | Default | Description |
|---|---|---|
| `isOpen` | — | Current open state of the drawer |
| `onOpen` | — | Fired when an open swipe is detected |
| `onClose` | — | Fired when a close swipe is detected |
| `edgeZone` | `24` | px from left edge that counts as the trigger zone |
| `swipeThreshold` | `56` | Minimum horizontal px to count as a swipe |

**Gesture rules:**
- **Open**: swipe right, starting within `edgeZone` px of the left edge (drawer closed)
- **Close**: swipe left by at least `swipeThreshold` px (drawer open, anywhere on screen)
- Gestures more vertical than horizontal are ignored (preserves native scroll)
- Mouse pointer events are filtered out (`e.pointerType === 'mouse'`)
- Only active below `max-width: 1023px` (Tailwind `lg` breakpoint, matching `lg:hidden` on the drawer)

**Usage in NavDrawer:**
```tsx
useSwipeGesture({
  isOpen: isMenuOpen,
  onOpen: toggleMenu,
  onClose: toggleMenu,
})
```

---

## Why It Was Dropped

Testing was painful:

1. **Chrome DevTools mobile emulation does not set `(pointer: coarse)`.**
   The original guard used that query, so listeners never registered during dev.
   Switched to `(max-width: 1023px)` as the guard, which DevTools does respect.

2. **Android system back gesture conflict.**
   Android 10+ reserves ~20dp from both edges for system back/forward gestures.
   The browser intercepts those touches before our listener fires, making swipe-to-open unreliable on the exact left edge on real Android devices.

3. **iOS Safari back swipe.**
   Safari's full-screen back gesture competes with the open swipe at the left edge.

---

## If Revisiting This

Options to address the Android/iOS edge conflict:

- **Increase `edgeZone`** to `40–60px` — starts the zone further from the physical edge, past where the OS intercepts.
- **`touch-action: pan-y`** on the body when the drawer is closed — may help browsers yield horizontal events, but browser support is inconsistent.
- **React Native / Expo Router** — OS-level drawer navigation handles this natively.
- **Visual drag handle** — A small pill/tab rendered at the left edge gives users a deliberate tap target that's easier to hit than a gesture zone.
- **Skip swipe-to-open entirely** — only implement swipe-to-close (no edge conflict since it starts anywhere on screen). This is the simplest and most reliable path.

---

## Files That Were Changed

| File | Change |
|---|---|
| `src/hooks/useSwipeGesture.ts` | Created then deleted |
| `src/hooks/useMediaQuery.ts` | Created then deleted |
| `src/app/_components/NavDrawer.tsx` | Import + hook call removed |

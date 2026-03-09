# MediaCell – Layout & Design Specification

> Design reference for the `media` cell type.
> Audio mode is implemented first. Video mode is stubbed and ready to wire up later.

---

## Design Principles

Matches the existing cell language across PlanCell / RagCell / NoteCell:

- White card on `bg-red-300/30` cell wrapper
- `border border-zinc-200` container, `rounded-xl` corners
- Rose-to-fuchsia gradient (`from-[#ff9898] to-fuchsia-400`) for primary accents
- `text-zinc-400 uppercase tracking-wide text-xs` section labels
- `shadow-xl` card depth, no dark mode for now
- Lucide icons throughout
- Framer Motion `fadeInUp` on mount (consistent with other cells)

---

## Audio Mode – Full Layout

```
+------------------------------------------------------------------+
|  CELL WRAPPER  (border-zinc-400/20  bg-red-300/30  rounded)      |
|  [ ActionBar: Save | Sync | Up | Down | Delete ]                 |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |  MEDIA CARD  (bg-white  rounded-xl  border-zinc-200        |  |
|  |               shadow-xl  overflow-hidden)                  |  |
|  |                                                            |  |
|  |  HEADER STRIP  (bg-gradient rose-50->fuchsia-50            |  |
|  |                 border-b border-zinc-200  px-5 py-4)       |  |
|  |                                                            |  |
|  |   [gradient icon bg]  MEDIA CENTER                        |  |
|  |   [Headphones icon ]  Wykład audio          [5:32]        |  |
|  |                                             duration pill  |  |
|  |                                                            |  |
|  |  WAVEFORM ZONE  (px-5 py-4  bg-white)                     |  |
|  |                                                            |  |
|  |   Static bar visualisation (30 bars, rose tones)          |  |
|  |   ||||||||||||||||||||||||||||||||                         |  |
|  |   [===played===]  o  [========remaining========]          |  |
|  |   1:24                                          5:32      |  |
|  |                                                            |  |
|  |  CONTROLS ROW  (px-5 pb-4  flex  items-center  gap-4)     |  |
|  |                                                            |  |
|  |   [Restart]  [  Play / Pause  ]  [0.75x][1x][1.5x][2x]  |  |
|  |              (primary gradient)  (speed selector pills)   |  |
|  |                                                            |  |
|  |  TRANSCRIPT STRIP  (border-t border-zinc-100  px-5 py-3)  |  |
|  |                                                            |  |
|  |   [FileText icon]  Transkrypcja          [ChevronDown]    |  |
|  |                                                            |  |
|  |  TRANSCRIPT PANEL  (collapsed by default)                 |  |
|  |  +------------------------------------------------------+ |  |
|  |  | max-h-48  overflow-y-auto  scrollbar-thin            | |  |
|  |  | text-sm text-zinc-700 leading-relaxed px-5 py-3      | |  |
|  |  | ... full script text ...                             | |  |
|  |  +------------------------------------------------------+ |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

---

## Waveform Detail

Not real-time – a static decorative bar chart rendered from a fixed seed or the title string. 30 bars, heights randomised but stable (seeded from `lectureId`). Two visual states:

- **Played bars** – `bg-gradient-to-t from-[#ff9898] to-fuchsia-400` full opacity
- **Remaining bars** – `bg-zinc-200` (light grey)

The split point moves with the seek slider via a CSS custom property (`--played-pct`).

```
Played region        Thumb   Remaining region
|||||||||||||||||||||  o  |||||||||||||||||
rose gradient             zinc-200
```

Seek bar beneath the bars:
- Track: `h-1 rounded-full bg-zinc-200`
- Fill: `bg-gradient-to-r from-[#ff9898] to-fuchsia-400`
- Thumb: `w-3 h-3 rounded-full bg-white ring-2 ring-[#ff9898] shadow`

---

## Controls Row Detail

```
[ RotateCcw ]    [  Play / Pause button  ]    [ 0.75x ] [ 1x ] [ 1.5x ] [ 2x ]
  icon-only       gradient pill, w-full          speed pills (toggle)
  text-zinc-400   from-[#ff9898] to-fuchsia-400  active: gradient bg white text
  hover:zinc-700  text-white  rounded-full        inactive: bg-zinc-100 text-zinc-500
                  px-6 py-2   text-sm font-medium rounded-full text-xs
```

Play/Pause pill is the visual anchor – deliberately larger than the flanking controls.

---

## Transcript Panel Detail

Toggle row:
```
[ FileText  Transkrypcja ]                  [ ChevronDown / Up ]
text-xs font-medium text-zinc-500           text-zinc-400
```

Expanded state animates open with `animate-fadeInUp` (150ms). Panel has:
- `max-h-48 overflow-y-auto scrollbar-thin scrollbar-webkit` (matches app scrollbar style)
- `bg-zinc-50/50` background
- `text-sm text-zinc-700 leading-relaxed`
- Thin `border-t border-zinc-100` separator

---

## Video Mode – Stub Layout

Shown when `sourceType === "video"`. Same card shell, header changes, body is a placeholder:

```
+------------------------------------------------------------+
|  HEADER STRIP  (same gradient)                             |
|   [Video icon]  MEDIA CENTER                               |
|   Odtwarzacz wideo               [coming-soon pill]        |
|                                                            |
|  VIDEO BODY  (bg-zinc-50  min-h-48  flex-center)           |
|                                                            |
|        [Video icon, w-12 h-12, text-zinc-300]             |
|        Wideo wkrotce dostepne                              |
|        text-sm text-zinc-400                               |
|                                                            |
|  CONTROLS ROW  (same layout, all buttons disabled/muted)   |
+------------------------------------------------------------+
```

When video is wired up, the body becomes:
- `<video>` element for UploadThing URLs (`sourceType: "video", url: "https://..."`)
- `<iframe>` with `allow="autoplay"` for embed URLs (YouTube/Vimeo – future)

---

## Tailwind Class Reference

### Card shell (matches RagCell pattern)
```
bg-white rounded-xl border border-zinc-200 shadow-xl overflow-hidden
```

### Header strip (matches PlanCell header)
```
bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-zinc-200 px-5 py-4
```

### Icon badge (matches PlanCell icon)
```
p-1.5 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 rounded-lg shrink-0
```

### Section label (matches PlanCell labels)
```
text-xs font-medium text-zinc-400 uppercase tracking-wide
```

### Primary button / play pill
```
inline-flex items-center gap-2 px-6 py-2
bg-gradient-to-r from-[#ff9898] to-fuchsia-400
text-white text-sm font-medium rounded-full
hover:opacity-90 transition-opacity
disabled:opacity-50 disabled:cursor-not-allowed
```

### Speed pill – inactive
```
px-2.5 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-500
hover:bg-zinc-200 transition-colors
```

### Speed pill – active
```
px-2.5 py-0.5 rounded-full text-xs
bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white
```

### Seek track
```
relative h-1 rounded-full bg-zinc-200 cursor-pointer
```

### Seek fill
```
absolute inset-y-0 left-0 rounded-full
bg-gradient-to-r from-[#ff9898] to-fuchsia-400
```

### Seek thumb
```
absolute top-1/2 -translate-y-1/2 -translate-x-1/2
w-3 h-3 rounded-full bg-white ring-2 ring-[#ff9898] shadow
```

### Transcript panel
```
bg-zinc-50/50 border-t border-zinc-100
max-h-48 overflow-y-auto scrollbar-thin scrollbar-webkit
px-5 py-3 text-sm text-zinc-700 leading-relaxed
```

---

## States

| State | Visual |
|-------|--------|
| **Idle** | Play pill active, seek at 0, waveform all grey |
| **Playing** | Pause icon in pill, waveform bars animate (subtle pulse on active bars), seek fills left |
| **Paused** | Play icon returns, seek position held |
| **Ended** | Play icon, seek resets to 0, subtle "Zakonczone" label appears below controls (fades after 3s) |
| **Loading** | Pill shows spinner, seek and waveform muted |
| **Video stub** | Body replaced with placeholder, controls disabled |

---

## Animation

```
Mount:     animate-fadeInUp (0.3s, from globals.css)
Transcript open:  max-h transition-all duration-200 ease-out (0 -> 192px)
Seek thumb:       scale-125 on :active for grab feedback
Playing bars:     subtle opacity pulse on bars left of thumb (opacity-80 <-> opacity-100, 1.5s ease infinite)
```

---

## Design Inspiration References

- [Dribbble – Audio Player designs](https://dribbble.com/tags/audio-player) – seek bar + waveform card patterns
- [Figma – Music Player Interactive Component](https://www.figma.com/community/file/1476697018682839423/music-player-interactive-component) – play state transitions
- [Untitled UI – Video Player Components](https://www.untitledui.com/components/video-players) – video stub placeholder pattern
- [Web Music Player UI Kit (Tidal clone)](https://www.figma.com/community/file/1096343443478425805/web-music-player-ui-kit) – elevation + speed control patterns
- Real-world reference: Adobe Podcast / Descript – transcript panel layout alongside waveform

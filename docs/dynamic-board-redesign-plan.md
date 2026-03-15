# DynamicBoard & Panel Redesign Plan — Hybrid Glass + Sedela Premium

**Date**: 2026-03-15 (updated)
**Branch**: `claude/create-local-branch-AUNJb`
**Scope**: Full `/panel` page — DynamicBoard, profile section, tests page cards
**Status**: ✅ All decisions resolved — awaiting green light for implementation

---

## 🎯 Design Philosophy — Hybrid Approach

**Three design layers, each used intentionally:**

| Layer | Pattern | Used On |
|-------|---------|---------|
| **Apple Glass** | `backdrop-blur-xl bg-white/60 border border-white/50` | Structural outer containers, NavDrawer, modals |
| **Sedela Clean Cards** | `bg-white border border-zinc-200/50 shadow-sm` | Stat row, quick-access links, feature grid cards |
| **BaseModal Dark Glass** | `bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl border border-white/[0.08]` | ExamCountdown — dramatic contrast on zinc-50 bg |

> **Rule**: Glass everywhere = nothing special. Glass on containers + dark glass on ExamCountdown = intentional, premium contrast.

---

## 🔍 Full Component Inventory

### `/panel` page — `src/app/panel/page.tsx`

| Component | Current State | Planned Change |
|-----------|--------------|----------------|
| `DynamicBoard` | Glass container + stale sidebar widgets | Restructure: add StatsRow above grid, remove stale widgets |
| `UserOnboard` | Newsletter-style welcome, old business model copy | Full rewrite — marketplace copy, feature grid, checklist |
| `DashboardInfo` | Pink gradient quick-access buttons | Sedela clean card style (white + rose accent on hover) |
| `ExamCountdown` | Dark zinc-900 card — good logic, dated style | Restyle to BaseModal dark glass — premium, dramatic, intentional contrast |
| `Username` | Plain heading "Panel użytkownika, [name]" | Minor: add glass section header treatment |
| `UserMotto` | Unknown — needs glass wrapper | Apply consistent glass card wrap |
| `UserAnalytics` | Already good glass (`from-white/25 backdrop-blur-xl`) | Minor polish — align tab style to system |
| `BadgeWidget` | Already good glass | Minor polish only |
| `AdminBlogWidget` | Unknown | Review and apply consistent card style |
| `UsernameForm` | `bg-white/60 backdrop-blur-sm` — already fine | Keep, minor alignment |
| `MottoForm` | `bg-white/60 backdrop-blur-sm` — already fine | Keep, minor alignment |
| `TestimonialForm` | `bg-white/60 backdrop-blur-sm` — already fine | Keep, minor alignment |
| `StorageQuotaWidget` | `bg-white/60 backdrop-blur-sm` — already fine | Keep, minor alignment |

### `/panel/testy` page — `src/app/panel/testy/page.tsx`

| Component | Current State | Planned Change |
|-----------|--------------|----------------|
| `TestsCategoryCard` | Dark `bg-slate-900` with image — already Sedela-like | Enhance: add `border border-white/[0.06]` subtle glass border, smooth hover state |
| `TestsCategoriesList` | Plain flex container | Possibly add subtle entrance stagger animation |

---

## 📐 Revised Layout Architecture

### Section 1 — DynamicBoard

```
DynamicBoard (Apple glass outer container)
│
├── StatsRow — 4 Sedela-style compact metric cards (NEW)
│   ├── [1] Rozwiązane pytania   — user.totalQuestions  (neutral white card)
│   ├── [2] Próby testów         — user.testsAttempted  (neutral white card)
│   ├── [3] Średni wynik         — user.totalScore %    (rose-tinted card)
│   └── [4] Twoje kursy          — enrolled count       (neutral white card)
│
└── Grid (lg:col-8 / lg:col-4)
    │
    ├── LEFT — OnboardingHero (rewrite of UserOnboard)
    │   ├── Heading: "Twoja nauka, Twoje tempo."
    │   ├── Subtitle: marketplace value prop (no old model copy)
    │   ├── CourseMarketplaceCards (glass cards, "Kup dostęp →" → /kierunki/[slug])
    │   ├── FeatureDiscoveryGrid — 2×2 Sedela-style cards
    │   │   ├── Baza Testów     → /panel/testy
    │   │   ├── AI Notatnik     → /panel/nauka  (soft "Premium" pill if not premium)
    │   │   ├── Procedury       → /panel/procedury
    │   │   └── Wykłady AI      → /panel/nauka/wykladania
    │   └── OnboardingChecklist (client, localStorage, collapsible, video-ready)
    │
    └── RIGHT — SmartSidebar
        ├── CourseAccessWidget   — owned courses + available to buy
        ├── ForumActivityCard    — last user post or Polish empty state
        ├── DashboardInfo        — Sedela clean quick-access links (rose on hover)
        └── ExamCountdown        — BaseModal dark glass restyle (KEEP in sidebar)
```

### Section 2 — Profile Section (`panel/page.tsx` below DynamicBoard)

```
Profile Container (Apple glass outer container, matches DynamicBoard)
│
├── Header row: Username + (edit trigger)
├── UserMotto (glass card wrap)
├── UserAnalytics (tabbed: Przegląd / Szczegóły) — already good, minor polish
├── BadgeWidget — already good, minor polish
└── 2-col grid:
    ├── AdminBlogWidget
    ├── UsernameForm    (bg-white/60 — already correct)
    ├── MottoForm       (bg-white/60 — already correct)
    ├── TestimonialForm (bg-white/60 — already correct)
    └── StorageQuotaWidget (bg-white/60 — already correct)
```

---

## 📋 Detailed Component Changes

### 1. StatsRow (new component)

Sedela-inspired. 4 cards in a responsive row (2×2 on mobile, 4×1 on lg+).
Data comes from `user` object already fetched in panel page — **no extra DB query**.

```
Card anatomy:
  [Icon]  [Big number]
          [Label]
          [Sub-label]

Example:
  📝  1,247
      Pytań rozwiązanych
      Całkowity wynik: 78%
```

Card styles:
- Cards 1, 2, 4: `bg-white border border-zinc-200/50 shadow-sm rounded-2xl`
- Card 3 (Średni wynik): `bg-rose-50/60 border border-rose-200/50` — single warm accent

### 2. ExamCountdown — BaseModal dark glass restyle

Keep all existing logic (4 states: countdown / in_progress / waiting_results / no session).
Change only the container styling to match BaseModal:

```
FROM: bg-zinc-900 border border-zinc-800
  TO: bg-gradient-to-br from-zinc-900/95 to-black/90
      backdrop-blur-xl
      border border-white/[0.08]
      shadow-2xl shadow-black/40
      rounded-2xl
```

The dark card creates intentional contrast against the light sidebar — same principle Apple uses with dark Dock on light desktop. This makes the countdown feel important and urgent without needing large size.

### 3. UserOnboard.tsx — Full Rewrite

- **Remove**: newsletter heading, old model subtitle, "Darmowy Plan!" badge, padlock overlay, "Zespół Wolfmed-Edukacja" footer
- **Add**: marketplace heading + subtitle, clean course cards (glass style, CTA → `/kierunki/[slug]`), FeatureDiscoveryGrid, OnboardingChecklist
- Course cards show tier tags (Basic pill / Premium pill) instead of lock states

### 4. CourseAccessWidget (new server component)

Two states based on `getUserEnrollmentsAction()` (query already exists):
- **Enrolled**: lists courses with tier badge + "Kontynuuj →" link to `/panel/kursy`
- **No enrollments**: "Zacznij swoją naukę" headline + 2 course rows (Opiekun / Pielęgniarstwo) each with "Kup dostęp →" to `/kierunki/[slug]`

Sedela list-row style: icon + name + badge + arrow, not heavy grid cards.

### 5. ForumActivityCard (new server component)

Needs a new lightweight query: fetch last 1 post/comment by `userId` from forum tables.
Two states:
- **Has activity**: post title + relative date + "Zobacz →" link
- **No activity**: `"Nie masz jeszcze żadnych postów na forum."` + subtle `"Dołącz do dyskusji →"` to `/forum`

Glass card style matching the sidebar system.

### 6. OnboardingChecklist (new client component)

localStorage key: `wolfmed_onboarding_v1`. Steps:
1. Uzupełnij nazwę użytkownika i motto
2. Przeglądaj dostępne kierunki
3. Rozwiąż swój pierwszy test
4. Sprawdź procedury medyczne
5. Odkryj AI Notatnik

- Collapsible when all done (Framer Motion height animation)
- Each step: checkbox + label + optional future `video` prop slot (for step videos later)
- Progress bar at top: `X/5 ukończono`

### 7. DashboardInfo — Sedela style

Replace pink gradient buttons with Sedela-style list rows:
```
FROM: bg-linear-to-r from-[#f58a8a]/90 to-[#ffc5c5]/90 (heavy gradient)
  TO: bg-white border border-zinc-200/50 hover:border-rose-200 hover:bg-rose-50/40
      (clean white, rose on hover — Sedela link row pattern)
```

### 8. TestsCategoryCard — subtle glass border enhancement

Card is already dark Sedela-style (`bg-slate-900`). Small addition:
```
Add: border border-white/[0.06]  (barely visible glass shimmer)
     hover:border-white/[0.12]   (reveals on hover)
```
Keeps the dark dramatic aesthetic, adds the glass language consistency.

---

## 🎨 Design Tokens Summary

```
// Outer containers (Apple Glass)
container-glass:  bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-zinc-900/5 rounded-3xl

// Internal cards (Sedela clean)
card-clean:       bg-white border border-zinc-200/50 shadow-sm rounded-2xl

// Accent stat card
card-accent:      bg-rose-50/60 border border-rose-200/50 rounded-2xl

// Dark glass (BaseModal / ExamCountdown)
card-dark-glass:  bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 rounded-2xl

// Quick-access links hover
link-hover:       hover:bg-rose-50/40 hover:border-rose-200 transition-all duration-200

// CTA buttons
cta-primary:      bg-rose-500 hover:bg-rose-600 text-white rounded-full px-4 py-2 text-sm font-medium
cta-ghost:        border border-zinc-200 hover:border-rose-300 text-zinc-700 hover:text-rose-600 rounded-full
```

---

## 🗂️ Files Affected

| File | Change Type | Notes |
|------|------------|-------|
| `src/app/panel/page.tsx` | Minor | Wrap profile section in glass container, add StatsRow |
| `src/app/_components/DynamicBoard.tsx` | Restructure | Add StatsRow slot, remove stale widgets, wire new sidebar components |
| `src/components/UserOnboard.tsx` | Full rewrite | Marketplace copy, feature grid, checklist |
| `src/components/DashboardInfo.tsx` | Restyle | Sedela clean link rows |
| `src/components/ExamCountdown.tsx` | Restyle only | BaseModal dark glass tokens — logic untouched |
| `src/components/TestsCategoryCard.tsx` | Minor | Add subtle glass border |
| *(new)* `src/components/StatsRow.tsx` | New | 4 Sedela metric cards — data from user object |
| *(new)* `src/components/CourseAccessWidget.tsx` | New | Mini marketplace sidebar card |
| *(new)* `src/components/ForumActivityCard.tsx` | New | Last post or Polish empty state |
| *(new)* `src/components/OnboardingChecklist.tsx` | New | Client, localStorage, video-slot-ready |

---

## 🏁 Implementation Order

1. **ExamCountdown** — restyle to BaseModal dark glass (isolated, no logic change, quick win)
2. **DashboardInfo** — Sedela link row restyle
3. **DynamicBoard** — restructure layout, remove stale widgets
4. **StatsRow** — new Sedela stat cards (data from existing user object)
5. **UserOnboard** — full rewrite (marketplace copy, course cards, feature grid)
6. **OnboardingChecklist** — new client component
7. **CourseAccessWidget** — new server component
8. **ForumActivityCard** — new server component (needs forum query check)
9. **TestsCategoryCard** — subtle glass border
10. **Panel page** — profile section glass container + StatsRow integration
11. **Framer Motion** — stagger animations on StatsRow + FeatureDiscoveryGrid

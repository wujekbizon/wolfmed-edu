# DynamicBoard & Panel Redesign Plan — Hybrid Glass + Sedela Premium

**Date**: 2026-03-15 (updated)
**Branch**: `claude/create-local-branch-AUNJb`
**Scope**: Full `/panel` page — DynamicBoard, profile section, tests page cards
**Status**: 🟡 Three design versions implemented — awaiting selection before content/logic phase

---

## ⚠️ Components to Be Removed (Post-Design Selection)

The following are **inline JSX blocks inside `DynamicBoard.tsx`** — not separate files, so no files will be deleted. They will be removed in the content cleanup phase after a design version is chosen.

| Block | Location | Reason |
|-------|----------|--------|
| `Najnowsze Aktualizacje` | `DynamicBoard.tsx` lines 17–42 | Hardcoded Dec 2025 dates — stale content |
| `Zapraszamy na forum` | `DynamicBoard.tsx` lines 43–57 | Replaced by `ForumActivityCard` (personal, dynamic) |

**During the 3 design versions these blocks are restyled but NOT removed** — so you can see how each version handles them visually before we delete and replace.

---

## 🎯 Design Philosophy — Hybrid Approach

Three design layers, each used intentionally:

| Layer | Pattern | Used On |
|-------|---------|---------|
| **Apple Glass** | `backdrop-blur-xl bg-white/60 border border-white/50` | Structural outer containers |
| **Sedela Clean** | `bg-white border border-zinc-200/50 shadow-sm` | Stat row, quick-access links, feature cards |
| **BaseModal Dark Glass** | `bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl border border-white/[0.08]` | ExamCountdown — dramatic contrast on zinc-50 |

> **Rule**: Glass everywhere = nothing special. Use each layer intentionally.

---

## 🔍 Full Component Inventory

### `/panel` page — `src/app/panel/page.tsx`

| Component | Current State | Post-Design Change |
|-----------|--------------|----------------|
| `DynamicBoard` | Glass container + stale sidebar widgets | Restructure: StatsRow, remove stale widgets |
| `UserOnboard` | Newsletter-style, old business model copy | Full rewrite — marketplace copy, feature grid, checklist |
| `DashboardInfo` | Pink gradient quick-access buttons | Sedela clean link rows |
| `ExamCountdown` | Dark zinc-900 card — good logic, dated style | BaseModal dark glass — all 3 versions |
| `Username` | Plain heading | Keep |
| `UserMotto` | Rose-tinted glass card — already decent | Minor polish |
| `UserAnalytics` | Good glass (`from-white/25 backdrop-blur-xl`) | Minor polish |
| `BadgeWidget` | Good glass | Keep |
| `AdminBlogWidget` | Unknown | Review after design pick |
| `UsernameForm` | `bg-white/60 backdrop-blur-sm` | Keep |
| `MottoForm` | `bg-white/60 backdrop-blur-sm` | Keep |
| `TestimonialForm` | `bg-white/60 backdrop-blur-sm` | Keep |
| `StorageQuotaWidget` | `bg-white/60 backdrop-blur-sm` | Keep |

### `/panel/testy` page

| Component | Current State | Post-Design Change |
|-----------|--------------|----------------|
| `TestsCategoryCard` | Dark `bg-slate-900` — already Sedela-like | Subtle `border border-white/[0.06]` glass shimmer |
| `TestsCategoriesList` | Plain flex container | Stagger animation after design pick |

---

## 🎨 Three Design Versions

### Version A — Sedela Dark

**Philosophy**: Dark dashboard. Data-forward. High contrast. Warm zinc tones. Familiar to SaaS admin dashboards. Bold statement on the zinc-50 page background.

| Element | Style |
|---------|-------|
| DynamicBoard container | `bg-zinc-900 border border-white/[0.06]` |
| UserOnboard card | `bg-zinc-800 border border-white/[0.06]` |
| Course path cards | `bg-zinc-700/80 border border-white/[0.08]` |
| Najnowsze Aktualizacje | `bg-zinc-800 border border-white/[0.06]` |
| Zapraszamy na forum | `bg-zinc-800 border border-rose-500/20` (no red gradient) |
| DashboardInfo links | `bg-zinc-700/80 border border-white/[0.06] text-zinc-100` |
| ExamCountdown | BaseModal dark glass (same across all versions) |
| Panel section 2 | `bg-zinc-900 border border-white/[0.06]` |

**Best for**: Users who want the boldest, most distinctive look. Matches TestsCategoryCard dark cards perfectly.

---

### Version B — Clean White + Selective Glass

**Philosophy**: Mostly white/clean. Glass used sparingly — NavDrawer light glass on the forum card, BaseModal dark glass only on ExamCountdown. Closest to current but refined.

| Element | Style |
|---------|-------|
| DynamicBoard container | `bg-white border border-zinc-200/50 shadow-lg` |
| UserOnboard card | `bg-white border border-zinc-200/50 shadow-sm` |
| Course path cards | `bg-white border border-zinc-200/50` (clean, no blur) |
| Najnowsze Aktualizacje | `bg-white border border-zinc-200/60 shadow-sm` |
| Zapraszamy na forum | `bg-gradient-to-br from-white/60 to-rose-50/50 backdrop-blur-xl border border-white/50` (NavDrawer glass) |
| DashboardInfo links | `bg-white border border-zinc-200/50 hover:bg-rose-50/50 hover:border-rose-200/60` |
| ExamCountdown | BaseModal dark glass — the ONLY dark element |
| Panel section 2 | `bg-white border border-zinc-200/50 shadow-sm` |

**Best for**: Clean, minimal, closest to what exists. Dark ExamCountdown card is the premium accent.

---

### Version C — Hybrid Apple Glass (Original Plan)

**Philosophy**: Apple glass on containers, Sedela clean on interactive elements, BaseModal dark on ExamCountdown. Three layers used deliberately.

| Element | Style |
|---------|-------|
| DynamicBoard container | `bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-zinc-900/5 rounded-3xl` |
| UserOnboard card | `bg-white/40 backdrop-blur-lg border border-white/60` |
| Course path cards | `bg-white/60 backdrop-blur-md border border-white/50` |
| Najnowsze Aktualizacje | `bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm` |
| Zapraszamy na forum | `bg-gradient-to-br from-rose-500/80 to-rose-600/70 backdrop-blur-sm border border-rose-400/30` (glass rose) |
| DashboardInfo links | `bg-white/50 border border-white/60 hover:bg-white/70` |
| ExamCountdown | BaseModal dark glass |
| Panel section 2 | `bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-zinc-900/5` |

**Best for**: Premium layered glass feel. Most cohesive with NavDrawer and BaseModal language.

---

## 📐 Post-Design Layout Architecture

*(Implemented after version is selected)*

```
DynamicBoard
│
├── StatsRow — 4 Sedela compact metric cards (NEW)
│   ├── Rozwiązane pytania  — user.totalQuestions  (no extra DB query)
│   ├── Próby testów        — user.testsAttempted
│   ├── Średni wynik        — user.totalScore %    (rose accent card)
│   └── Twoje kursy         — enrolled count
│
└── Grid (lg:8 / lg:4)
    ├── LEFT — OnboardingHero (UserOnboard rewrite)
    │   ├── "Twoja nauka, Twoje tempo." heading
    │   ├── Marketplace subtitle (remove old model copy)
    │   ├── CourseMarketplaceCards → /kierunki/[slug]
    │   ├── FeatureDiscoveryGrid (Testy, AI Notatnik, Procedury, Wykłady)
    │   └── OnboardingChecklist (localStorage, video-slot-ready)
    │
    └── RIGHT — SmartSidebar
        ├── CourseAccessWidget  — owned courses + buy access
        ├── ForumActivityCard   — last post or Polish empty state
        ├── DashboardInfo       — Sedela clean quick-access
        └── ExamCountdown       — BaseModal dark glass (keep in sidebar)
```

---

## 🗂️ Files Changed in Design Versions

| File | Change |
|------|--------|
| `src/app/_components/DynamicBoard.tsx` | Container + sidebar card styles |
| `src/components/UserOnboard.tsx` | Card bg, text colors, course card styles |
| `src/components/DashboardInfo.tsx` | Link button styles |
| `src/components/ExamCountdown.tsx` | Container → BaseModal dark glass (same all versions) |
| `src/components/CountdownTimer.tsx` | Segment cards → glass shimmer (same all versions) |
| `src/components/TestsCategoryCard.tsx` | Add subtle `border border-white/[0.06]` |
| `src/app/panel/page.tsx` | Profile section container bg |

---

## 🗂️ Files Added Post-Design Selection

| File | Purpose |
|------|---------|
| `src/components/StatsRow.tsx` | 4 Sedela metric cards (data from user object) |
| `src/components/CourseAccessWidget.tsx` | Mini marketplace sidebar card |
| `src/components/ForumActivityCard.tsx` | Last forum post or Polish empty state |
| `src/components/OnboardingChecklist.tsx` | Collapsible checklist, localStorage, video-slot-ready |

---

## 🏁 Implementation Order (Post-Design Selection)

1. Remove stale JSX blocks from DynamicBoard (Najnowsze Aktualizacje + Zapraszamy na forum)
2. UserOnboard full content rewrite (marketplace copy, course cards, feature grid)
3. StatsRow new component
4. CourseAccessWidget new component
5. ForumActivityCard new component (needs forum query check)
6. OnboardingChecklist new client component
7. DashboardInfo Sedela link rows
8. Framer Motion stagger animations on StatsRow + FeatureDiscoveryGrid

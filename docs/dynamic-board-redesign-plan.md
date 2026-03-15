# DynamicBoard Redesign Plan — Apple Glass Premium Dashboard

**Date**: 2026-03-15
**Branch**: `claude/create-local-branch-AUNJb`
**Scope**: `/panel` top section — `DynamicBoard`, `UserOnboard`, `DashboardInfo`, sidebar widgets
**Status**: ✅ Decisions resolved — awaiting green light for implementation

---

## 🎯 Core Goals

1. **Apple glass morphism** — extend the NavDrawer glass language across the whole board
2. **Marketplace model** — remove all old subscription/supporter copy
3. **Modern onboarding** — SaaS-grade, feature-discovery-focused (not a welcome letter)
4. **Remove stale widgets** — Najnowsze Aktualizacje (hardcoded Dec 2025) and forum invite as a red block
5. **Showcase new platform capabilities** — AI/RAG, Lectures, Procedures etc. from `/docs`

---

## 🔍 Current Problems Diagnosed

| Widget | Issue |
|--------|-------|
| `UserOnboard` heading | Generic "Witamy w naszej społeczności!" — feels like a newsletter |
| `UserOnboard` subtitle | References "Z darmowym dostępem do ścieżki Opiekuna Medycznego" — old model |
| Career path cards | "Darmowy Plan!" badge + dark overlay "Dostępne w Płatnym Planie" — old subscription model |
| Footer text in UserOnboard | "Zespół Wolfmed-Edukacja" sign-off — email newsletter pattern, not a dashboard |
| `Najnowsze Aktualizacje` | Hardcoded Dec 2025 dates — stale, no dynamic content |
| `Zapraszamy na forum` | Standalone red gradient block — visually heavy, feels promotional |
| `DashboardInfo` | Pink gradient buttons work, but don't match the glass language |
| `ExamCountdown` | Functionally excellent, just needs glass skin |

---

## 📐 Layout Architecture

```
DynamicBoard
├── [LEFT col — lg:8] OnboardingHero  (rewrite of UserOnboard)
│   ├── Heading + Subtitle (marketplace copy, no greeting)
│   ├── FeatureDiscoveryGrid (4 cards: Testy, AI Notatnik, Procedury, Wykłady)
│   ├── CourseMarketplaceCards (marketplace model — enroll / continue)
│   └── OnboardingChecklist (collapsible, localStorage, video steps later)
│
└── [RIGHT col — lg:4] SmartSidebar
    ├── CourseAccessWidget (NEW — mini marketplace: owned + available to buy)
    ├── QuickAccessCard (DashboardInfo — glass redesign)
    ├── ForumActivityCard (NEW — last user post/comment or empty state in Polish)
    └── ExamCountdown (keep, glass skin)
```

---

## 📋 Resolved Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Onboarding checklist | ✅ Include — best way to guide users through features, video steps can be added later per item |
| 2 | Personalized greeting | ❌ Skip — avoid unnecessary DB/Clerk round-trips on dashboard load |
| 3 | CourseStatusCard | ✅ Mini marketplace widget — shows owned courses + courses available to buy; links to `/kierunki/[slug]` for purchase |
| 4 | Feature Discovery cards | ✅ 4 cards: Baza Testów, AI Notatnik, Procedury, Wykłady AI |
| 5 | Updates widget replacement | ✅ Nothing — clean sidebar, no stale hardcoded content |
| 6 | Forum widget | ✅ Replace red promo block with `ForumActivityCard` — shows user's last post/comment; if none: Polish empty state message |
| 7 | Course cards CTA | ✅ "Kup dostęp" links to `/kierunki/[slug]` |

---

## 📋 Changes by Component

### 1. `UserOnboard.tsx` → Rewrite as `OnboardingHero`

**Heading change:**
- ❌ `"Witamy w naszej społeczności!"` → ✅ `"Twoja nauka, Twoje tempo."`
- Short, action-oriented, modern — like Coursera/Notion dashboards

**Subtitle change:**
- ❌ `"Z darmowym dostępem do ścieżki Opiekuna Medycznego..."` (old model)
- ✅ `"Wybierz kierunek, kup dostęp i ucz się w swoim tempie. Bez subskrypcji — płacisz tylko za to, czego potrzebujesz."`
- Communicates the new marketplace value prop in one sentence

**Career path cards — marketplace redesign:**
- ❌ Remove dark overlay with padlock + "Dostępne w Płatnym Planie"
- ❌ Remove "Darmowy Plan!" bounce badge
- ✅ Clean course cards: title, description, tier tags (Basic / Premium pills)
- ✅ CTA: `"Kup dostęp →"` links to `/kierunki/[slug]`
- ✅ Glass card style: `bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl`

**Remove footer:**
- ❌ "Pamiętaj, że możesz zaktualizować..." paragraph
- ❌ "Zespół Wolfmed-Edukacja" red sign-off
- ✅ Replaced by Feature Discovery Grid below the course cards

**Feature Discovery Grid (new):**

4 compact glass cards in a 2×2 grid highlighting platform capabilities:

| Card | Icon | Destination | Note |
|------|------|-------------|------|
| Baza Testów | quiz icon | `/panel/testy` | Core feature |
| AI Notatnik | sparkle/brain | `/panel/nauka` | RAG — soft "Premium" pill for non-premium users |
| Procedury | clipboard | `/panel/procedury` | Core feature |
| Wykłady AI | headphones | `/panel/nauka/wykladania` | From lecture-feature-plan docs |

For non-premium users, AI Notatnik shows a subtle `"Premium"` badge pill — not a blocking overlay. Curiosity over friction.

**Onboarding Checklist (new, collapsible):**

Inspired by Notion/Linear setup flows. State stored in `localStorage` — no DB needed. Collapses smoothly once all steps complete. Video steps can be added per item in a future iteration.

- ☐ Uzupełnij nazwę użytkownika i motto
- ☐ Przeglądaj dostępne kierunki
- ☐ Rozwiąż swój pierwszy test
- ☐ Sprawdź procedury medyczne
- ☐ Odkryj AI Notatnik

---

### 2. `DynamicBoard.tsx` — Sidebar changes

**Remove:**
- `Najnowsze Aktualizacje` block (hardcoded Dec 2025 — stale)
- `Zapraszamy na forum` red gradient block (replaced by ForumActivityCard)

**Keep + redesign:**
- `DashboardInfo` → glass skin, replace pink gradient buttons with `bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/70`
- `ExamCountdown` → wrap in glass card container

**Add — `CourseAccessWidget` (new):**

Mini marketplace card at the top of the sidebar. Two states:

- **Has courses**: lists enrolled courses with tier badge (Basic / Premium), each with a `"Kontynuuj →"` link to `/panel/kursy`
- **No courses**: headline `"Zacznij swoją naukę"` + 2 course tiles (Opiekun Medyczny, Pielęgniarstwo) each with `"Kup dostęp →"` linking to `/kierunki/[slug]`

This gives users without courses immediate purchase access without navigating away, and gives enrolled users a glanceable status. Complements `/panel/kursy` (full list) without duplicating it.

**Add — `ForumActivityCard` (new):**

Replaces the red forum promo block. Two states:

- **Has posts/comments**: shows the user's most recent forum post title + timestamp + `"Zobacz →"` link
- **No activity**: Polish empty state — e.g. `"Nie masz jeszcze żadnych postów na forum."` with a subtle `"Dołącz do dyskusji →"` link to `/forum`

This is contextual and personal — much more valuable than a generic promotional block.

---

### 3. Glass Design System — Tokens to Use

Consistent across all cards (extending NavDrawer patterns):

```
Container:    bg-white/60  backdrop-blur-xl  border border-white/50  shadow-xl shadow-zinc-900/5  rounded-3xl
Cards:        bg-white/40  backdrop-blur-lg  border border-white/60  rounded-2xl
Accent card:  bg-gradient-to-br from-rose-500/80 to-rose-600/70  backdrop-blur-sm  border border-rose-400/30
Hover state:  hover:bg-white/60  hover:shadow-md  transition-all duration-200
Text primary:    text-zinc-900
Text secondary:  text-zinc-500
```

The overall DynamicBoard wrapper gets the glass treatment to match `SidePanel`.

---

### 4. Animation — Framer Motion

Staggered entrance for grid cards (Framer Motion already used in the project):

```
initial:    { opacity: 0, y: 16 }
animate:    { opacity: 1, y: 0 }
transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
```

Onboarding checklist: smooth height collapse animation when dismissed.

---

## 🗂️ Files Affected

| File | Change |
|------|--------|
| `src/components/UserOnboard.tsx` | Full rewrite — marketplace copy, feature grid, checklist |
| `src/app/_components/DynamicBoard.tsx` | Remove 2 stale widgets, add new sidebar cards, apply glass |
| `src/components/DashboardInfo.tsx` | Glass skin on quick access buttons |
| `src/constants/careerPathsData.ts` | Verify/update descriptions to match marketplace model |
| *(new)* `src/components/CourseAccessWidget.tsx` | Mini marketplace sidebar card (server component) |
| *(new)* `src/components/ForumActivityCard.tsx` | Last forum post or empty state (server component) |
| *(new)* `src/components/OnboardingChecklist.tsx` | Collapsible checklist (client component, localStorage) |

---

## 🏁 Implementation Order

1. `DynamicBoard.tsx` — remove stale widgets, apply glass container, wire new layout
2. `UserOnboard.tsx` — rewrite heading, subtitle, course cards (marketplace model)
3. `DashboardInfo.tsx` — glass skin on quick access buttons
4. `ExamCountdown` wrapper — glass card skin
5. `CourseAccessWidget.tsx` — new server component
6. `ForumActivityCard.tsx` — new server component (needs forum query)
7. `OnboardingChecklist.tsx` — new client component (localStorage)
8. Feature Discovery Grid — inside UserOnboard
9. Framer Motion entrance animations

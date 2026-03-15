# DynamicBoard Redesign Plan — Apple Glass Premium Dashboard

**Date**: 2026-03-15
**Branch**: `claude/create-local-branch-AUNJb`
**Scope**: `/panel` top section — `DynamicBoard`, `UserOnboard`, `DashboardInfo`, sidebar widgets

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
│   ├── PersonalizedGreeting (static for now, Clerk name later)
│   ├── FeatureDiscoveryGrid (4 cards: Testy, AI Notatnik, Procedury, Wykłady)
│   ├── CourseMarketplaceCards (marketplace model — enroll / continue)
│   └── OnboardingChecklist (collapsible progress for new users)
│
└── [RIGHT col — lg:4] SmartSidebar
    ├── QuickAccessCard (DashboardInfo — glass redesign)
    ├── CourseStatusCard (NEW — enrolled courses + tier summary)
    ├── ExamCountdown (keep, glass skin)
    └── [REMOVE] Najnowsze Aktualizacje + Zapraszamy na forum
```

---

## 📋 Changes by Component

### 1. `UserOnboard.tsx` → Rewrite as `OnboardingHero`

**Heading change:**
- ❌ `"Witamy w naszej społeczności!"` → ✅ `"Twoja nauka, Twoje tempo."` or `"Zacznij od wybrania kierunku"`
- Short, action-oriented, modern — like Coursera/Notion dashboards

**Subtitle change:**
- ❌ `"Z darmowym dostępem do ścieżki Opiekuna Medycznego..."` (old model)
- ✅ `"Wybierz kierunek, kup dostęp i ucz się w swoim tempie. Bez subskrypcji — płacisz tylko za to, czego potrzebujesz."`
- Communicates the new marketplace value prop in one sentence

**Career path cards — marketplace redesign:**
- ❌ Remove dark overlay with padlock + "Dostępne w Płatnym Planie"
- ❌ Remove "Darmowy Plan!" bounce badge
- ✅ Clean course cards: title, description, price tiers (Basic/Premium tags)
- ✅ CTA: `"Kup dostęp"` (unenrolled) or `"Kontynuuj naukę →"` (enrolled)
- ✅ Glass card style: `bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl`

**Remove footer:**
- ❌ "Pamiętaj, że możesz zaktualizować..." paragraph
- ❌ "Zespół Wolfmed-Edukacja" red sign-off
- ✅ Replace with Feature Discovery Grid (see below)

**Feature Discovery Grid (new):**

4 compact glass cards highlighting platform capabilities:

| Card | Icon | Destination | Note |
|------|------|-------------|------|
| Baza Testów | quiz icon | `/panel/testy` | Core feature |
| AI Notatnik | sparkle/brain | `/panel/nauka` | RAG — premium teaser |
| Procedury | clipboard | `/panel/procedury` | Core feature |
| Wykłady AI | headphones | `/panel/nauka/wykladania` | From lecture docs |

For non-premium users, AI Notatnik card shows a soft "Premium" badge — not a locked overlay, just a pill label that makes them curious rather than blocked.

**Onboarding Checklist (new, collapsible):**

Inspired by Notion/Linear setup flows. Compact, dismissible once complete. State stored in `localStorage` — no DB needed. Disappears when all checked.

- ☐ Uzupełnij nazwę użytkownika i motto
- ☐ Przeglądaj dostępne kierunki
- ☐ Rozwiąż swój pierwszy test
- ☐ Sprawdź procedury medyczne
- ☐ Odkryj AI Notatnik

---

### 2. `DynamicBoard.tsx` — Sidebar changes

**Remove:**
- `Najnowsze Aktualizacje` block (hardcoded, stale — content is from December 2025)
- `Zapraszamy na forum` red gradient block

**Keep + redesign:**
- `DashboardInfo` → glass skin, replace pink gradient buttons with `bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/70` — clean and premium
- `ExamCountdown` → wrap in glass card container matching the language

**Add — `CourseStatusCard` (new, small):**

A compact card above Quick Access showing enrollment status:
- No enrollments: `"Rozpocznij naukę — wybierz swój pierwszy kierunek"` + link to `/panel/kursy`
- Enrolled: course name + tier badge (Basic/Premium) + `"Kontynuuj →"` link

This replaces the forum widget's role as "something actionable in the sidebar".

**Forum integration — subtle:**

Instead of a full promotional block, add a small `"Dołącz do dyskusji →"` text link inside the Quick Access card or below the countdown.

---

### 3. Glass Design System — Tokens to Use

Consistent across all cards (following NavDrawer patterns):

```
Container:   bg-white/60  backdrop-blur-xl  border border-white/50  shadow-xl shadow-zinc-900/5  rounded-3xl
Cards:       bg-white/40  backdrop-blur-lg  border border-white/60  rounded-2xl
Accent card: bg-gradient-to-br from-rose-500/80 to-rose-600/70  backdrop-blur-sm  border border-rose-400/30
Hover state: hover:bg-white/60  hover:shadow-md  transition-all duration-200
Text primary:   text-zinc-900
Text secondary: text-zinc-500
```

The overall DynamicBoard wrapper gets the glass treatment to match `SidePanel`.

---

### 4. Animation — Framer Motion

Staggered entrance for the grid cards (Framer Motion is already used in the project):

```
initial: { opacity: 0, y: 16 }
animate: { opacity: 1, y: 0 }
transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
```

Onboarding checklist items: smooth height animation when collapsing.

---

## 🗂️ Files Affected

| File | Change |
|------|--------|
| `src/components/UserOnboard.tsx` | Full rewrite → OnboardingHero content |
| `src/app/_components/DynamicBoard.tsx` | Remove 2 stale widgets, add CourseStatusCard, apply glass |
| `src/components/DashboardInfo.tsx` | Glass skin on buttons |
| `src/constants/careerPathsData.ts` | Verify description copy matches marketplace model |
| *(new)* `src/components/CourseStatusCard.tsx` | Small enrollment status widget |
| *(new)* `src/components/OnboardingChecklist.tsx` | Client-side checklist with localStorage |

---

## ❓ Open Decisions — Review Before Implementation

1. **Onboarding checklist** — include it (great SaaS pattern) or keep it simpler without it?
2. **Personalized greeting** — pull Clerk user's first name for "Cześć, [Name]!"? Pattern already exists in `Username` component.
3. **CourseStatusCard** — server-fetched with real enrollment data (`course-actions.ts` has the queries), or a simple static CTA for now?
4. **Feature Discovery cards** — confirm the 4 cards listed above, or different feature set?
5. **Updates widget replacement** — nothing (clean/minimal), or a future CMS-driven "Co nowego" feed?
6. **Forum** — tiny text link in sidebar, or remove from this section entirely?
7. **Course cards CTA** — "Kup dostęp" → link to `/panel/kursy` or `/kierunki/[slug]`?

---

## 🏁 Implementation Order (once plan approved)

1. `DynamicBoard.tsx` — remove stale widgets, apply glass container
2. `UserOnboard.tsx` — rewrite heading, subtitle, course cards (marketplace model)
3. `DashboardInfo.tsx` — glass skin on quick access buttons
4. `ExamCountdown` wrapper — glass card skin
5. `CourseStatusCard.tsx` — new component (server)
6. `OnboardingChecklist.tsx` — new component (client, localStorage)
7. Feature Discovery Grid — inside OnboardingHero
8. Framer Motion entrance animations

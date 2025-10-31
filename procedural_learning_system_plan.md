# 🧭 Procedural Learning System — Challenge Expansion Plan (Evolution Document)

## Document Purpose
This document tracks the evolution of the Procedural Learning System's challenge feature across iterations, showing the journey from initial concept to current implementation plan.

---

## 📋 ITERATION 0: Initial Vision (Original Plan)

### Overall Goal
Build an engaging **Procedural Learning System** where each procedure can have:
- **Interactive training challenges** that reinforce knowledge.
- **Performance tracking & badges** that motivate users.
- **Extensible framework** for adding new challenge types (quizzes, simulations, etc.) easily.

### System Architecture Vision

| Layer | Purpose | Example Implementation |
|-------|----------|------------------------|
| **UI/UX** | User experience & interface design for challenges and progress | Tailwind-based, modular challenge layouts, progress dashboards |
| **Challenge Framework** | Defines challenge types, scoring logic, and dynamic rendering | `ChallengeFactory` component that renders the correct challenge UI |
| **Data Layer (Store + DB)** | Handles procedure data, user progress, and results | Zustand store now → later backed by API + database |
| **Gamification Layer** | Badges, scores, leaderboards | Calculated client-side now, persisted later |
| **Future Integration Layer** | For AI tutoring, analytics, or certification | Hooks for future expansion |

### Challenge Types Roadmap

#### ✅ Current
- **Order Steps (Drag & Drop)** — reorder the steps in the correct algorithm sequence.

#### 📜 Near Future Additions
1. **Multiple-Choice Quiz** — test understanding of procedure details.
2. **Missing Step Challenge** — fill in missing steps.
3. **Visual Challenge** — identify instruments or positions.
4. **Scenario-Based Simulation** — choose actions based on case description.
5. **Time-Based Challenge** — complete task within time.
6. **Spot the Error** — find mistakes in an incorrect procedure.
7. **Practical Reflection** — write reasoning for correct approach.

### Challenge Framework Structure

A scalable system where each challenge type follows a shared interface:

```ts
interface ChallengeType {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  generateData: (procedure: Procedure) => ChallengeData;
  calculateScore: (userAnswers: any, correctAnswers: any) => number;
}
```

### User Flow & Experience

1. User reads a **procedure** (`/panel/procedury`).
2. Clicks **"Wyzwanie procedury"** → navigates to `/panel/procedury/wyzwania`.
3. The page loads challenge(s) for that specific procedure.
4. The system selects or lets user choose a challenge type.
5. After completion:
   - User sees score and feedback.
   - Option to retry or see correct answers.
   - If success ≥ threshold → earns badge for that procedure.

### Gamification & Feedback Ideas

| Feature | Description | Implementation Notes |
|----------|--------------|-----------------------|
| **Score Tracking** | Percentage or XP per challenge | Already supported in `useChallengeStore` |
| **Badges** | Awarded per-procedure or per-skill | Store in DB later |
| **Levels / Ranks** | Aggregate score → unlock advanced content | Use thresholds |
| **Progress Dashboard** | Overview of completed procedures and performance | `/panel` page |
| **Daily Challenges** | Encourage repetition | Random selection + timer |
| **Leaderboards (Future)** | Compare performance across users | Backend feature |

### Technical Implementation Roadmap

#### Phase 1 (Current Focus)
- [ ] Redesign Challenge UI for clarity and engagement.
- [ ] Pass procedure ID to `/panel/procedury/wyzwania`.
- [ ] Generate challenge for that specific procedure.
- [ ] Add ChallengeMenu for selecting different types.

#### Phase 2 (Interactivity Expansion)
- [ ] Add Multiple-Choice Quiz challenge type.
- [ ] Add Missing Step challenge type.
- [ ] Introduce per-challenge scoring + feedback modals.

#### Phase 3 (Gamification Layer)
- [ ] Add persistent user profile and progress (localStorage → DB).
- [ ] Add badges, ranks, and progress UI.

#### Phase 4 (Analytics & AI Assistance)
- [ ] Analyze weak points per user.
- [ ] Personalized challenge recommendations.

---

## 📋 ITERATION 1: Current State (Before Refinement)

### What Exists Now
- Basic drag-and-drop challenge for ordering steps
- Challenge store using Zustand
- Routes: `/panel/procedury/wyzwania` (generic challenge page)
- Client-side state management
- Multiple challenge type ideas planned

### Current Pain Points
- URL structure doesn't connect challenges to specific procedures
- Too many challenge types planned without clear prioritization
- Complex gamification system planned (scores, levels, ranks, leaderboards)
- No server-side persistence
- Zustand store for data that should be server-managed

---

## 📋 ITERATION 2: Refined Implementation Plan (Updated Based on Feedback)

### Core Philosophy: Simplicity & Focus
**"Start simple, build solid foundations, iterate based on real usage"**

### Updated Challenge Types (Prioritized & Refined)

#### ✅ Phase 1: Core Challenges (Implement First)
1. **Knowledge Quiz** (Prioritized #3)
   - Generate questions from procedure steps
   - Test understanding of the algorithm
   - Multiple choice or true/false format
   - **Source of Truth**: Algorithm steps from `procedures.json`
   - **Timer**: Optional time limit per question

2. **Visual Recognition** (Prioritized #4)
   - Identify instruments/positions from images
   - Match tools to their names
   - **Source of Truth**: Images and equipment lists from procedures
   
3. **Spot the Error** (Prioritized #6)
   - Find mistakes in an incorrect procedure sequence
   - **Source of Truth**: Correct algorithm from `procedures.json`

4. **Scenario-Based Decision** (Prioritized #7 - adapted)
   - Present real-world scenarios based on the procedure
   - User makes decisions following the algorithm
   - **Source of Truth**: Algorithm steps guide correct decisions
   - Build scenarios ON TOP of the algorithm, not separately

#### 🔄 Keep from Current Implementation
- **Order Steps (Drag & Drop)** — Already implemented and working

#### ❌ Deferred for Future
- Missing Step Challenge (too similar to Order Steps)
- Time-Based Challenge as separate type (timer will be feature of other challenges)
- Practical Reflection (too complex for MVP)

### Simplified Data Architecture

#### Storage Strategy
```typescript
// Server-side storage only (NO Zustand for challenge data)
interface ChallengeCompletion {
  userId: string;
  procedureId: string;
  challengeType: string;
  completed: boolean;
  completedAt: Date;
  score?: number;
  attempts: number;
}

interface ProcedureBadge {
  userId: string;
  procedureId: string;
  earnedAt: Date;
  allChallengesCompleted: boolean;
}
```

#### Badge System
- **One badge per procedure** (not per challenge, not per skill)
- Badge earned when ALL challenges for that procedure are completed
- Badge image created from procedure's image (from `procedures.json`)
- Stored server-side using Claude's persistent storage API

### Updated URL Structure

```
OLD: /panel/procedury/wyzwania (generic)
NEW: /panel/procedury/[id]/wyzwania (procedure-specific)
```

#### User Flow with New URLs
1. User views procedure: `/panel/procedury`
2. Clicks "Rozpocznij wyzwania" button
3. Navigates to: `/panel/procedury/[id]/wyzwania`
4. Sees ALL challenges available for THIS specific procedure
5. Completes challenges one by one
6. Upon completing all challenges → earns procedure badge

### Simplified Gamification System

#### What We're Building Now
- ✅ **Badges**: One per procedure (earned when all challenges complete)
- ✅ **Progress Tracking**: Track which challenges are completed per procedure
- ✅ **Challenge Completion Status**: Visual indicators for completed/incomplete challenges

#### What We're NOT Building Yet
- ❌ Scores/XP system
- ❌ Levels/Ranks
- ❌ Leaderboards
- ❌ Daily challenges
- ❌ Progress dashboard (separate page)

> **Note**: These can be added later when we have user data showing engagement patterns

### Challenge Mode Structure

#### Single, Focused Mode
```typescript
interface ChallengeMode {
  procedureId: string;
  challenges: Challenge[];
  progress: {
    completed: number;
    total: number;
    challengesCompleted: string[]; // challenge IDs
  };
  badge: {
    earned: boolean;
    imageUrl: string; // Generated from procedure image
  };
}
```

#### No Multiple Modes
- One challenge mode per procedure
- Linear progression through challenges
- Clear completion criteria
- Simple, understandable system

### Technical Implementation Plan

#### Phase 1: Foundation (Week 1-2)
- [ ] Create new route structure: `/panel/procedury/[id]/wyzwania`
- [ ] Build challenge listing page for specific procedure
- [ ] Implement server-side storage for challenge completions
- [ ] Create badge generation system from procedure images
- [ ] Basic progress tracking UI

#### Phase 2: Core Challenges (Week 3-4)
- [ ] Implement Knowledge Quiz challenge
  - Generate questions from algorithm steps
  - Add timer option
  - Score and feedback system
- [ ] Implement Visual Recognition challenge
  - Use procedure images
  - Matching interface
- [ ] Keep existing Order Steps challenge working

#### Phase 3: Advanced Challenges (Week 5-6)
- [ ] Implement Spot the Error challenge
- [ ] Implement Scenario-Based Decision challenge
- [ ] Ensure all challenges use algorithm as source of truth

#### Phase 4: Badge System (Week 7)
- [ ] Badge earning logic (all challenges complete)
- [ ] Badge display in user profile
- [ ] Badge notifications
- [ ] Badge showcase page

### Data Sources & Truth

#### Single Source of Truth
```typescript
// Everything derives from procedures.json
{
  "algorithm": [...], // → Generate quiz questions, scenarios, error detection
  "image": "...", // → Generate badges, visual challenges
  "procedure": "...", // → Context for scenarios
  "name": "..." // → Badge title
}
```

#### Challenge Generation Strategy
1. **Knowledge Quiz**: Parse algorithm steps → generate questions
2. **Visual Recognition**: Use procedure images + equipment lists
3. **Spot the Error**: Create incorrect sequences from correct algorithm
4. **Scenarios**: Build decision trees based on algorithm logic
5. **Order Steps**: Use algorithm array directly (already implemented)

### UI/UX Guidelines

#### Challenge Page Layout (`/panel/procedury/[id]/wyzwania`)
```
┌─────────────────────────────────────────┐
│  ← Back to Procedure                     │
│                                          │
│  Wyzwania: [Procedure Name]             │
│  ═══════════════════════════             │
│                                          │
│  Progress: 2/5 challenges completed      │
│  [████████░░░░] 40%                     │
│                                          │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Quiz Wiedzy  │  │ Rozpoznawanie│   │
│  │   ✓ DONE     │  │   • START    │   │
│  └──────────────┘  └──────────────┘   │
│                                          │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Ułóż Kroki   │  │ Znajdź Błąd  │   │
│  │   ✓ DONE     │  │   🔒 LOCKED  │   │
│  └──────────────┘  └──────────────┘   │
│                                          │
│  🏆 Badge: Not earned yet               │
│     Complete all challenges to earn!    │
└─────────────────────────────────────────┘
```

#### Challenge Card States
- **Not Started**: "START" button, full color
- **In Progress**: "CONTINUE" button, partial progress indicator
- **Completed**: Checkmark, green border, "REVIEW" option
- **Locked**: Lock icon, gray, unlock conditions shown

#### Badge Display
- Small badge preview on challenge page
- Full badge showcase in profile
- Badge notification modal on earning
- Share badge option (future)

### Database Schema (Using Claude Storage)

```typescript
// Storage Keys Pattern
const keys = {
  // Challenge completions
  completion: `challenge:${userId}:${procedureId}:${challengeType}`,
  
  // Procedure badges
  badge: `badge:${userId}:${procedureId}`,
  
  // User progress summary
  progress: `progress:${userId}`,
  
  // Challenge attempts (for analytics)
  attempts: `attempts:${userId}:${procedureId}:${challengeType}`
};

// Storage Values
interface StoredCompletion {
  completed: boolean;
  completedAt: string; // ISO date
  score: number;
  timeSpent: number; // seconds
  attempts: number;
}

interface StoredBadge {
  earned: boolean;
  earnedAt: string;
  procedureId: string;
  procedureName: string;
  badgeImageUrl: string;
}
```

### Migration from Current System

#### What Changes
1. **Remove Zustand store** for challenge data (keep for UI state only)
2. **Update URL routes** from `/panel/procedury/wyzwania` to `/panel/procedury/[id]/wyzwania`
3. **Add server storage** for all challenge completions
4. **Simplify challenge types** to core 4 + existing drag-drop

#### What Stays
1. **Existing Order Steps challenge** (already working)
2. **UI component structure** (can be reused)
3. **Tailwind styling approach**
4. **Challenge completion flow**

### Success Metrics

#### Phase 1 Success
- [ ] User can access challenges from procedure page
- [ ] Challenges are procedure-specific
- [ ] Progress is saved server-side
- [ ] Basic badge system working

#### Phase 2 Success
- [ ] All 5 core challenges implemented
- [ ] Each challenge uses algorithm as source of truth
- [ ] Badges earned and displayed correctly
- [ ] No major bugs or UX issues

#### Long-term Success
- Users complete multiple procedures
- Badge collection becomes motivating
- Challenge completion rate > 60%
- Users return to review/retry challenges

---

## 🎯 Implementation Checklist

### Immediate Next Steps (This Week)
- [ ] Update route structure in Next.js
- [ ] Create new challenge listing page component
- [ ] Implement server storage for challenge completions
- [ ] Design badge generation system
- [ ] Update GridProcedureCard to link to new URL

### Short-term (Next 2 Weeks)
- [ ] Build Knowledge Quiz challenge
- [ ] Implement challenge progress tracking
- [ ] Create badge earning logic
- [ ] Add visual feedback for completions

### Medium-term (Next Month)
- [ ] Complete all 5 core challenges
- [ ] Full badge system with profile display
- [ ] Polish UI/UX based on testing
- [ ] Add challenge analytics

---

## 📝 Notes & Decisions

### Key Decisions Made
1. **Simplified from 7+ challenge types to 5 core types** for MVP
2. **Changed from client-side Zustand to server-side storage** for persistence
3. **Updated URL structure** to make challenges procedure-specific
4. **Removed complex gamification** (scores, levels, ranks) in favor of simple badges
5. **Algorithm as single source of truth** for all challenge generation

### Future Considerations
- Analytics to understand which challenges are most engaging
- A/B testing different challenge formats
- Social features (share badges, challenge friends)
- Progressive difficulty within challenge types
- Custom challenge creation by instructors

### Open Questions
- Should challenges unlock sequentially or all at once?
- What's the minimum completion threshold for badge (100% or allow some failures)?
- Should there be a time limit for earning badges (e.g., complete within 30 days)?
- Do we need a practice mode vs. test mode?

---

## 🔄 Iteration Summary

| Aspect | Iteration 0 | Iteration 1 | Iteration 2 |
|--------|-------------|-------------|-------------|
| **Challenge Types** | 7+ planned | 1 implemented | 5 core types |
| **Storage** | Zustand + future DB | Zustand only | Server-side only |
| **URL Structure** | `/panel/procedury/wyzwania` generic | Same | `/panel/procedury/[id]/wyzwania` specific |
| **Gamification** | Complex (scores, ranks, leaderboards) | None | Simple badges only |
| **Truth Source** | Not clearly defined | Algorithm assumed | Algorithm explicit |
| **Badges** | Per-procedure and per-skill | Not implemented | One per procedure |
| **Focus** | Broad feature set | Single feature | Core features done well |

---

**Last Updated**: October 31, 2025  
**Status**: Ready for Implementation - Phase 1  
**Next Review**: After Phase 1 completion (2 weeks)
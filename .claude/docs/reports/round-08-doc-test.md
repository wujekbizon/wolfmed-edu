# Doc-Test Report — Round 8

Primary task per round 7's recommendation: a **reverse-direction check** — pick source files first, not doc claims, and ask "is this actually documented, and accurately." Every prior round started from a doc sentence and validated forward; this round started from the filesystem.

---

## Part A — Mechanical checks

Link validation: 0 broken (148 links, +1 for the new `28-queries.md`). Referenced-file existence (`reports/` excluded): 146 paths, 0 missing. `file:line` sample, 8 references re-verifying round 7's own new claims (`CreateTestTabs.tsx`, `pptx.ts`, `assemble.ts`, `buildAccessibleCategories.ts`, `timeSegments.ts`, `questionnaireOptions.ts`, `materials.ts`): 7/8 had an actual line claim to check, all 7 accurate (the 8th was an imprecise sample pick on my part, not a doc failure). 48/48 across all rounds that have run this check now that only genuine claims are counted.

## Part B — The reverse-direction check

Picked `src/server/queries.ts` first, purely because it's a name that appears constantly in cross-references (`getUserEnrolledCourses`, `getAllBlogPosts`, etc.) — then checked whether the *file itself* was ever documented as an entity.

### F-18 (Major gap, now fixed) — `src/server/queries.ts` was never catalogued
2,601 lines, 136 exported functions — the largest file in the codebase — referenced by individual function name dozens of times across nearly every doc in this set, but with **no dedicated catalog**, unlike `src/actions/actions.ts` (which got the same kind of file, at similar or larger scale, fully broken down in [`21-server-actions.md`](./21-server-actions.md) back in the original documentation pass). This means Golden Rule #3 ("check for an existing query before writing one") had no practical way to be followed for this file — a reader would have to grep 2,601 lines by hand, which is exactly the situation the whole doc set exists to prevent.

Fixed: new [`28-queries.md`](./28-queries.md), all 136 functions grouped into 18 domains (tests, procedures, diagnozy, blog, forum, notes, materials, flashcards, lectures, cells, courses, planner, user profile, testimonials, admin/messages, etc.), cross-linked from the flow docs that already used specific functions from it. Flagged three names (`getUserStats`, `getDetailedTestHistory`, `getCategoryPerformance`) as worth a closer look for possible overlap in a future round, in the same spirit as the `buildAccessibleCategories`/`populateCategories` finding — not confirmed, just flagged honestly as unconfirmed rather than either asserted or ignored.

### F-19 (Smaller gap, now fixed) — four small `src/server/*.ts` utility files were referenced but never described
Checking a few more files the same way (`user.ts`, `premium.ts`, `flashcardAccess.ts`, `rag-queries.ts` — each under 55 lines) found they're all mentioned in passing within flow docs but never given even a one-line "what is this file" treatment. Small individually, but worth fixing together: two of them (`getCurrentUser`, `getIsPremium`) share a genuinely useful pattern — both wrapped in React's `cache()` specifically so a page with several independent Suspense boundaries doesn't re-run `auth()`/a DB query once per boundary. Neither this pattern nor its rationale was documented anywhere. Added a "Small server utility modules" section to `00-architecture.md`, including a stale-comment observation (`user.ts`'s own header comment says `server/queries/user.ts`, a leftover from a prior move) and a new testing-guide case (TC-17) that verifies the dedup is request-scoped, not cross-request stale caching.

### Targeted spot checks (secondary to the reverse-direction check)
Quick fresh lookups against `01-database-schema.md` (testSessions' documented columns/indexes) and via the new `28-queries.md` cross-references confirmed accurate against source — no findings, clean.

---

## Priority fix list for next round

1. Follow up on the three flagged-but-unconfirmed possible-overlap names in `28-queries.md` (`getUserStats`/`getDetailedTestHistory`/`getCategoryPerformance`) — read all three and confirm or clear them, the same way round 7 did for `buildAccessibleCategories`/`populateCategories`.
2. The reverse-direction method (round 8) and the hedge sweep (round 7) have now each found a category of problem the forward, task-based rounds (1–6) structurally couldn't. Round 9 should combine them: pick another handful of source files reverse-direction, but specifically ones near the two biggest already-catalogued files (`actions.ts`, `queries.ts`) in case there are smaller siblings still missed — e.g. is there a `src/server/*.ts` file this round didn't check yet?
3. `20-forms-catalog.md` still hasn't had a dedicated task round — every round so far has touched it only incidentally via cross-references from flow docs.

## Running tally across all 8 rounds

- **15 numbered README audit-note findings** (unchanged this round — F-18/F-19 are pure doc-coverage gaps, filed as fixed-in-place the same way F-13 rate-limiting and F-6 scripts were, not added to the app-behavior audit list).
- **Testing guide**: 17 cases.
- **New catalog doc**: `28-queries.md`, closing what was probably the single largest remaining coverage gap in the entire doc set.
- Mechanical checks: 0 broken links, 0 missing files, 48/48 `file:line` accuracy.
- Two structurally different methods (round 7's hedge sweep, round 8's reverse-direction check) have now each outperformed simple task-based lookups at finding real problems — worth keeping both as recurring practices alongside task-based testing, not treating either as a one-off.

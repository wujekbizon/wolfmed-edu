# Doc-Test Report — Round 1

Tester posture: a moderately technical reader with **only** `.claude/docs/` open (starting from `README.md`), attempting real tasks — find code, trace a bug, answer a design question — then verifying every claim/pointer against the actual source. Caveat on method: since I (the same session) wrote these docs, true blindness isn't possible: I mitigated this by (a) navigating strictly via the doc links/tables as written rather than recalling file locations from memory, and (b) running mechanical cross-checks (link validation, file-existence validation) that don't depend on memory at all — those caught a real bug (see F-1).

Each task below also produced a manual QA test case, now living in [`40-testing-guide.md`](../40-testing-guide.md) — the "2 in 1" per the ask.

---

## Scoring key

- **Hops**: number of doc files opened before the answer was fully in hand.
- **Precision**: did the doc give an exact `file.ts:line`, or just a filename, or just a vague area.
- **Accuracy**: verified against current source — pass/fail.
- **Verdict**: ✅ good · ⚠️ friction · ❌ failed

---

## Task results

| # | Task | Hops | Precision | Accuracy | Verdict |
|---|---|---|---|---|---|
| T1 | Find the code that grades a submitted test | 2 (README→31) | exact `actions.ts:196` + helper files | ✅ | ✅ |
| T2 | Bug trace: "timer says over, does submit still work?" | 1 (same doc, no extra hop) | inline explanation, no ambiguity | ✅ | ✅ |
| T3 | Which table/function actually grants course access after payment | 2 (README→30) | exact `course-actions.ts:89`, exact table name | ✅ | ✅ |
| T4 | Find the component + action behind the blog like button | 2–4 (see F-1 below) | present in 4 docs, **absent from the one titled "components catalog"** | ✅ where found | ⚠️ |
| T5 | Find the exact Zod schema for "create forum post" | 2 (README→20) | schema **name** + file (`schema.ts`) given; no line number in a 1104-line file | ✅ but incomplete | ⚠️ |
| T6 | Check for an existing "format duration in minutes" helper before writing one | 2 (README→25) | found two candidates by name, no code shown to disambiguate | ✅ | ⚠️ |
| T7 | How does the tutor decide to include personal notes? | 1 (README's own FAQ bullet → 00) | exact condition (`mode === 'canonical_with_personal'`) + gating flag | ✅ | ✅ |
| T8 | Where to add a new shared button style | 2 (README→24 or 26) | both `ui/Button.tsx` and `constants/buttonStyles.ts` correctly named | ✅ | ✅ |
| T9 | What happens to AI memory data on account deletion | 2 (README→30) | exact function + explicit "why" (no FK) | ✅ | ✅ |

**6/9 clean passes, 3/9 with real friction.** Below are the three friction findings plus two more that came out of mechanical verification rather than task-simulation.

---

## Findings

### F-1 (Bug, now fixed) — `DynamicBoard` file path was wrong
`11-pages-panel-core.md` said `src/app/panel/_components/DynamicBoard.tsx`. The real file is `src/app/_components/DynamicBoard.tsx` (the shared root `_components`, reused via a relative import from the panel page). Caught by a mechanical check (extract every `` `src/...` `` path referenced across all docs, verify each exists on disk), not by task simulation — meaning **task-based testing alone would have missed this** unless the tester happened to click through to that exact file. **Already fixed** in this round.

**Process takeaway**: the file-existence check is cheap (one grep + loop) and should run every round, not just when convenient. Recommend making it step zero of every future round.

### F-2 (Real gap) — The "components catalog" doesn't cover every component
`26-components.md` documents `src/components/` (591 files) exhaustively, but `BlogLikeButton`, `Navbar`, `ContactForm`, `Hero`, and every other route-local component in `src/app/*/_components/` (**32 files total**, all under `src/app/_components/`, plus none currently in other route segments) are entirely absent from it. They *are* documented — but only incidentally, inside page-flow docs that happen to mention them — so a reader who goes straight to "the components catalog" because that's the doc whose stated job is "document all components" will conclude a component doesn't exist when it does.

This is the single highest-value fix from this round: it's exactly the kind of thing Golden Rule #3 ("check before writing") depends on being complete, and it currently isn't.

**Recommended fix**: add a short section to `26-components.md` (or a new `26b-route-components.md`) listing all `src/app/**/_components/*` files the same way, with a one-line note explaining the routing convention (route-local vs. shared `src/components/`).

### F-3 (Friction) — Schema catalog has no line numbers into `schema.ts`
`20-forms-catalog.md` correctly says every schema lives in `src/server/schema.ts`, but that file is 1104 lines with ~70 schemas, and no doc gives per-schema line numbers (unlike server actions, which do get `file.ts:line`). A reader still has to grep the file themselves — a small but real gap given every *other* precise pointer in this doc set includes a line number.

**Recommended fix**: either (a) add a line number column to the forms-catalog table, or (b) add a short `schema.ts` index (schema name → line) as an appendix — (a) is less work and keeps the info where it's used.

### F-4 (Friction) — Helper-duplication check requires reading source, not just the catalog
T6 (checking for an existing "format minutes" helper before writing one — the exact workflow Golden Rule #3 exists for) surfaced two candidates by name (`formatCompactMinutes.ts`, `formatMinutes.ts`) but the catalog's one-line descriptions ("Duration formatting, compact vs. full variants") don't show either function's signature or an example output, so a reader still can't tell which one fits their case without opening both files. This is a **lower-severity** version of F-2's problem: findable, but not *sufficient* to decide without a source read.

**Recommended fix**: for helpers with more than one plausible near-duplicate name (there's a short list of these, see the existing audit note about `flashcardCellHelpers` vs `parseFlashcardCellContent`), add the function signature (params + return type) inline rather than just a prose description — this is cheap for exactly the ambiguous cases and not worth doing for all 119.

### F-5 (Process note, not a doc bug) — Mechanical checks worth running every round
Two checks this round cost almost nothing and found real issues (or confirmed their absence) with certainty a task-simulation can't match:
1. **Internal link validation** (every `](./*.md)` resolves to a real file) — 0 broken links this round, but cheap enough to always run.
2. **Referenced-file existence check** (every `` `src/....ts` `` path mentioned resolves on disk) — found F-1.

Neither check catches *stale line numbers* (a correct file, wrong line, after an unrelated edit shifts things) — that would need a targeted spot-check of a sample of `file:line` references each round, since checking all ~150 of them exactly isn't cheap. Recommend sampling ~10 per round, weighted toward the docs least recently re-verified.

---

## Priority fix list for this round

1. ~~Fix `DynamicBoard` path in `11-pages-panel-core.md`~~ — done.
2. **Add route-local `_components/` coverage to the components catalog** (F-2) — highest value, closes a real "document all" gap.
3. Add line numbers to the forms-catalog schema column (F-3).
4. Add signatures for the small set of near-duplicate-named helpers (F-4).
5. Adopt the two mechanical checks (F-5) as a standing step-zero for every future round, and add a sampled `file:line` spot-check.

## What NOT to change

Six of nine tasks resolved cleanly in ≤2 hops with exact, verified pointers — the flow docs (`3x`) in particular performed the best of anything tested (T1, T2, T3, T7, T9 all clean), which suggests the "trace end-to-end with exact file:line + the *why*" format from the last work session is the right level of depth and shouldn't be diluted chasing the fixes above.

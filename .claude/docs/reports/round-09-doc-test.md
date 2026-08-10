# Doc-Test Report — Round 9

Triggered by a user request to find what's still missing, rather than a scheduled round. Combined two threads: (1) close out real source drift found by a fresh look at git history, (2) work through round 8's own "priority fix list for next round" — the three items it left open.

---

## Part A — Source drift: PR #54 ("kierunki course UX")

`git log -1 -- .claude/docs` vs. `git log <that commit>..HEAD -- src/` showed exactly one PR had landed since the docs' last update: 34 files, a new `/kierunki/[slug]` questions-hero variant and a collapsible plan-comparison panel. None of it was in the docs yet. Fixed across 8 files (`10-pages-public.md`, `26-components.md`, `24-constants.md`, `25-helpers.md`, `22-hooks.md`, `27-state-stores.md`, `23-types.md`, `README.md`) — new components (`PathQuestionsHero`/`PathQuestionList`/`PathQuestionItem`/`PathShotCollage`, `PlanComparisonPanel`/`PlanComparisonToggle`), new constants/types/hooks/helpers/store backing them, and two **wrong** pre-existing entries fixed in the same pass (`careerPath.ts`/`careerStory.ts` were documented as exporting `CAREER_PATH`/`CAREER_STORY`; the actual exports are `OPIEKUN_MEDYCZNY_PATH`/`OPIEKUN_MEDYCZNY_STORY`). Also caught the `src/constants/` file count had been wrong (61 claimed) even before this PR — corrected to 65.

## Part B — Round 8's open items

### 1. Resolved: the flagged `getUserStats`/`getDetailedTestHistory`/`getCategoryPerformance` trio in `28-queries.md`
Read all three directly. **Not a duplication** — three different shapes over overlapping tables for three different UI needs: `getUserStats` is an O(1) read of denormalized lifetime counters off `users`; `getDetailedTestHistory` returns one row per completed test for a history list; `getCategoryPerformance` aggregates the same join **by category** for a breakdown chart. Unlike `buildAccessibleCategories`/`populateCategories` (README audit note #14), this one clears. Documented the resolution in place in `28-queries.md` rather than leaving it hedged.

### 2. Ten more undocumented `src/server/*.ts` files, one level deeper than round 8's four
Round 8 checked flat `src/server/*.ts` files. This round checked the subdirectories (`library/`, `memory/stores/`, `vertex-rag/`, `db/`) the same way and found 10 files referenced constantly by the flow docs but never described as files: `library/chunk.ts`, `library/index-source.ts`, `library/attached-source.ts`, `memory/stores/episodes.ts`, `memory/stores/facts.ts`, `memory/stores/preferences.ts`, `vertex-rag/client.ts`, `vertex-rag/ingest.ts`, `vertex-rag/errors.ts`, `db/populateDb.ts`. Added a new section to `00-architecture.md` covering all 10 with real signatures and the "why" behind each (e.g. `index-source.ts`'s content-hash diffing exists because Neon bills instant-restore storage per GB of write history, not just because it's tidier).

### 3. `20-forms-catalog.md` — first dedicated verification round
Two checks, both clean:
- **Reverse**: grepped every `useActionState(` call site in the codebase (66 sites, 51 unique actions) and confirmed every action name appears in the catalog. One miss (`createPost`) was a JSDoc example in `useToastMessage.tsx`, not a real form.
- **Forward**: diffed all 72 `export const *Schema` names in `schema.ts` against the catalog's line-index table — table itself is complete (72/72). Only the prose above it was stale ("68 exported schemas" — corrected to 72).

`20-forms-catalog.md` turns out to be in excellent shape; the "never directly tested" flag from rounds 6–8 was about task *selection*, not an actual gap.

### Extra: reverse-checked `01-database-schema.md` the same way
Diffed all 40 `createTable(...)`-defined tables across `schema.ts`/`library-schema.ts`/`memory-schema.ts` against the doc. One genuine gap: **`customersMessages`** (the contact-form/`/admin/messages` table) was never in the schema doc at all, despite being referenced by name in three other docs. Added it.

---

## Priority fix list for next round

1. This round's reverse-direction sweeps (server internals, forms, schema) each found exactly one real gap and otherwise came back clean — the doc set appears to be approaching the point where blind sweeps have diminishing returns. Round 10 should go back to **task-based** lookups (round 8's own observation: task-based and reverse-direction are structurally different failure modes, keep rotating both) rather than another blanket reverse sweep.
2. `src/actions/` (27 files) has never been reverse-checked the way `queries.ts`, `schema.ts`, and `server/*.ts` now have — worth one pass: does every exported action function actually appear in `21-server-actions.md`?
3. No round has stress-tested `14-api-routes.md` (cron jobs, webhooks, SSE) directly.

## Running tally across all 9 rounds

- **15 numbered README audit-note findings** (unchanged this round — all of this round's fixes were pure doc-coverage/accuracy gaps, filed as fixed-in-place, not app-behavior findings).
- New coverage: a "Personal-library, memory-store, and Vertex internals" section in `00-architecture.md` (10 files), a resolved-not-duplicated note in `28-queries.md`, a `customersMessages` table entry in `01-database-schema.md`, full PR #54 coverage across 8 files.
- Mechanical spot checks this round: schema-export count (72, corrected from 68), constants file count (65, corrected from 61), components file count (597/629, corrected from 591/623), helpers (121, corrected from 119), stores (28, corrected from 27) — all via direct `find`/`grep` against source, not estimated.

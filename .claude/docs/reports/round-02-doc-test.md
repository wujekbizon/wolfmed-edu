# Doc-Test Report — Round 2

Same posture as round 1: doc-only navigation for task-based checks, mechanical checks that don't depend on memory at all for the rest. This round has two halves: **retest** (did round 1's fixes actually land) and **fresh coverage** (new tasks, new mechanical checks).

---

## Part A — Retesting round 1's fixes

| Finding | Retest | Result |
|---|---|---|
| F-1 (`DynamicBoard` wrong path) | Grep the live doc (not the report, which correctly still quotes the old path as history) for the old wrong path | ✅ Fixed — `11-pages-panel-core.md` now correctly says `src/app/_components/DynamicBoard.tsx` |
| F-2 (components catalog missing route-local files) | Search `26-components.md` for `BlogLikeButton` | ✅ Fixed — now listed, with its flow cross-reference |
| F-3 (no schema line numbers) | Search `20-forms-catalog.md` for `CreatePostSchema`'s line | ✅ Fixed — 68-entry alphabetical index added, line 84 confirmed correct against source |
| F-4 (ambiguous near-duplicate helpers) | Check `25-helpers.md` for both flashcard-parser and both minute-formatter signatures | ✅ Fixed — real signatures + disambiguating notes present for both pairs |

All four confirmed fixed. While applying F-4, four more previously-speculative audit notes (`testData.ts` liveness, `useSettingsStore` vs. `useSettingsModalStore`, `commands.ts` vs. `toolCommands.ts`) got resolved by actually reading the code rather than left as "worth checking" — see the README's audit list, items 3/4/7/8 are now struck through with confirmed answers instead of open questions.

---

## Part B — Mechanical checks (step zero, per round 1's F-5 recommendation)

1. **Internal link validation** (every `](./*.md)` across all docs, including the new `3x`/`40`/`reports/` files): **0 broken links.**
2. **Referenced-file existence check** (every `` `src/....ts` `` path across all docs resolves on disk): 149 unique paths checked, **2 flagged, both false positives** — one is `round-01-doc-test.md` correctly quoting the *old, wrong* path as part of describing the bug it found (expected — it's a historical record, not a live claim), the other is a literal `` `src/....ts` `` placeholder-with-ellipsis in that same report's prose, not a real path. **Process note**: the checker should exclude `reports/*.md` from "live claim" scoring going forward, since reports intentionally quote past-tense content. Zero real misses.
3. **Sampled `file:line` drift check** (8 references picked across 6 different docs, verified the line still contains the claimed function): **8/8 accurate**, zero drift. Expected, since no source files changed between rounds — this check earns its keep more in rounds where source has actually moved.

---

## Part C — New task-based coverage

| # | Task | Result |
|---|---|---|
| T10 | Find whether/how `/scripts` (DB seeding, RAG migration, etc.) is documented | ❌ **Real gap** — see F-6 below |
| T11 | Confirm storage-quota enforcement is documented with the actual limit and refund-on-delete behavior | ✅ Found cleanly in `32-flows-learning-content.md` Flow 2, 2 hops |
| T12 | Confirm cron endpoints' auth mechanism is documented | ✅ Found cleanly in `14-api-routes.md`, 1 hop from README's cron row |
| T13 | Check whether a material's indexing status can ever change after upload | ⚠️ **Real finding** — see F-7 below (turned into a testing-guide edge case + audit note, not left unresolved) |

### F-6 (Gap, now fixed) — `/scripts` was almost entirely undocumented
18 files in `/scripts/`, 10 of them wired to `package.json` commands (`db:seed*`, `rag:*`, `test:diagnozy`, etc.) referenced throughout root `CLAUDE.md`'s Development Commands section, but only one script (`seed-procedures.ts`) got an incidental one-line mention anywhere in `.claude/docs/`. A new engineer asking "how do I seed my local DB" or "what does `rag:preflight` actually do" had no answer. **Fixed this round**: added a "Scripts & operational tooling" section to `00-architecture.md` — command → script → one-line purpose for everything wired to `package.json`, plus a list of the unwired scripts present in the directory.

### F-7 (Product-behavior question, not just a doc gap) — Materials have no post-upload indexing path
While verifying T11's storage-quota coverage, checked whether the same "edit re-triggers indexing" upgrade path documented for notes (`updateNoteContentAction`) also applies to materials. It doesn't, and the reason is structural, not just undocumented: a basic-plan material is saved with `indexStatus: 'not_indexed'`, a status the `library-index` cron backstop doesn't retry (it only picks up `pending`/`failed`), and there is no `updateMaterialAction` at all to re-trigger indexing the way editing a note does. **This means a material uploaded before a premium upgrade appears permanently unsearchable unless deleted and re-uploaded** — a real asymmetry with the notes flow. Documented in `32-flows-learning-content.md` Flow 2, flagged as README audit note #10, and written up as a testing-guide edge case (TC-8) so it gets verified against actual running behavior rather than staying a code-reading inference. This is exactly the kind of thing task-based doc-testing is supposed to surface — it came from asking "is this really true for materials the way it's true for notes," not from a mechanical check.

---

## Priority fix list for next round

1. Confirm F-7 against the actual running app (or with whoever owns product intent) — is "no re-index on upgrade" intentional? This determines whether it graduates from an audit note to an actual bug ticket.
2. Consider whether `/scripts` deserves anything beyond the one-line-per-script table added this round — e.g. `MANNEQUIN.md` (already in the scripts dir) suggests the mannequin-prep pipeline might be complex enough to want its own short flow write-up if anyone other than the original author needs to touch it.
3. Scope the mechanical file-existence/link checks to skip `reports/*.md` (or tag report-quoted paths some other way) so future rounds don't have to manually re-triage the same two expected false positives.
4. No task in either round has yet stress-tested the **admin-side** docs (`13-pages-admin.md`) or the **hooks catalog** (`22-hooks.md`) directly — round 3 should pick tasks from those specifically for coverage balance, since every task so far has landed in pages/flows/actions/helpers.

## What's holding up well across both rounds

The `3x-flows-*` docs continue to be the strongest performers — every task routed through them (T1, T2, T3, T7, T9, T11, T12, T13) resolved in ≤2 hops with an exact, verified pointer, and it's specifically the flow docs' habit of stating *why* a piece of logic exists (not just what it does) that surfaced F-7 — a reader chasing "why doesn't this have the same upgrade path as notes" only gets there because the notes flow doc explained its own upgrade-path reasoning clearly enough to notice materials' absence of one.

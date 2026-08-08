# Doc-Test Report — Round 6

Per round 5's notes: ran one deliberately broad, multi-step task instead of only point lookups, plus fresh lookups against `26-components.md` (untested directly since round 1).

---

## Part A — Mechanical checks

Link validation: 0 broken. Referenced-file existence (`reports/` excluded): 148 paths, 0 missing. `file:line` sample, 8 fresh references spanning `rateLimit.ts`, `uploadthing/core.ts`, a cron route, `ensureAdmin.ts`, `actions.ts`, `rag.ts`, `generatedQuizzes.ts`, `lectures.ts`: **8/8 accurate** (one sample point turned out not to correspond to an actual doc claim — noted, not counted as a failure or a pass, just an imprecise pick on my part this round). 32/32 accurate across the four rounds this check has run.

Also re-verified the component counts from round 1's F-2 fix haven't drifted: `src/components/` still 591 files, `src/app/_components/` still 32 — the "623 total" claim in `26-components.md` still holds.

## Part B — The broad task

**T30 (primary, multi-step)**: *"I'm new here. Using only `.claude/docs`, figure out everything I need to add a new AI tutor `/command` — where it's registered, what shape it needs, what makes it actually generate content, and where the UI trigger lives."*

This is exactly the kind of task all five prior rounds avoided — not "does X exist," but "can the docs actually onboard someone to build something." Result: **got most of the way there, but hit two real problems along the way**, both now fixed.

1. Following the trail (`33-flows-ai-tutor.md` → `24-constants.md` → `23-types.md` → `22-hooks.md`) successfully identified all the moving pieces exist: `TOOL_COMMANDS` (routing/UI), `TOOL_DEFINITIONS` (model-facing schema), an executor that dispatches by tool name, and an autocomplete hook. But no single doc ever assembled these into "here's what you touch, in order, to add one" — each doc mentioned its own piece in isolation. This is the same shape of problem as round 4/5's F-13 (rate limiting): individually-true facts scattered across docs that never got assembled into the one place someone doing the actual task would look.
2. Worse, chasing down `executeToolWithContent`'s actual file hit a **documented ambiguity that was simply wrong**: `33-flows-ai-tutor.md` said it lives in `"src/server/vertex-rag/index.ts" or "src/server/tools/executor.ts"` — an "or" that should have been a red flag on sight (a hedge on a fact that's checkable in one grep). Grepped for the real export: it's in `src/server/vertex-rag/generate.ts`, a location neither guess named. **This is the kind of thing the `file:line` sampling check doesn't catch** — it only samples claims that already have a specific line number attached; a deliberately-hedged "or" claim has nowhere to sample from. Worth naming as a blind spot in the mechanical-check layer, not just a one-off miss.

### F-15 (Real gap + inaccuracy, both fixed) — the command system had no assembled "how to add one" and one wrong file pointer
Fixed both in `33-flows-ai-tutor.md`:
- Corrected the `executeToolWithContent` location to `src/server/vertex-rag/generate.ts:116`, stated plainly (no hedge) since it was actually checked this time.
- Added a "How to add a new `/command`" section: the exact three files (`toolCommands.ts` → `definitions.ts` → `executor.ts`), what each one is for, and — the detail that matters most for someone doing this for real — what happens if any one of the three is skipped (each fails differently: unreachable, fails at the model call, or an unhandled dispatch case). Read `toolCommands.ts`'s own header comment and `definitions.ts`/`executor.ts`'s actual structure to write this accurately rather than inferring it.

### T31 (secondary, components catalog) — clean
Two fresh lookups (`FlashcardCellPreview`, the full `diagnozy/wypelnij/` component list) both resolved in 1 hop with no discrepancy against source. `26-components.md` holds up on direct re-test.

---

## Priority fix list for next round

1. **The "or"/hedge blind spot (from F-15) is worth a dedicated sweep**: grep all docs for hedge language ("presumably," "likely," "or," "probably") the same way round 3 swept for unverified "admin-only" claims. Every hedge in this doc set is a place a fact was asserted without checking — some may be genuinely unknowable from static reading (fine to hedge), but each one deserves the same "is this actually checkable in one grep" test that `executeToolWithContent` just failed. Do this as round 7's primary task.
2. Continue rotating: no round has yet deliberately targeted `01-database-schema.md` with a fresh lookup task (only touched via other docs' cross-references) or `20-forms-catalog.md` beyond the schema-index fix in round 1.

## Running tally across all 6 rounds

- 15 testing-guide cases, unchanged this round (F-15 is a developer-workflow finding, not a user-facing behavior, so it didn't need a QA case the way app-behavior findings do).
- Mechanical checks: 0 broken links, 0 missing files, 32/32 `file:line` accuracy — still holding, but round 6 is the first round to show the *limit* of what mechanical checking alone can catch (hedged claims have no line to sample).
- Every real finding across 6 rounds continues to come from either task-based tracing or checking a claim against source — this round adds "checking a *hedged* claim against source" as a specific sub-case worth doing on purpose, not by accident.

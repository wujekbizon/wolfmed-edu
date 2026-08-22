# Doc-Test Report — Round 7

Primary task per round 6's recommendation: sweep every doc for hedge language ("presumably," "likely," "probably," "appears to," "possibly," "implied by," "not shown above") and check each one against source, the same deliberate way round 3 swept for unverified "admin-only" claims.

---

## Part A — Mechanical checks

Link validation: 0 broken (147 links). Referenced-file existence (`reports/` excluded): 147 paths, 0 missing. `file:line` sample, 8 fresh references across `admin-rag-actions.ts`, `toolCommands.ts`, `definitions.ts`, `executor.ts`, `generate.ts`, `memory/config.ts`, `library-schema.ts`, `blogCategories.ts`: **8/8 accurate**, 40/40 across the six rounds this check has run.

## Part B — The hedge sweep

Grepped all non-`reports/` docs for hedge patterns. Two hits were false positives (describing a hypothetical student's note as "possibly wrong" — not a hedge on a code fact, just normal prose). **13 real hedges found, all 13 checked against source, all 13 resolved** — 9 confirmed-and-restated-as-fact, 2 turned out to be **wrong** (real corrections), and 2 turned into **new real findings** (not just documentation gaps — actual unused/duplicated code).

| Hedge | Resolution |
|---|---|
| `CreateTestTabs` "likely covering manual/AI/upload" | Confirmed close but imprecise — exact 3-tab structure documented (upload is nested inside the "create" tab, not a sibling; a "manage" tab existed and wasn't mentioned at all). |
| `deleteMaterialAction` "presumably" deletes the UploadThing file | Confirmed exactly true — restated as fact. |
| `importPptxAction` "likely as note/material content" | **Wrong.** Traced its one caller (`PptxImportPanel.tsx` → `BlogPostForm.tsx`): it's an admin blog-post-authoring aid, not a general content path. Also surfaced that `13-pages-admin.md` never mentioned this component at all — added. |
| `testData.ts` "appears to overlap... worth confirming if dead" | Already resolved in round 2 (it's live) but this doc's own prose was never updated to match — synced. |
| `questionnaireOptions.ts` "likely tied to" `enums.ts` | Confirmed — restated as fact. |
| `timeSegments.ts` "likely for scheduling/planner UI" | **Wrong-ish.** Its only consumer is `CountdownTimer.tsx` — a generic countdown, not planner-specific. Corrected. |
| `populateCategories.ts` "likely composes" `buildAccessibleCategories.ts` | **Wrong, and a real finding** — see F-16 below. |
| `getDeviceMeta.ts` "likely for analytics or responsive behavior" | More specific than guessed: its one caller is `StartTestForm.tsx` — test-start telemetry, not general analytics. Corrected. |
| `useMobileStore`'s `setIsMobile` "likely a resize listener" | **Wrong, and a real finding** — see F-17 below. |
| `generateTree` "presumably calling `retrieveContext()`" | Confirmed — restated as fact. |
| `isSelfStateQuestion` "`gate.ts` presumably" | **Wrong.** Actually in `assemble.ts:130`. Corrected. |

### F-16 (Real finding — duplicated logic) — `buildAccessibleCategories.ts` and `populateCategories.ts` independently implement the same access filter
Checking the hedge ("likely composes") meant actually reading both files instead of trusting the guess. They don't compose — they're two separate implementations of the identical course-access + tier-filter algorithm, serving different callers (`NaukaCategoriesSection.tsx` vs. most of `/panel`'s category pages). This is exactly the failure mode Golden Rule #3 ("check `/src/helpers` for an existing one before writing a new one") exists to prevent — and unlike round 1's flashcard-helper false alarm (which turned out to be two genuinely different things), this one is real: same logic, two copies. Documented in `25-helpers.md`, flagged as README audit note #14, and given a testing-guide case (TC-16) that checks whether the two copies have actually drifted into disagreeing outputs — which would upgrade this from a cleanliness issue to an active bug.

### F-17 (Real finding — dead code) — `useMobileStore` is defined but never used
The hedge ("likely a resize listener calls this") assumed a caller existed somewhere and guessed at its nature. Grepping for the actual caller — `setIsMobile` anywhere, `useMobileStore` anywhere outside its own file — returned **nothing**. The store is exported and fully implemented but has zero consumers. Documented in `27-state-stores.md` and flagged as README audit note #15. Not a documentation problem to fix; a candidate for actual removal, though that's a code decision outside this documentation pass.

---

## Priority fix list for next round

1. F-16 and F-17 are the first two findings that came from *systematically* checking hedges rather than incidentally noticing one was wrong (round 6's `executeToolWithContent` was incidental). The hedge sweep paid for itself well beyond round 6's single fix — worth treating as a standing practice: **never leave a hedge in a doc without at least one attempt to resolve it**, and when adding new doc content going forward, resolve the claim before writing it rather than hedging and moving on.
2. No round has done a **read-in-reverse** check yet — picking a source file directly (not starting from a doc claim) and confirming it's accurately represented somewhere. Every check so far started from a doc claim and validated forward. Round 8 could pick 5–10 source files at random and verify each is (a) mentioned somewhere in the docs and (b) accurately described, which would catch a different failure mode: a file that's simply never been looked at, versus one that was looked at and mis-described.
3. `01-database-schema.md` and `20-forms-catalog.md` remain the least directly-tested docs across 7 rounds (per round 6's note, still true).

## Running tally across all 7 rounds

- **15 numbered README audit-note findings**: 4 resolved-as-fine, 11 real (ranging from cosmetic to the newly-added F-16/F-17, which are actual code issues, not just documentation ones).
- **Testing guide**: 16 cases.
- Mechanical checks: 0 broken links, 0 missing files, 40/40 `file:line` accuracy across 6 rounds that ran it.
- This round's method (systematic hedge-checking) found more real issues per hour spent than any prior round's targeted-lookup approach — worth keeping as a recurring practice, not a one-off, even as future rounds also pick up round 6/7's other open recommendations (broad tasks, reverse-direction checks, remaining doc coverage).

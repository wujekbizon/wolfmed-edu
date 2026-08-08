# Doc-Test Report — Round 16

Continuing the symptom-first sweep: learning-planner races, PPTX import, and mannequin/diagnozy body-zone grading.

---

## Scenario 11 — "Admin reports: PPTX import doesn't seem to create notes or materials like the docs say it should."

**❌ MISLED — real cross-document inconsistency, now fixed.** This is a different failure shape than rounds 13–15: not a code bug, and not even a single wrong doc — a **stale entry that survived a previous correction**. `13-pages-admin.md` and `21-server-actions.md` both already correctly state (the latter explicitly, "not a general note/material creation path") that `importPptxAction` is an **admin-only blog-post-authoring aid**: `PptxImportPanel` is rendered inside `BlogPostForm.tsx` (confirmed by import graph — its only caller), used to pre-fill a new blog post's title/slug/excerpt/content from a `.pptx` deck. It writes nothing itself; only `createBlogPostAction` persists, once the admin submits the form. But `20-forms-catalog.md` still had the old entry — "PPTX import ... → notes/materials (via downstream note creation)" — sitting in the "Panel — notes, cells, materials, flashcards" table, directly contradicting the other two docs. A reader who happened to open the forms catalog first (a very plausible entry point, since it's specifically indexed as "the reverse index into `21`") would get the wrong domain entirely and go looking for a note-creation bug that isn't there. Fixed: removed the wrong row, added the correct one under Blog, cross-linked to `21-server-actions.md`.

## Scenario 12 — "Diagnozy mannequin exam: a student clicked the right body zone but the exam marked it as missed."

**✅ SOLVED, clean.** `gradeWykonanie()` (`src/helpers/gradeDiagnozyExam.ts:32`) is a straightforward exact-key comparison (`assigned === correctZone`) over only the interventions the student both chose *and* that have an authored `bodyZone` — no fuzzy matching, no normalization step to introduce a subtle bug the way the free-text `praktycznyGrading.ts` fields do. Read the whole function; found nothing surprising. Worth noting as a **type** of finding this round — not every simulated symptom turns up a problem, and this doc set's existing description of diagnozy scoring (verified accurate in round 14) held up again here at a deeper level.

## Scenario 13 — "A student archived their plan mid-way through logging a study session, and the numbers look off."

**Not pursued as a full scenario** — read `archivePlanAction`/`completePlanAction`/`logStudySessionAction` (`src/actions/planner.ts`) directly; they're independent single-row DB operations with no shared transaction or ordering dependency, and archiving/completing a plan while simultaneously submitting a study-log form requires two deliberate near-simultaneous user actions on different UI surfaces (`PlanLifecycleActions` vs. `QuickStudyLogForm`) — a much lower-probability trigger than the multi-device board-save scenario (round 15) or a routine tab-switch (round 13). Deprioritized rather than written up as a finding; noted here so a future round doesn't re-derive the same "is this worth chasing" judgment from scratch.

---

## Findings this round

**F-27 (fixed in place)**: `20-forms-catalog.md` had a stale, contradicted entry for PPTX import — wrong domain (notes/materials instead of admin blog authoring), wrong write target, directly conflicting with two other docs that already had it right. Not added as a numbered README audit note (pure doc-coverage inconsistency, no app-behavior issue — same convention as F-24/F-25).

## What this round adds to the method

Round 16 surfaces a failure mode distinct from "wrong" and "narrower than reality": **internally inconsistent**, where a correction genuinely happened but didn't propagate to every doc that had the same claim. Worth checking for specifically — grep a fact across *all* docs, not just the one a task would naturally land on, whenever a "corrected" claim is found, since round 7's own PPTX discovery (referenced in `13-pages-admin.md`'s note) evidently didn't do this the first time.

---

## Priority fix list for next round

1. Run the "grep this corrected claim across every doc, not just the one it was found in" check retroactively against a few other past corrections in this doc set (e.g. the `readonly`/"admin-lockable" correction from round 3, the `useMobileStore` dead-code finding from round 7) to make sure none of those have the same kind of stale leftover elsewhere.
2. Genuinely new territory not yet touched by this methodology: the Excalidraw diagram canvas (persistence/undo-redo — `useDiagramPersistence.ts` also uses `visibilitychange`, per round 13's grep, worth checking if it has the same premature-save-or-loss risk as the session/cell findings), the memory-extraction background job (`after(() => onQuizCompleted(...))` — what happens if this throws, does a test submission ever look successful to the user but silently never update the tutor's memory), and the lecture-audio generation/duration-update path.
3. This is round 16 of a symptom-first methodology that started round 13. The obvious, high-probability failure shapes in the app's most-used flows (payments, sessions, access control, concurrent saves, cross-doc consistency) have now been checked. Diminishing returns are a real consideration going forward — future rounds should stay disciplined about picking scenarios from real code-reading rather than manufacturing hypothetical ones, since a manufactured scenario that isn't grounded in an actual code pattern doesn't test anything real.

## Running tally across all 16 rounds

- **17 numbered README audit-note findings** (unchanged this round — F-27 is a doc-consistency fix, not a new app-behavior finding).
- **Testing guide**: 19 cases (unchanged).
- Symptom-first rounds (13–16) total: 13 scenarios simulated, 8 solved cleanly, 2 real app-behavior findings now in the audit-note list (#16, #17), 3 doc-only corrections (F-24, F-25, F-27), 1 flagged-not-fixed (F-26).

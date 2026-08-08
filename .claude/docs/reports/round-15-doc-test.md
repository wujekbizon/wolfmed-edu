# Doc-Test Report — Round 15

Following through on round 14's top priority: the board/cells system was flagged as the one remaining area with an obvious, unchecked classic failure shape (concurrent writes to a single JSON blob).

---

## Scenario 9 — "A student edited their board on their laptop and their phone, saved on one, and their other device's work silently vanished."

**❌ MISLED-BY-OMISSION — new audit note, real gap, not fixed in code (documentation only, per this doc set's convention for app-behavior findings).**

Docs-first path: `21-server-actions.md` describes `saveCellsAction` as "persists the `userCellsList` blob" and `syncCellsAction` as a "reconciliation/sync variant" — the word "reconciliation" specifically implies some kind of conflict handling exists. Nothing in any doc warns that saving is destructive to concurrent edits.

**What's actually in the source**:
- `saveCellsAction` (`src/actions/cells.ts:17`) does an unconditional whole-blob overwrite — `updateUserCellsList(userId, cells, order)` replaces the entire `userCellsList` row for that user, with **no version check, no `updatedAt` compare-and-swap, no merge**. Confirmed in `src/server/queries.ts` — the update has no `WHERE updatedAt = ...` guard, just `WHERE userId = ...`.
- `syncCellsAction` (`:62`) — despite the "reconciliation" framing in the docs — is **not** a merge or conflict-detection function at all. It's a plain read: `getUserCellsList(userId)`, returned as-is. It's wired to a manual `SyncCellsButton` the user has to click themselves to pull the server's current state; nothing calls it automatically, and nothing warns a user their local view might already be stale before they hit Save.
- Both `SaveCellsButton` and `SyncCellsButton` are manual, explicit user actions — there's no autosave and no periodic background sync, which limits (but doesn't eliminate) the blast radius: this requires the student to actually be editing from two sessions without syncing between them, not something that fires on every page load. But the board is exactly the kind of surface (notes, flashcard refs, mind maps, RAG chat cells) a student plausibly opens from both a laptop and a phone.

**Why this is a doc failure, not just a code gap**: the word "reconciliation" in the existing `21-server-actions.md` description is actively misleading about what `syncCellsAction` does — a reader would reasonably conclude some conflict-resolution exists and stop looking, when in fact there is none anywhere in this path.

Fixed: corrected `21-server-actions.md`'s description of `syncCellsAction` to state plainly it's a read-only manual pull, not a merge; added README audit note #17 describing the overwrite risk; added a testing-guide case (TC-19) to reproduce it.

## Scenario 10 — "A user rapidly double-clicked the blog-post like button — did the like count end up wrong?"

**✅ SOLVED, lower stakes than expected.** `toggleBlogLikeAction` (`src/actions/blog.ts:457`) is a check-then-act pattern (select existing like, then insert-or-delete) — theoretically racy under truly simultaneous requests, but `blogLikes` has a composite primary key `(userId, postId)` (per root `CLAUDE.md`), so a genuine double-insert race fails on the unique constraint rather than corrupting the count or double-counting — worst case is a transient error toast on one of the two clicks, not silent bad data. Combined with the `blog:like` rate limit, this is a non-issue in practice. Already accurately described in the docs (root `CLAUDE.md`'s "❤️ Blog Likes" section, cross-referenced from `34-flows-social-admin.md`) as "idempotent against stale clicks" — that claim holds up structurally (via the PK), even though the doc doesn't spell out *why* it holds up under a true race. Not worth a fix; noted as verified-sound.

---

## New README audit-note finding

**17. The board/cells save has no conflict detection — a later save from a second tab/device silently overwrites an earlier one's edits in full**: `saveCellsAction` (`src/actions/cells.ts:17`) replaces the entire `userCellsList.cells`/`order` blob unconditionally on every save, with no version or timestamp check against what's currently stored. `syncCellsAction` — despite prior doc text calling it a "reconciliation" mechanism — is a manual, read-only pull with no automatic invocation and no merge logic; nothing warns a user their tab may be stale before they save over it. Concrete scenario: a student edits the board from a laptop, later opens the same board on a phone without syncing first (or leaves the laptop tab open in the background), and saves from the phone — the laptop tab's unsaved-but-still-open edits are now stale, and if that laptop tab later autosaves or the student clicks Save on it, the phone's changes are silently gone with no error, no merge prompt, no version conflict warning. Not fixed in code this round (documentation-only pass, per this doc set's established convention); flagging as a product-intent question the same way audit notes #10 and #16 were — worth a decision on whether a lightweight optimistic-concurrency check (compare `updatedAt`, warn before overwrite) is worth adding. See [`21-server-actions.md`](../21-server-actions.md) and [`40-testing-guide.md`](../40-testing-guide.md) → TC-19.

---

## Priority fix list for next round

1. This round closes out the specific list round 14 queued (cell/board concurrency was the headline item; blog-like race was quick to clear). Round 16 needs a fresh sweep for the next batch of candidates — good places to look with fresh eyes: the learning planner (`toggleConceptAction`/plan archival — does completing/archiving a plan race against an in-progress `logStudySessionAction`?), the practical-exam mannequin body-zone picker (does a partial submission mid-interaction ever get scored as if complete?), and the PPTX import path (`importPptxAction` — a multi-step file-parsing action is a classic place for a partial-failure-looks-like-success bug).
2. F-26 from round 14 (RAG upload discarding failed filenames) is still open and cheap — worth just fixing in code rather than continuing to defer it, since the data already exists in `results.failed` and is being thrown away one function call up.

## Running tally across all 15 rounds

- **17 numbered README audit-note findings** (was 16 — round 15 adds #17, a genuine new app-behavior finding via the symptom-first method, third one since round 13 started this methodology).
- **Testing guide**: 19 cases (was 18 — added TC-19 for the cell-save conflict).
- Symptom-first rounds (13–15) total: 10 scenarios simulated, 6 solved cleanly, 2 findings that changed live doc-only text (F-24, F-25), 2 real app-behavior findings now in the audit-note list (#16 session expiry, #17 cell-save overwrite), 1 flagged-not-fixed (F-26).

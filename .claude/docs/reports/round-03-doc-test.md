# Doc-Test Report — Round 3

Per round 2's recommendation, this round deliberately routed tasks through `13-pages-admin.md` and `22-hooks.md` — the two docs no prior round had tested directly — plus retested the mechanical checks with the process fix (scope reports/ out of "live claim" scoring) round 2 flagged.

---

## Part A — Mechanical checks

1. **Link validation**, all docs including `reports/`, `40-testing-guide.md`: 0 broken links.
2. **Referenced-file existence**, correctly scoped this time to exclude `reports/*.md` (round 2's process note): 147 unique paths, **0 missing** — clean, and no more false-positive noise to triage.
3. **Sampled `file:line` drift**, 8 fresh references across `materials.ts`, `notes.ts`, `flashcardDecks.ts`, `mindmap.ts`, `admin-rag-actions.ts`, `blog.ts`, `library/config.ts`, `planner.ts`: **8/8 accurate**. Combined with round 2's 8, that's 16/16 across three rounds — this check keeps passing because no source has changed, which is expected; it'll earn its keep the first time it doesn't.

---

## Part B — Task-based coverage (admin + hooks focus)

| # | Task | Result |
|---|---|---|
| T16 | Find whether `readonly` (comment-lock) is genuinely admin-only, as three docs claimed | ❌ **Inaccuracy found and fixed** — see F-8 below |
| T17 | Find the hook for auto-scrolling the AI chat to the bottom | ✅ `useStickToBottom`, exact name match, 1 hop |
| T18 | Find which hook to use for a new debounced search input | ✅ `useDebouncedValue`, explicitly tied to Golden Rule #5, 1 hop |
| T19 | Confirm whether the RAG admin UI supports deleting a single bad document from the corpus | ⚠️ **Under-stated, now made explicit** — see F-9 below |
| T20 | Check whether the mannequin/diagnozy-exam docs point to `scripts/MANNEQUIN.md` | ⚠️ **Missing cross-link, now added** — see F-9 |

### F-8 (Inaccuracy, now fixed) — `readonly` was documented as "admin-lockable" in three places; it isn't
Chasing T16 (an admin-workflow question: "as an admin, how do I lock a thread?") led to the actual `createForumPostAction` and `CreatePostForm.tsx` source, which shows:
- The "Wyłącz komentarze" (disable comments) checkbox is on the **regular, public** create-post form, shown to every signed-in user — not gated to admins in the UI.
- `createForumPostAction` reads `formData.get("readonly")` with **no role check** on that field at all.
- There is **no separate action anywhere in the codebase** to toggle a thread's `readonly` state after creation — not for the author, not for an admin.

So "admin-lockable thread" (the phrase used in `01-database-schema.md`, `10-pages-public.md`, and `34-flows-social-admin.md`) was simply wrong on two counts: it's not admin-only, and it's not "lockable" after the fact at all — it's a one-time, self-service, creation-time flag. **All three docs corrected this round**, and `34-flows-social-admin.md` now states plainly that if comment-locking is meant to be a moderation tool, the current implementation isn't one.

This is the same category of finding as round 2's F-7 (materials indexing): a task phrased as "how would an admin do X" surfaced that X doesn't actually work the way three independent docs assumed, because nobody had traced the actual authorization path for that one field before. **Pattern worth naming for future rounds**: any doc claim that says a capability is "admin-only" or "admin-lockable" deserves a specific trust-boundary check (does the server action actually gate on role, or does the doc just assume it from context) — this is the second time in three rounds that assumption was wrong.

### F-9 (Two related under-statements, now fixed)
- **RAG corpus document deletion**: `13-pages-admin.md` accurately described `DocumentListTable` as read-only but never said outright that the *only* deletion path nukes the whole corpus. Added an explicit callout — this is a real operational gotcha (upload 50 documents, need to retract one, currently means rebuilding all 50) worth surfacing plainly rather than leaving a reader to infer it from the absence of a per-document action.
- **Mannequin subsystem cross-link**: `scripts/MANNEQUIN.md` is a genuinely good, comprehensive 141-line deep-dive on the 3D mannequin pipeline (model asset, zone mapping, click-to-zone raycasting, how to regenerate). It was linked from `00-architecture.md`'s new scripts table (round 2) but not from the diagnozy exam flow doc or the components catalog, where someone actually working on that feature would be looking. Added a pointer from `31-flows-testing.md` → Flow 5.

---

## Priority fix list for next round

1. ~~**Apply the "admin-only claims need a trust-boundary check" pattern retroactively**~~ — done within this round rather than deferred: grepped every `.claude/docs/*.md` for "admin-only"/"admin-lockable"/"admin can"/"only admin" phrasing (4 hits outside `reports/`). Three were the just-fixed `readonly` mentions; the fourth (`AdminBlogWidget` — "admin-only... renders nothing for non-admins," `11-pages-panel-core.md`) was checked against the actual component and is accurate: it's a server component gated by `isAdmin()` before rendering anything, not a client-side conditional. No further fix needed there.
2. Continue rotating which docs get direct task coverage — `22-hooks.md` and `13-pages-admin.md` are now tested; `23-types.md` and `27-state-stores.md` (besides the audit-note resolution work) have never been the direct target of a task, only touched incidentally.
3. No round yet has tested a **negative case on purpose** — i.e., picked something that should genuinely not exist or not be possible, and confirmed the docs correctly say so, rather than always chasing "does X exist." Round 4 should include at least one "prove a claimed limitation is real" task deliberately (F-9's corpus-deletion finding is an example of this happening incidentally; do it on purpose next time).

## What's holding up well

Mechanical checks are now fully clean and stable (0 broken links, 0 missing files, 16/16 file:line accuracy across three rounds) — that layer of the doc set can be trusted without re-verification every round; spend the budget on task-based tracing instead, since that's where every real finding across all three rounds (F-1, F-2, F-6, F-7, F-8) actually came from.

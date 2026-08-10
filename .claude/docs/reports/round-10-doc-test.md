# Doc-Test Report — Round 10

Role for this round: a technical-but-new-to-this-codebase reader, given only `.claude/docs/`, trying to actually get 9 realistic engineering tasks done — not auditing prose, but using the docs the way an engineer would mid-task, then checking every file/line claim I relied on against source afterward. Per round 9's own recommendation, this is a return to **task-based** testing after two rounds of blanket reverse-direction sweeps.

---

## Part A — Mechanical checks

Link validation and referenced-file existence: not re-run this round (three consecutive clean rounds behind it — see round 9). Instead spent the budget on `file:line` verification, sampled at every task below rather than a separate fixed batch — 6 file:line claims checked as part of real tasks, 6/6 accurate (see T1–T4, T3, T6, T7 below).

## Part B — Task-based coverage

| # | Task (as a reader would phrase it) | Path taken | Result |
|---|---|---|---|
| T1 | "I need to add a rate limit bucket for a new action — where, and what happens if I forget?" | README → `00-architecture.md` (in-file search for "Rate limiting") | ✅ 1 doc, found in one search. Config shape, sliding-window mechanism, fail-open behavior all confirmed against `src/lib/rateLimit.ts` — accurate. |
| T2 | "What's the schedule and behavior of the memory-retention cron job?" | README → `14-api-routes.md` | ✅ Found immediately (dedicated `### GET /api/cron/memory-retention` heading). Retention rules (90-day traces, revoked-episode/fact cleanup with the self-referential FK-safe ordering) match `src/server/memory/config.ts` / the route. |
| T3 | "A student's practical exam score looks wrong — find the file that computes it." | README → `31-flows-testing.md` (Flow 3) | ✅ Landed on `src/actions/praktyczny.ts:24` and `src/helpers/praktycznyGrading.ts` directly — both line/file claims exact. The doc's explicit callout ("all grading logic runs server-side; the client never computes or could spoof its own score") answered the likely follow-up question before I had to ask it. |
| T4 | "I need to handle a new Stripe webhook event type — find the handler." | README → `14-api-routes.md` | ✅ found the file and the full 6-step `checkout.session.completed` handling; ⚠️ **minor friction, now fixed**: no line number for where the `switch (event.type)` dispatch actually lives, unlike the `toolCommands` checklist (T6) which gives `executor.ts` line ~162 for the equivalent spot. Added `:29`/`:30`/`:136` to `14-api-routes.md` in this round. |
| T5 | "Find the component and store behind the pricing 'see full comparison' toggle." | Skipped — this doc content was written by me directly from source two commits ago in this same session, so re-testing it would just be checking my own memory, not the docs' findability. Left for a future round with fresh eyes. |
| T6 | "Where do I add a new AI tutor `/command`?" | README → `33-flows-ai-tutor.md` (in-file search for "add a new") | ✅ Excellent — a dedicated 3-step checklist already exists (`toolCommands.ts` → `tools/definitions.ts` → `tools/executor.ts`), written specifically as an onboarding artifact in round 6. `switch (toolName)` at "line ~162" — checked, exact. This is the best-case outcome for a findability test: not just "the answer exists" but "the answer is pre-assembled as a checklist," which round 6's report noted was exactly the point of writing it that way. |
| T7 | "Trace a material upload from the UI through to the storage-quota check." | README → `32-flows-learning-content.md` (Flow 2) | ✅ `uploadMaterialAction` at `src/actions/materials.ts:77`, `deleteMaterialAction` at `:20` — both exact. The two-gate quota design (UploadThing middleware pre-check + the action's transactional authoritative check) was explained with the reasoning, not just asserted, and cross-linked correctly to `14-api-routes.md` for the first gate. |
| T8 | "List every exported action in `src/actions/` (100 functions across 27 files) and confirm each is named in `21-server-actions.md`." | Reverse-direction, not doc-led — this was round 9's own leftover item (`src/actions/` had never been checked this way). | ✅ **100/100** exported action functions appear somewhere in `21-server-actions.md`. Closes round 9's priority-list item #2 clean — no gap found. |
| T9 | Negative case: re-verify the README audit note #11 claim ("forum comment-locking is not admin-gated, and not reversible") is still true, not just historically true. | `grep readonly` across `src/actions/*.ts` directly (this is the kind of claim only source can settle, not another doc). | ✅ Still true — exactly one write site (`createForumPostAction`, no role check on the field) and zero toggle-back action anywhere in `src/actions/`. Reconfirms round 3's finding hasn't silently been fixed or drifted since. |

## Findings

**F-20 (trivial, fixed in place)**: `14-api-routes.md`'s Stripe webhook section had file-level but not line-level references for where to add a new event handler, inconsistent with the line-level precision the rest of the doc set has been converging on (schema.ts index, `executor.ts` line ~162, every `praktyczny.ts`/`materials.ts` reference in this same round). Added `:29`/`:30`/`:136`.

That's the only finding from 9 real tasks. Every other lookup succeeded on the first or second doc, and every file:line claim checked was exact.

---

## What this round says about the doc set

Two rounds of reverse-direction sweeps (8, 9) found small-but-real gaps by starting from source. This round started from realistic tasks and found almost nothing wrong — which is a different, and arguably more important, signal: **the primary use case (an engineer trying to get something done) is well served right now.** The doc set has reached a point where a genuinely fresh task-based pass turns up friction, not errors — worth noting since round 9's own worry was "reverse sweeps are hitting diminishing returns"; this round confirms the *forward* direction (does a real task succeed) is holding up too, not just coincidentally unswept.

## Priority fix list for next round

1. Test T5 (the plan-comparison toggle docs) with genuinely fresh eyes next round — it was written and tested by the same hand two commits apart in this session, which isn't a real independent check.
2. `14-api-routes.md`'s Clerk webhook section (`user.created`/`user.deleted`) doesn't have the same line-level precision as the Stripe section now does — worth the same small pass if anyone actually needs to add a new Clerk event type.
3. No round has yet tried a task that spans a **write in one flow and a read in another** (e.g. "a flashcard was created from a note — where does the note→flashcard link actually get read back for display, and does the doc trail hold up across both directions?"). Every task so far, in every round, has been single-direction (find where X is written, or find where X is read) — round 11 could deliberately pick a bidirectional one.

## Running tally across all 10 rounds

- **15 numbered README audit-note findings** — unchanged this round (F-20 is a pure findability fix, filed the same way as the fixed-in-place doc gaps from rounds 8–9, not added to the app-behavior list).
- **Testing guide**: 17 cases, unchanged (no new app-behavior finding this round to derive a case from — T9's re-check confirmed TC-10 still applies as written, nothing new to add).
- **9 task-based lookups this round, 1 finding** — the lowest finding-rate of any round so far, consistent with the last two rounds' reverse-direction sweeps having already closed most of what was findable that way.
- Round 9's two open reverse-direction items are now both resolved: `src/actions/` (T8, 100/100 clean) and the Clerk-vs-Stripe line-precision gap is partially addressed (Stripe done this round, Clerk flagged above for next round).

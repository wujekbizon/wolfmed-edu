# Doc-Test Report — Round 12

Followed up on round 11's two open items: check other "create-from-Y" flows for the same write/read seam gap F-22 found, and sweep the rest of `14-api-routes.md` for the line-precision gap found in the two webhook sections.

---

## Part B — Task-based coverage

| # | Task | Result |
|---|---|---|
| T13 | Check Flow 4 (mind map generation) for the same write/read seam issue as F-22. | ✅ Clean, no fix needed — and for a good structural reason, not luck: a mind map has no dedicated read path to miss. It's saved as generic cell content through the same `userCellsList` blob write every other cell type uses, and `12-pages-panel-learning.md` already names that table directly. There's no separate "read-back function" for a seam to hide behind. |
| T14 | Check Flow 5 (procedure challenge → badge) for the same seam issue. | ⚠️ **Real gap, same shape as F-22, fixed**: `11-pages-panel-core.md` named `BadgeWidget` as showing "earned procedure badges" without naming what it calls (`getUserBadges`, already catalogued in `28-queries.md` but not cross-linked from the dashboard-page doc). Added the link, tying it explicitly back to `awardBadge()`'s write in Flow 5's transaction. |
| T15 | Check the materials → personal-library-retrieval connection for the same issue. | ✅ Clean — this one is structurally protected rather than coincidentally fine: retrieval rule #1 in root `CLAUDE.md` mandates a single entry point (`retrieveContext()`), so there's no per-feature read function to lose track of; every consuming flow doc already points at the one function. |
| T16 | Sweep `14-api-routes.md`'s remaining four routes (session heartbeat/expire, `/api/uploadthing`, `/api/rag/progress`, `/api/mcp/resources`) for the line-precision gap the two webhooks had. | ✅ Nothing to fix — each of these four files exports exactly one handler (`POST`/`GET`), so "where in the file" was never ambiguous the way a multi-event-type webhook dispatch is. The gap round 10/11 found is specific to files with an internal dispatch table, not a general pattern across the doc. |

## Findings

**F-23 (small, fixed in place)**: Same shape as F-22 — `BadgeWidget`'s read call (`getUserBadges`) was documented in the queries catalog but not cross-linked from the dashboard-page doc where a reader debugging "badge not showing up" would actually start. Fixed with a cross-link to both `28-queries.md` and the Flow 5 write transaction.

## What this round clarifies

F-22 (round 11) raised the worry that "documented write + documented read, invisible seam" might be a widespread pattern. This round narrows that: it's real, but specific — it shows up where a feature has its **own dedicated read query** that a page-level doc names only by component/table, not by function (flashcards, badges — both fixed now). It does **not** show up where the architecture itself enforces a single read path (mind maps via generic cells, anything AI-tutor-facing via `retrieveContext()`) — those are protected by design, not by documentation diligence. Worth knowing which category a new flow falls into before assuming it needs the same fix.

---

## Priority fix list for next round

1. The two seam gaps found (F-22, F-23) were both on the **panel dashboard** side (`11-pages-panel-core.md` sidebar widgets). Worth checking whether other dashboard widgets have the same pattern — `UserAnalytics`, `PlanCountdown`, `OnboardingChecklist` all read something back; none have been checked this way yet.
2. Diminishing returns are now clearly visible: round 10 found 1 issue in 9 tasks, round 11 found 2 in 3 targeted tasks, round 12 found 1 in 4 targeted tasks, and two of four checks this round confirmed "nothing wrong, and here's the structural reason why" rather than finding new problems. Round 13 should either go back to broad task-based testing (a fresh subsystem, per round 5's original "onboard from zero" idea, never actually done) or be treated as a good point to pause the cycle and let real usage surface the next batch of friction.

## Running tally across all 12 rounds

- **15 numbered README audit-note findings** — unchanged.
- **Testing guide**: 17 cases, unchanged.
- F-20 through F-23 (rounds 10–12): four small cross-linking/line-precision fixes, all in place. All four followed the same shape — not wrong information anywhere, just a connection between two individually-accurate spots that required opening source to complete.

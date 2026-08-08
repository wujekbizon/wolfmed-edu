# Doc-Test Report — Round 11

Worked through the three items round 10 left open: a genuinely-fresh check of the plan-comparison docs, the Clerk-webhook line-precision gap, and a first deliberately bidirectional task (write in one flow, read in another).

---

## Part B — Task-based coverage

| # | Task | Path taken | Result |
|---|---|---|---|
| T10 | Fresh re-test: "Find the component and store behind the pricing 'see full comparison' toggle." | README → `27-state-stores.md` (found `usePlanComparisonStore` directly) or `26-components.md` → `pricing/` | ✅ 2 hops either way, content matches source. No new issue — round 10 was right to flag this as needing a fresh check, but it holds up. |
| T11 | "I need to add a new Clerk webhook event type — where's the dispatch?" | README → `14-api-routes.md` | ⚠️ **Found, but same gap as T4 last round** — no line number for the `if (eventType === ...)` dispatch. Fixed: added `:56`/`:89`. Also noted for the record: Clerk's dispatch is a sequence of `if` blocks, not a `switch` like Stripe's — the doc previously implied a similar shape without saying so; now states it explicitly. |
| T12 | **Bidirectional**: "A flashcard was created from a note. Where does that note→flashcard link actually get read back for display?" | Write side: README → `32-flows-learning-content.md` (`createNoteFlashcardAction`, `resolveNoteDeckId`, `flashcardDecks.sourceRef`). Read side: README → `12-pages-panel-learning.md` (`NoteFlashcardsSection`, on the note detail page). | ⚠️ **Real small gap, fixed**: `12-pages-panel-learning.md` named the component (`NoteFlashcardsSection`) but not the actual read call it makes. Traced the component source directly (`getFlashcardDeckByNoteId` from `src/server/queries.ts`) — that function *was* already catalogued in `28-queries.md`, just not cross-referenced from the page doc, so the write→read trail didn't visibly close without going to source. Added the missing link + made explicit that both sides key off the same `flashcardDecks.sourceRef` column. |

## Findings

**F-21 (small, fixed in place)**: Clerk webhook dispatch (`14-api-routes.md`) had the same file-only-no-line gap the Stripe section had before round 10's fix — an oversight from fixing one webhook and not checking its sibling in the same doc. Added `:56`/`:89`.

**F-22 (small, fixed in place)**: The note-page doc named `NoteFlashcardsSection` as "letting the user generate/review flashcards" without naming what it actually calls to read the deck back. The underlying function (`getFlashcardDeckByNoteId`) *was* documented — just in `28-queries.md`, not cross-linked from the page where a reader would actually be looking. This is the first concrete instance in 11 rounds of the specific bidirectional failure mode predicted in round 10's report: both ends of a flow individually documented, correctly, but the seam between them (same DB column, `sourceRef`, read by one doc and written by another) wasn't visible without opening component source directly.

---

## Priority fix list for next round

1. F-22's failure mode (documented write, documented read, invisible seam) is worth checking for elsewhere on purpose — every flow doc (`3x-*`) that says "created from X" is a candidate: mind maps from notes, materials feeding the personal library, procedure challenges awarding badges. Round 12 should pick 2–3 more create-from-Y flows and check whether the *read-back* side names the same underlying function/column the write side does, not just whether both sides exist somewhere.
2. Sweep the rest of `14-api-routes.md` (session heartbeat/expire, uploadthing, SSE, MCP resources) for the same line-precision gap now that two of six route sections needed the same fix independently — worth doing all six in one pass instead of finding them one sibling at a time.

## Running tally across all 11 rounds

- **15 numbered README audit-note findings** — unchanged (F-20/F-21/F-22 are all pure doc-coverage/cross-linking gaps, fixed in place, not app-behavior findings).
- **Testing guide**: 17 cases, unchanged.
- 3 tasks this round, 2 small findings (F-21, F-22) — both fixed. The bidirectional-task hypothesis from round 10 paid off immediately: it found something two straightforward reverse-direction sweeps (rounds 8–9) and a same-direction task round (10) had both missed, because neither checked whether two independently-accurate doc sections actually named the same connecting piece.

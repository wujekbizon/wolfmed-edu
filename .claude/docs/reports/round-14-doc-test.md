# Doc-Test Report — Round 14

Continuing round 13's symptom-first methodology: read real code for a plausible failure trigger, form the "user/support" symptom, *then* check whether the docs would get someone to the right answer.

---

## Scenario 4 — "A student double-checking GDPR compliance asks: was my `memPolicies` data actually erased when I deleted my account?"

**❌ MISLED, now fixed.** `30-flows-auth-payments.md` listed `memPolicies` alongside `memPreferences`/`memFacts`/`memEpisodes`/`memTraces` as memory tables that "would silently survive a `users` row deletion otherwise" — implying all five get the same erasure treatment. Checked `eraseUserMemory()` (`src/server/memory/erase.ts`) directly: it only touches four tables. Checked why: `memPolicies` (`src/server/db/memory-schema.ts`) has no `userId` column at all — only `tenantId` (default `'wolfmed'`). It's tenant-wide pedagogical/product configuration, not personal data, so there's nothing user-scoped in it to erase — this isn't a compliance gap, it's a doc miscategorization that grouped a global config table into a sentence about per-user erasure. Fixed the doc to state this explicitly rather than implying parallel treatment, and to name which tables are tombstoned vs. hard-deleted.

## Scenario 5 — "A premium user reports the bulk test-file-upload button/feature is nowhere to be found on `/panel/dodaj-test`, but the docs say it's there."

**❌ MISLED, now fixed** — a real, if narrow, doc/reality mismatch, though not a live app bug. `11-pages-panel-core.md` and `20-forms-catalog.md` both listed `UploadTestForm`/`uploadTestsFromFile` as living on the premium-gated `/panel/dodaj-test` page without qualification, in the same breath as genuinely premium-user features (`CreateTestForm`, `AITestGenerator`). Checked source: `uploadTestsFromFile` (`src/actions/actions.ts:889`) requires `sessionClaims.metadata.role === 'admin'` and returns "Brak uprawnień" otherwise; `CreateTab.tsx` renders the form itself behind `{isAdmin && <UploadTestForm />}`. **Not a live bug** — a non-admin premium user never sees the control, so there's no broken-feature symptom in production — but the previous doc text would have sent a support agent or new engineer looking for a premium-facing bug that doesn't exist, when the real answer is "working as designed, it's an admin tool that happens to share a premium-gated page." Fixed both docs to say admin-only explicitly.

## Scenario 6 — "A student says they were charged twice for the same course purchase."

**✅ SOLVED — already accurately documented.** Re-verified the underlying claim (README audit note #13) is still current: `grep idempotencyKey` across `src/` shows exactly one hit, on customer creation (`src/server/stripe.ts:33`), still none on `stripe.checkout.sessions.create()`. The existing docs (audit note #13, `30-flows-auth-payments.md` Flow 3, `40-testing-guide.md` TC-2 edge case D) already explain the mechanism, the consequence (two `payments` rows + a double `testLimit` reward, but enrollment itself stays correct since `enrollUserAction` is update-if-exists), and point at the exact fix pattern to copy. Nothing to add.

## Scenario 7 — "An admin uploaded 5 documents to the RAG corpus; the page said '3 uploaded, 2 failed' — which 2?"

**⚠️ PARTIAL, not fixed this round (flagged for follow-up)**. `uploadFilesAction` (`src/actions/admin-rag-actions.ts:62`) calls `uploadFiles()` (`src/server/vertex-rag/ingest.ts`), which **does** track failed filenames internally (`results.failed: string[]`) — but the action's returned message only reports the count (`` `Przesłano ${results.uploaded.length} dokumentów. Błędy: ${results.failed.length}` ``), discarding the names before they reach the admin UI. Not documented as a limitation anywhere. Lower priority than the other findings this round since it's a UX rough edge, not a correctness bug — noted here rather than fully written up, worth a small doc/code note in a future round.

## Scenario 8 — "A student's diagnozy exam score looks off."

**✅ SOLVED.** Same pattern as the practical-exam scoring check in round 13: server-side re-fetch of the correct answers, never trusts client input, exact `file:line` (`submitDiagnozyExamAction` at `:132`, `gradeDiagnozyExam()` in its own helper file). Accurate on inspection.

---

## Findings this round

**F-24 / README audit note follow-up (fixed in place)**: `memPolicies` incorrectly implied to be part of per-user GDPR erasure — corrected in `30-flows-auth-payments.md`.

**F-25 (fixed in place)**: `uploadTestsFromFile`/`UploadTestForm` incorrectly implied to be a premium-user-facing feature — it's admin-only, gated both in the UI and re-checked server-side. Corrected in `11-pages-panel-core.md` and `20-forms-catalog.md`.

**F-26 (flagged, not fixed)**: RAG bulk upload discards failed filenames before they reach the admin UI, even though the data exists internally. A UX gap, not a correctness bug.

Neither F-24 nor F-25 is being added as a numbered README audit note (unlike round 13's F-16) — both are pure documentation miscategorizations with no incorrect *app* behavior behind them, consistent with this doc set's existing convention (doc-coverage gaps get fixed in place; only real app-behavior findings get a numbered audit note, per round 5's explicit note on this distinction).

---

## Priority fix list for next round

1. F-26 (RAG upload's discarded failed-filenames) is worth either a small code fix (surface `results.failed` in the message) or at minimum a documented limitation — low priority but cheap.
2. Still untested with this methodology: the learning planner (concept-completion race, plan archival), the cell/board system (two tabs saving `userCellsList` concurrently — last-write-wins on a JSON blob is a classic silent-data-loss shape worth checking deliberately), blog like toggle idempotency under rapid double-click, and the mannequin/3D anatomy picker's scoring path (practical exam interwencje matching).
3. Given the breadth already covered (payments, access control, AI grounding, session lifecycle, GDPR erasure, admin RAG, custom test authoring, diagnozy scoring), round 15 should prioritize the **cell/board concurrent-save** scenario specifically — it's the one remaining area with an obvious, classic failure shape (concurrent writes to one JSON blob) that hasn't been checked yet.

## Running tally across all 14 rounds

- **16 numbered README audit-note findings** (unchanged — this round's two findings are doc-only miscategorizations, not new app-behavior issues, per the distinction above).
- **Testing guide**: 18 cases (unchanged).
- Symptom-first rounds so far (13–14): 8 scenarios simulated, 4 solved cleanly, 1 misleading-and-fixed with a real app-behavior implication (round 13's session-expiry bug), 2 misleading-and-fixed as pure doc corrections, 1 flagged UX gap not yet fixed.

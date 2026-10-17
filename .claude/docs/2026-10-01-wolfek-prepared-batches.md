# Wolfek prepared batches — 2026-10-01

Greg-approved behavior on Kierunki, panel home, results and category learning:

- Mount/open: zero Jev calls.
- First prepared click: one request judging every route prompt, including More and conditional learning prompts. Each prompt has independent Choice/Noul/Score; shared state is sent once. No expected answer is forced.
- Later prepared clicks: reuse the page-visit batch; server verifies ownership, access and current facts before delivery. No Jev call while facts remain unchanged.
- Typed questions: one fresh provider request per submission; never substitute the prepared batch.
- Reload, route/account change or relevant changed facts: discard reuse. Minimize/restore preserves it.

Client cache uses React Query, loaded only inside the click action. Server receipts bind the batch to identity/visit and retain authoritative selected responses for 24 hours; this is authorization support, not cross-visit UI reuse. Network duplicates retain five-minute submission deduplication. Failed batches never seed results; no automatic provider retry.

Response text/covers appear only in shared state. Choice criteria contain candidate IDs with null values. Canonical catalog facts replace duplicated course objects/features; bulky strings already resolved into responses stay out of decision facts. Selected action descriptors stay server-owned. Missing facts retain explicit unavailable choices.

Precomputation never executes learning actions. Reviewed hint content is masked in the client batch until consumption commits assistance exposure; a changed learning session/card invalidates its batch. Automatic practice coaching remains its existing separate path.

Logs distinguish `prepared_batch`, `batch_first`, `batch_reuse`, and `typed_provider`. Provider audit stores all judgments in one row, with `wolfekBatch` and appended `wolfekDeliveries`. Raw HTTP body stays untouched. Admin summary distinguishes batches, reused buttons and typed questions. No schema migration required.

Offline reconstructed Kierunki fixture from Greg's exported facts: old single request 44,300 minified characters; compact single 12,195; batch covering 11 buttons/33 judgments 28,443. Character counts are not measured Jev tokens. Actual token usage and selection quality require smoke testing.

Validation: 276 local tests passed, including batching, concurrent first-click deduplication, failed batches, all four route envelopes, page/account/data cache keys and compact payload regressions. TypeScript and changed-file ESLint passed. No live Jev calls, database scripts or migrations executed.

Smoke checks:

1. Open Kierunki: provider audit count unchanged.
2. Click one button: one provider row with all 33 judgments.
3. Click all remaining buttons, including More: provider count unchanged; deliveries/reuse increase.
4. Type a question: provider count increases by one.
5. Minimize/restore and click: reuse. Reload, then first click: one new batch.
6. Repeat on panel/results. Learning card/session changes legitimately require a fresh batch; precomputed answers must not expose hints or execute actions.

Unresolved: live Polish selection quality and actual new token usage.

## Smoke-test rounding correction

Read-only inspection of six October 1 Kierunki batches: all HTTP 200, two accepted and four rejected. Rejected batches had complete allowed answer families but one or more probability distributions summed to 0.99. The parser's 0.001 sum tolerance rejected the entire batch. Shared typed/batch parsing now permits a 0.01 sum difference plus floating-point epsilon; keys, value ranges, primitive shapes and winning allowed Choice remain checked. All six stored batches pass corrected parsing. Two rounding/malformed-output regressions added; 32 companion tests, TypeScript and targeted ESLint pass. No fresh Jev calls or stored-log changes.

## Follow-up log audit

October 1 snapshot: ten provider calls, 84,085 input + 27,007 output = 111,092 tokens, matching Greg's dashboard exactly. Nine batches and one typed request; five batch failures include four prior sum-tolerance failures and one later near-tie validation failure. Successful batch at 08:31 Warsaw served six prepared clicks from one call (five reuses), followed by a separate typed request. Another visit produced a fresh batch, as designed. No protected-route smoke records yet.

Batch input is 8,845–8,850 tokens for all eleven questions; typed input is 4,456. Earlier single-question input averaged 16,902. The dashboard total includes failed attempts and previous visits, not one page visit's cost.

Remaining near-tie failure: Jev selected clarify with displayed probability .32 versus tiers_opiekun .33. Parser now preserves its supplied Choice when the displayed maximum differs by at most .01, matching the bounded rounding tolerance; materially lower choices still fail. All nine stored batches pass corrected parsing. 33 companion tests, TypeScript and lint pass. Tier comparison remains low-confidence (.32–.35), often clarification or no displayed answer; batching success does not establish answer quality.

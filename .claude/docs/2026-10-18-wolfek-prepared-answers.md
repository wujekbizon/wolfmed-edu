# Wolfek prepared answers — 2026-10-18

Prepared buttons never call Jev. `src/content/wolfek/prepared-answers.json` maps every visible button to ordered response IDs in the existing route JSON packs. It also overrides the generic tier-comparison link to the catalog; the typed response bank is unchanged.

`answerWolfekPreparedQuestionAction` validates the submitted route, exact prepared prompt and ID. Its private service authorizes access, applies the request rate limit, deduplicates the submission, loads current facts and resolves the first explicitly matching variant. Missing required facts return an unavailable response rather than a different state or invented values. Static templates, current enrollment, results, billing, countdown and plan data remain server-owned.

Learning buttons directly select hint, comparison, explanation or reveal confirmation. Existing Premium/category/owner/revision/version checks, canonical retrieval, Gemini generation, assistance writes and grounded reply caches remain. The explanation button requests consent while the key is hidden; only `Pokaż i wyjaśnij` commits reveal before generation. Failures after reveal still return committed progress. Submission replay revalidates access and current card state before returning a cached result; no duplicate assistance generation or writes.

Typed questions retain Jev Choice/Noul/Score, confidence handling, provider rate limits and audit logging. Prepared requests do not need `TYPESAFE_API_KEY` or consume Jev reservations. Redis is still used for submission deduplication and existing generated-answer caching.

Removed prepared-batch actions/services, React Query batch helpers, visit provider, hashes, receipts, batch parser/types and batch delivery writers. Old Redis receipts expire naturally. Historical provider/interaction records stay readable; no database migration or cleanup command is needed.

Prepared interaction metrics use outcome `prepared` and null confidence. Successful deterministic answers are not flagged merely for lacking confidence; unavailable results still require review. Admin insights distinguish current ready answers from historical batches and batch reuse.

Regression coverage: every button mapping, current/empty/missing facts, ownership states, exact payment intent, plan priority, learning selection/reveal/Premium gates, access/rate-limit rejection, duplicate delivery and unchanged typed routing. No live provider calls or database scripts are required for these checks.

Validation: 350 tests, TypeScript and full ESLint pass. The Next.js compile-mode build stayed at compilation without a result for over six minutes and was stopped; build success is unverified. No live browser/provider flow or database migration ran.

Manual Kierunki smoke: Greg confirmed prepared answers work; admin showed nine ready answers and no typed questions. Prepared-button POSTs remain expected for current facts, authorization, deduplication and metrics. Follow-up date fix: reversed, empty or over-366-day filters return server-side field errors without throwing a report-action exception. Correcting dates reloads the report; invalid filters disable export. Removed stale admin copy describing Jev batches.

Pre-commit cleanup removed the dormant automatic-coaching provider stack, unmounted companion/tutor hooks and components, superseded topic buttons/parsers, orphan schemas/types/constants and unused tutor-modal state. The only remaining production caller of `callJev` is typed-question execution. Historical decisions, memory events, reviewed support and `supportPending` view/merge semantics remain intact; no stored-data cleanup is required. Prepared-button fact loading still uses the existing route context; narrower per-button queries are a separate optimization.

Cleanup validation: all 346 remaining tests, TypeScript, full ESLint and diff whitespace checks pass. Six tests for removed legacy topic parsers were deleted. Production build remains unverified after the earlier stalled attempt.

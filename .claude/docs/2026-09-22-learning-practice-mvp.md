# Learning practice MVP

Branch: `codex/learning-practice-mvp`, from local `main`.

## Product flow

- Use the existing `/panel/nauka/[category]` route; there is no practice query parameter or separate practice page.
- Every accessible public course category uses the same redesigned, searchable, paginated question-card feed and floating glass companion.
- The full category question set is available. Pagination limits rendered cards only; there is no five-question session cap.
- Server grading, one retry, card-grounded hint, reveal, per-card progress and resume. No exam score or planner-minute writes.
- Reset lives in the learning header menu. It clears answers, hints and mastery but preserves prior exposure; previously seen cards remain under `Wszystkie`. `Do powtórki` includes current wrong/assisted/revealed/skipped cards, not exposure alone, so it is empty immediately after reset.
- Owner/course/tier checks on reads and writes; custom browse queries also enforce ownership.
- Row-locked transitions, version checks, idempotent event IDs, revision hashes. Edited/deleted questions are excluded from grading; skip and start a new session for current content.
- Safe practice DTOs. Browse keys are not loaded into the practice RSC payload. Practice feedback reveals only the current key after success or reveal.
- Prior key exposure in practice marks future answers assisted. Browse exposure cannot be detected.
- Wolfek follows the focused card in a compact glass panel with layered motion, short speech bubble and floating actions. It minimizes to a corner avatar. Comparison highlights answers on the card; a contextual RAG conversation expands on request.
- `Dalej` stays available across answered and unanswered cards while another card exists in the current filtered deck; it advances focus and scroll across pagination. It disappears only at the last card in that view.
- Wolfek picks the next short friendly phrase when reopened. It stays unchanged while reading or changing cards. The small-talk cloud has a stable height and a subtle fade respecting reduced motion; `Dalej` has its own separate bubble below, aligned right. These visual interactions never call Jev.
- `Pokaż odpowiedź` appears once on the question card; the Wolfek footer doesn't duplicate the same reveal action.
- Shared presentation lives in `src/components/wolfek` and `src/hooks/useFloatingPanelPosition.ts`; the learning adapter owns session-derived reactions and per-user visibility. Centrum Nauki is its first consumer; global rollout is deferred.
- Read-only existing planner summary, independent Suspense boundary.
- Wolfek and Jev are available to all enrolled course users. The `Asystent AI` button stays visible at reduced opacity and disabled without Premium; the contextual tutor through `askRagQuestion` remains Premium-only with owned question context, canonical retrieval and the existing rate limit. No automatic tutor calls.

## Activation

The database migration was not run by Codex. On 2026-09-25, a read-only check confirmed both practice tables already exist in the configured database, and the Opiekun medyczny category has 3,130 questions. `LEARNING_PRACTICE_ENABLED` and `LEARNING_PRACTICE_TUTOR_ENABLED` are `true` in the local `.env`. Restart a running Next dev server after `.env` changes.

Apply to the intended development database using its direct connection in `NEON_DATABASE_URL`:

```powershell
pnpm exec tsx --env-file=.env scripts/migrate-learning-practice.ts --apply
pnpm exec tsx --env-file=.env scripts/migrate-learning-practice-progress.ts --apply
```

The first script creates the session/event tables. The second adds the per-card progress table and counters, copies existing answers into it, and leaves the session's question catalog compact. Both are transactional and rerunnable. Run the second script for existing development databases too. Neither script was run by Codex.

Local `.env` already has both practice flags enabled. Set these in the intended deployment environment after applying the migration:

```dotenv
LEARNING_PRACTICE_ENABLED=true
LEARNING_PRACTICE_TUTOR_ENABLED=true
```

Restart the application. Open any accessible course category, for example `/panel/nauka/opiekun-medyczny`.
Tutor requires the existing Premium access and provider setup.
Disable practice to return to browse-only; disable tutor independently. Data remains available after rollback.

## Content and remaining pilot work

The question records contain only the question stem, answer options and correct flag. The in page hint and comparison tools now use those card values directly. The optional `src/server/learning/supportCatalog.ts` can provide medically reviewed explanations when a source, reviewer and question revision are available; it does not gate the Jev decision.

Jev has three active coaching triggers: the third consecutive incorrect first attempt on distinct cards; a new independent incorrect first attempt after an incorrect card where the learner used hint or comparison; or the third distinct answer reveal in a 30-minute run. A correct first attempt or long gap stops the error streak; retries do not add to it. The help case does not claim a shared topic or failed intervention and excludes the previously used help. The reveal case reports exposure separately from recall. It may offer review of an earlier revealed card, applicable plan/material, Premium tutor or `none`; it does not offer review when no eligible earlier card exists. Each trigger gets at most one Choice request. Focus changes and ordinary `Dalej` never invoke Jev. Comparisons and successful contextual tutor responses enter the event ledger and memory summary.

Jev receives a structured JSON state with the trigger, confirmed first-attempt sequence, prior help or distinct-reveal window when applicable, current-card assistance/reveal and comparison state, bounded category practice/test/study summaries, applicable plan, verified resource availability and dismissed actions. The practice summary excludes event IDs and raw recent records. It does not receive the question's answer key, identity, notes or raw conversation. Eligible choices are unused on-card comparison, earlier revealed-card review, an explicit RAG invitation for Premium users, applicable existing plan activity, verified linked material when reviewed content exists, or `none`. Review takes the learner to a previously revealed card; `Spróbuj ponownie bez podpowiedzi` clears that card's current answer while retaining prior exposure. The new answer remains marked assisted, so it is not counted as first-time mastery. A tutor invitation before reveal is labeled `Ujawnij i zapytaj AI`; accepting explicitly reveals the answer, then opens the contextual tutor. Jev never grades, selects an answer option or generates an explanation. Old-format decisions are hidden by the spec version. The adapter keeps pinned `jev-1.13.0`, one-second timeout, response validation and budget fallback. Source: [TypeSafe API](https://docs.typesafe.ai/api), [Choice](https://docs.typesafe.ai/primitives/choice).

Configure server-only settings in `.env` or the deployment secret store:

```dotenv
TYPESAFE_API_KEY=your-secret-key
TYPESAFE_JEV_MODE=active
TYPESAFE_JEV_DAILY_LIMIT=20
TYPESAFE_JEV_SESSION_LIMIT=100
TYPESAFE_JEV_MIN_CONFIDENCE=0
```

Budgets above are example request caps, not measured spending recommendations. Existing Upstash Redis configuration is required: budget checks fail closed. Zero/missing budgets, missing key, `off` mode, or no eligible coaching action prevent provider calls. The available action is compared with `none`, even when there is only one action candidate. The model chooses action IDs only; trusted code supplies all displayed text and destinations.

Active mode highlights the selected existing action as a recommendation. Confidence minimum 0 accepts any schema-valid Jev choice; unavailable, invalid and `none` outcomes use the deterministic fallback. No provider retry, no inference inside a DB transaction, and no grade request waits for Jev. Redis deduplicates each trigger; freshness and question revision are rechecked before applying the result. Support writes do not invalidate a pending answer's session version.

Local setup: Greg supplied `TYPESAFE_API_KEY` in `.env`; presence confirmed without displaying the value. Jev is active locally with a cap of 20 calls/day and 100 calls/session. Practice and tutor flags are true. Existing settings and credentials were preserved. Codex did not run a TypeSafe API call or automated test.

Optional reviewed explanations still use the versioned source-backed catalog. Edited questions suppress old explanations; a catalog change during inference discards the result. The deterministic hint uses question and answer-option wording. It does not invent clinical facts. Increment the catalog version when editing reviewed content. The catalog remains empty until qualified content review supplies hints and links. Editorial selection, action-choice evaluation, controlled user-arm assignment and automatic effort attribution remain deferred.

Question references preserve IDs/hashes after content deletion, but current text/keys are reloaded and verified before grading. The session stores an immutable question catalog and summary; changed cards live in `learning_practice_items`. New mutation events retain one-card responses for duplicate-request recovery. Existing historical event responses remain as written. Session, item and event rows cascade on account deletion. Jev decision events contain IDs, probabilities, usage, mode, versions, latency and fallback reason; no provider secrets. For 30-day decision retention, run the following maintenance command daily in deployment scheduling (not installed or run by this task):

```powershell
pnpm exec tsx --env-file=.env scripts/prune-learning-decisions.ts --apply
```

This removes only old `support_decided` events. Tutor conversations remain transient; companion visibility and dismissed recommendation IDs are saved locally per user.

The existing memory feed now has a practice extractor and versioned reconciliation. Committed events create a separate `practice:<category>` activity fact and daily category episode without exam scoring or study-minute credit. Before enabling those fact writes, apply the additive source constraint migration to the intended development database using `NEON_DATABASE_URL`:

```powershell
pnpm exec tsx --env-file=.env scripts/migrate-practice-memory-source.ts --apply
```

This migration was written, not run. Until it is applied, canonical practice observations still inform Jev directly; background fact promotion fails safely.

## Greg's manual verification

Start/resume; two independent wrong cards without help then third wrong; help on one wrong card followed by an independent wrong first attempt on the next distinct card; no repeat of that help; three distinct reveals within 30 minutes and a working prior-card review; repeated reveal of one card does not count twice; reset/review boundary; correct/gap reset; retry excluded from error streak; one available action versus `none`; hint/reveal; skip/early finish; reload/concurrent tabs; revoked access; changed questions; empty pool; migration rollback via flag; Premium/no-Premium; tutor invitation/reveal/follow-up; provider failure/no sources; browse/search/bookmarks/custom categories; keyboard/mobile/reduced motion.

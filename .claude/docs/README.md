# Wolfmed — Technical Documentation

Full technical reference for the Wolfmed codebase, built directly from the source (not from any prior documentation) in August 2026. Organized by Next.js route hierarchy first, then by cross-cutting catalogs (server actions, hooks, types, constants, helpers, components, state). Use this to find **what component, hook, or server action is responsible for a given piece of business logic or user interaction** without re-reading the code from scratch.

For high-level project conventions and non-negotiable rules, see the root [`CLAUDE.md`](../../CLAUDE.md) — this documentation set assumes and cross-references it rather than repeating it.

---

## Foundations

| Doc | Contents |
|---|---|
| [`00-architecture.md`](./00-architecture.md) | Tech stack, repo structure, auth model (no middleware — per-layout gating), server/client boundary, client state layering (Zustand vs. React Query), modal rendering rule, forms pattern, the AI data-source tiers and `retrieveContext()` entry point, cron jobs overview. |
| [`01-database-schema.md`](./01-database-schema.md) | Every table in `schema.ts`, `library-schema.ts`, `memory-schema.ts` — columns, relations, indexes, cascade rules. |

## Routes — page by page, starting from the home page

| Doc | Routes covered |
|---|---|
| [`10-pages-public.md`](./10-pages-public.md) | `/`, `/kierunki`, `/kierunki/[slug]` (+ Stripe purchase flow), `/blog`, `/blog/[slug]` (+ likes), `/forum`, `/forum/[postId]`, `/(terms)/*`, `/sign-in`, `/sign-up`, `/success`, `/canceled`. |
| [`11-pages-panel-core.md`](./11-pages-panel-core.md) | `/panel` (dashboard), `/panel/testy*` (test-taking + session lifecycle), `/panel/testy-egzaminy`, `/panel/egzaminy*` (practical exams), `/panel/wyniki*`, `/panel/plan`, `/panel/ustawienia`, `/panel/dodaj-test`. |
| [`12-pages-panel-learning.md`](./12-pages-panel-learning.md) | `/panel/nauka*` (learning hub, notes), `/panel/procedury*` (+ challenges), `/panel/diagnozy*` (+ egzamin), `/panel/kursy*`. |
| [`13-pages-admin.md`](./13-pages-admin.md) | `/admin*` — dashboard, categories/tags, posts, forum moderation, messages, RAG corpus management. |
| [`14-api-routes.md`](./14-api-routes.md) | Cron jobs, session heartbeat/expire beacons, UploadThing, SSE progress stream, MCP resources, Clerk + Stripe webhooks. |

## Business logic — user flows end-to-end

The `1x`/`2x` docs above answer "what does this page render" and "what does this action do" in isolation. These answer **"what actually happens when a user does X"** — a full trace from the UI trigger through every hook/action/DB write involved, across pages where a flow spans more than one.

| Doc | Flows covered |
|---|---|
| [`30-flows-auth-payments.md`](./30-flows-auth-payments.md) | User registers (Clerk webhook), signs in, purchases/enrolls in a course (Stripe checkout + webhook + `courseEnrollments`), account deletion (+ GDPR memory erasure). |
| [`31-flows-testing.md`](./31-flows-testing.md) | Takes a theory test (session lifecycle: start → heartbeat → submit → memory extraction), generates an AI test, attempts a practical exam (static or AI-generated), attempts or practices a diagnozy case. |
| [`32-flows-learning-content.md`](./32-flows-learning-content.md) | Creates a note (+ premium library indexing), uploads a material (+ storage quota + indexing), creates flashcards (3 origins), generates a mind map, completes a procedure challenge (+ badge award), creates a learning plan. |
| [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md) | The AI tutor chat end-to-end — `/command` execution, self-state questions, the conversational grounded-answer path, and generated lectures — all through `askRagQuestion`, with SSE progress streaming throughout. |
| [`34-flows-social-admin.md`](./34-flows-social-admin.md) | Forum posting/commenting + unread notifications, blog likes, the contact form, admin blog publishing, admin RAG corpus setup and management. |

## Cross-cutting catalogs

| Doc | Contents |
|---|---|
| [`20-forms-catalog.md`](./20-forms-catalog.md) | Every form in the app: page → server action → Zod schema → DB table written. The reverse index into `21`. |
| [`21-server-actions.md`](./21-server-actions.md) | All 27 files / 100 exported functions in `src/actions/` (6,102 lines), grouped by file — every action's real gate order (auth → rate limit → Zod → ownership), transaction behavior, and return shape read from source. Full pass surfaced a broken-access-control bug (audit note #9, corrected) plus notes #20–#22. |
| [`22-hooks.md`](./22-hooks.md) | All 60 files in `src/hooks/`, grouped by domain. |
| [`23-types.md`](./23-types.md) | All 46 files in `src/types/`, key exported types per file. |
| [`24-constants.md`](./24-constants.md) | All 65 files in `src/constants/`, grouped by domain. |
| [`25-helpers.md`](./25-helpers.md) | All 121 files in `src/helpers/`, grouped by domain (one function per file). |
| [`26-components.md`](./26-components.md) | All 597 files in `src/components/`, by directory and domain grouping. |
| [`27-state-stores.md`](./27-state-stores.md) | All 28 Zustand stores in `src/store/`. |
| [`28-queries.md`](./28-queries.md) | All 136 exported functions in `src/server/queries.ts` (2,601 lines) — the read-side data-access layer, grouped by domain, every function's real signature and behavior read from source. Added in doc-test round 8; full function-by-function pass added later, surfacing two real bugs (audit notes #18, #19). |

## Testing & QA

| Doc | Contents |
|---|---|
| [`40-testing-guide.md`](./40-testing-guide.md) | Manual QA test cases (preconditions, steps, expected results, edge cases) derived from the flow docs. A living document — grows every doc-test round. |
| [`41-stripe-payment-plan.md`](./41-stripe-payment-plan.md) | Planning baseline for hardening one-time Stripe payments and adding monthly subscriptions. Not implemented. |
| [`42-stripe-hardening-guide.md`](./42-stripe-hardening-guide.md) | Approval-gated implementation and test guide for hardening current one-time Stripe payments before subscriptions. |
| [`reports/`](./reports/) | Doc-quality test reports. Each round: a technical reader tries real tasks using only these docs, scores findability/accuracy, and produces a prioritized fix list, then the next round retests the fixes before adding new coverage. Starting round 13, rounds also simulate a real symptom/bug report *before* opening the docs, to test whether the docs would actually get someone to a correct fix, not just whether facts are documented. Latest: [`reports/round-16-doc-test.md`](./reports/round-16-doc-test.md) ([round 15](./reports/round-15-doc-test.md), [round 14](./reports/round-14-doc-test.md), [round 13](./reports/round-13-doc-test.md), [round 12](./reports/round-12-doc-test.md), [round 11](./reports/round-11-doc-test.md), [round 10](./reports/round-10-doc-test.md), [round 9](./reports/round-09-doc-test.md), [round 8](./reports/round-08-doc-test.md), [round 7](./reports/round-07-doc-test.md), [round 6](./reports/round-06-doc-test.md), [round 5](./reports/round-05-doc-test.md), [round 4](./reports/round-04-doc-test.md), [round 3](./reports/round-03-doc-test.md), [round 2](./reports/round-02-doc-test.md), [round 1](./reports/round-01-doc-test.md)). |

---

## How to use this

- **"What renders this page and what does it fetch?"** → the `1x-pages-*` doc for that route.
- **"What happens when this form is submitted?"** → [`20-forms-catalog.md`](./20-forms-catalog.md) for the action + schema, then [`21-server-actions.md`](./21-server-actions.md) for what the action does.
- **"Where does this table get written?"** → search [`01-database-schema.md`](./01-database-schema.md) for the table name, then [`21-server-actions.md`](./21-server-actions.md) lists which functions write it.
- **"Is there already a helper/hook/component for X?"** → [`25-helpers.md`](./25-helpers.md) / [`22-hooks.md`](./22-hooks.md) / [`26-components.md`](./26-components.md) before writing a new one (Golden Rule #3).
- **"How does the AI tutor decide what it's allowed to read?"** → [`00-architecture.md`](./00-architecture.md) → AI data sources, then `askRagQuestion` in [`21-server-actions.md`](./21-server-actions.md).
- **"Walk me through what happens when a user does X (registers, pays, takes a test, generates a mind map, ...)"** → the `3x-flows-*` docs — start with [`30-flows-auth-payments.md`](./30-flows-auth-payments.md) and work through to [`34-flows-social-admin.md`](./34-flows-social-admin.md).

---

## Architecture audit notes

Documenting the app end-to-end surfaced a handful of small deviations from the root `CLAUDE.md` conventions. None are urgent — flagged here as a punch list rather than fixed inline, since this was a documentation pass, not a refactor:

1. **Page-as-shell (Golden Rule #2)**: `src/app/admin/categories/page.tsx` and the breadcrumb headers in `admin/categories/new`, `admin/posts/new`, `admin/tags/new` (and their `[id]/edit` siblings) inline JSX directly in `page.tsx` rather than extracting a header/breadcrumb component. See [`13-pages-admin.md`](./13-pages-admin.md).
2. **One-domain-per-type-file (Golden Rule #4)**: `src/types/dataTypes.ts` is a large multi-domain catch-all (tests, procedures, users, and all blog types) rather than split per domain — blog types in particular are candidates to move into their own file. See [`23-types.md`](./23-types.md).
3. ~~**Possible dead/duplicate type file**~~ — resolved: `src/types/testData.ts` is imported by `src/helpers/extractAnswerData.ts` (confirmed via grep), so it's live, not dead. Still worth a closer look at whether its shape should be folded into `dataTypes.ts`'s `Test`/`TestMeta`, but it is not unused code.
4. ~~**Possible duplicate helpers**~~ — resolved: `src/helpers/flashcardCellHelpers.ts` (`parseFlashcardContent`, parses an AI-generation-preview shape) and `src/helpers/parseFlashcardCellContent.ts` (`parseFlashcardCellContent`, parses the saved-deck-reference shape) parse two different points in the flashcard-cell lifecycle — not a duplication. See [`25-helpers.md`](./25-helpers.md).
5. **Stylistic inconsistency in Server Actions**: `src/actions/notes.ts` declares `createNoteAction`/`updateNoteContentAction` as `export const ... = async (...) =>`, while the rest of the codebase (including `deleteNoteAction` in the same file) uses `export async function`. Not a functional issue, just an inconsistency worth normalizing.
6. **Filename typo**: `src/components/KieurnkiPageContent.tsx` (should be "Kierunki") — a working import path, cosmetic only.
7. ~~**Possible store overlap**~~ — resolved, clean split: `useSettingsStore` holds persisted (localStorage) user prefs (`showMobileAI`, `slashCommandsEnabled`); `useSettingsModalStore` holds only the settings modal's `isOpen` boolean. No overlap. See [`27-state-stores.md`](./27-state-stores.md).
8. ~~**Possible legacy constant**~~ — resolved, not legacy: `src/constants/commands.ts`'s `COMMANDS` is **derived from** `toolCommands.ts`'s `TOOL_COMMAND_LIST` (a `.map()`, not a hand-maintained parallel list) specifically so the slash-autocomplete UI can never drift from what the dispatcher actually supports — the source has an explicit comment noting the two had drifted (5 vs. 7 entries) before this was fixed. See [`24-constants.md`](./24-constants.md).
9. ~~**Broken forum-delete access control**~~ — resolved. `deletePostAction` and `deleteCommentAction` no longer accept client-submitted `authorId`. Their uncached query mutations enforce authorization atomically in SQL: a post requires both its id and authenticated owner id; a comment requires the authenticated user to own either the comment or parent post. Missing and unauthorized records return the same error. See [`21-server-actions.md`](./21-server-actions.md) and [`34-flows-social-admin.md`](./34-flows-social-admin.md) → Flow 1.
10. **Materials have no post-upload indexing path, unlike notes** (found in doc-test round 2): a material uploaded on a basic plan is saved with `indexStatus: 'not_indexed'` — a status the `library-index` cron backstop never picks up (it only retries `pending`/`failed`) — and `src/actions/materials.ts` has no edit/update action to re-trigger indexing the way `updateNoteContentAction` does for notes. A material uploaded before a premium upgrade appears to stay permanently unsearchable by the AI tutor unless deleted and re-uploaded. Flagging as a question for product intent rather than a confirmed bug — worth a decision either way. See [`32-flows-learning-content.md`](./32-flows-learning-content.md) → Flow 2 and [`40-testing-guide.md`](./40-testing-guide.md) → TC-8.
11. **Forum comment-locking is not admin-gated, and not reversible** (found in doc-test round 3 — corrects an earlier documentation error in this same doc set, which had called `readonly` "admin-lockable"): `forumPosts.readonly` is set by a checkbox on the ordinary, public create-post form (`CreatePostForm.tsx`), submitted through `createForumPostAction` with **no role check on that field**. Any signed-in user can disable comments on their own new post. No action anywhere — not for the author, not for an admin — can toggle it back after creation. If this is meant to be a moderation tool, it currently isn't reachable by moderators at all. See [`34-flows-social-admin.md`](./34-flows-social-admin.md) → Flow 1 and [`40-testing-guide.md`](./40-testing-guide.md) → TC-10.
12. **RAG corpus has no single-document deletion** (found in doc-test round 3): `admin-rag-actions.ts` can create a store, upload documents, and list them, but the only deletion path (`deleteFileSearchStoreAction`) tears down the entire corpus. Removing one bad document currently means rebuilding the whole store. Not a bug, but a real operational cost worth an admin knowing about before uploading anything they might want to retract individually. See [`13-pages-admin.md`](./13-pages-admin.md) and [`40-testing-guide.md`](./40-testing-guide.md) → TC-11.
13. **Stripe checkout session creation has no idempotency key, unlike the customer-creation call right above it** (found in doc-test round 4, verified by grepping for every `idempotencyKey` usage — exactly one hit, on `getOrCreateStripeCustomer`, none on `stripe.checkout.sessions.create()`): a rapid double-submit of the "Buy" form can create two distinct Checkout Sessions. If a user completes payment on both, each fires its own webhook event with its own event id, so the `processedEvents` replay guard doesn't catch it — two `payments` rows and a double `testLimit` reward would land (course enrollment itself stays correct, since `enrollUserAction` is update-if-exists). Low likelihood in practice, but a real, verified gap rather than a theoretical one, and the fix is small (the pattern already exists one line above to copy). See [`30-flows-auth-payments.md`](./30-flows-auth-payments.md) → Flow 3 and [`40-testing-guide.md`](./40-testing-guide.md) → TC-2 Edge case D.
14. **`buildAccessibleCategories.ts` and `populateCategories.ts` duplicate the same access-filtering logic independently** (found in doc-test round 7, while resolving a hedged claim that one composed the other — it doesn't): both implement the identical course-access + tier-filter algorithm (`checkCourseAccessAction` + `hasAccessToTier`) against different callers (`NaukaCategoriesSection.tsx` vs. most of `/panel`'s test-category pages), copy-pasted rather than shared. Exactly the case Golden Rule #3 exists to prevent. See [`25-helpers.md`](./25-helpers.md).
15. **`useMobileStore` appears to be dead code**: grepping the whole codebase for `setIsMobile` and for `useMobileStore` outside its own definition file returns zero results — it's exported but never imported anywhere. Found in doc-test round 7 while resolving a hedge that guessed something calls it on window resize; nothing does. See [`27-state-stores.md`](./27-state-stores.md).
16. ~~**A timed test session expires on any tab-visibility loss**~~ — confirmed intentional anti-cheat behavior. `useBeaconCleanup` expires immediately on tab hide/pagehide and guarded real unmount. The duplicate heartbeat-cleanup expiry was removed because React Strict Mode/Fast Refresh could trigger it without the student leaving; same-session remounts now cancel stale unmount cleanup. See [`31-flows-testing.md`](./31-flows-testing.md) and [`40-testing-guide.md`](./40-testing-guide.md) → TC-18.
17. ~~**The board/cells save had no conflict detection**~~ — resolved. The table now enforces one row per user and carries an integer `version`; saves are atomic compare-and-swap writes. A stale tab/device receives a conflict instead of overwriting newer data, and the client preserves its local board until the user explicitly chooses the server or local version. Legacy `localStorage` boards reconcile against the server snapshot on hydration. See [`21-server-actions.md`](./21-server-actions.md), [`27-state-stores.md`](./27-state-stores.md), and [`40-testing-guide.md`](./40-testing-guide.md) → TC-19.
18. ~~**`updateTestimonial` overwrote `createdAt` instead of `updatedAt`**~~ — resolved. Testimonial edits now set `updatedAt`, preserving the original submission timestamp and creation-date ordering. See [`28-queries.md`](./28-queries.md) → Testimonials & supporters.
19. **10 write functions in `queries.ts` remain wrapped in React's `cache()`** (found while cataloguing `src/server/queries.ts`): `cache()` is a per-request read-dedup primitive, so a hypothetical identical second mutation in one request would be skipped. The two cells mutations were removed when the versioned atomic save replaced them. No current call site triggers the remaining behavior; this remains a latent correctness footgun, not a confirmed incident. See [`28-queries.md`](./28-queries.md) → Findings.
20. ~~**Deleting an AI-generated lecture never refunded its storage quota**~~ — resolved. New lecture rows store their MP3 byte count in `lectures.size`; generation charges that value and deletion atomically subtracts it from `userLimits.storageUsed`, floored at zero. Existing rows migrate with `size: 0` because their historical size was never stored. See [`21-server-actions.md`](./21-server-actions.md) → `lectures.ts`.
21. ~~**Form-wide and field validation errors used overlapping rendering paths**~~ — resolved. `FieldError` is field-only, `message` is toast-only, button forms use `FormError`, and manual-test category failures have a matching field binding. See [`21-server-actions.md`](./21-server-actions.md) → Findings.
22. ~~**`saveCellsAction`'s `db.transaction()` wrapper was inert**~~ — resolved by replacing the check-then-write flow with one atomic versioned write. **Still open:** `checkPremiumAccessAction`'s docstring describes a removed Clerk-metadata fast path even though the implementation is DB-authoritative.

What was verified and found **sound** (worth stating, since it was checked, not assumed):
- Every admin Server Action independently re-checks the admin role (`ensureAdmin()` or an inline `sessionClaims.metadata.role` check) rather than relying solely on the `admin/layout.tsx` gate — genuine defense-in-depth, not a gap. See [`13-pages-admin.md`](./13-pages-admin.md).
- The retrieval system (`retrieveContext()`) faithfully implements every rule listed in root `CLAUDE.md`'s "🔒 Retrieval rules" section — reserved corpus slots, rank-only fusion, per-document library misses, unnumbered chunk labels. See [`00-architecture.md`](./00-architecture.md).
- Course/premium access checks are consistently DB-authoritative (`courseEnrollments` table via `checkCourseAccessAction`), with Clerk `publicMetadata` used only as a fast, non-authoritative UI signal (e.g. graying out the panel nav link) — no code path was found trusting Clerk metadata for an actual access decision.

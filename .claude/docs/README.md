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
| [`21-server-actions.md`](./21-server-actions.md) | All 27 files in `src/actions/`, every exported function, grouped by file. |
| [`22-hooks.md`](./22-hooks.md) | All 60 files in `src/hooks/`, grouped by domain. |
| [`23-types.md`](./23-types.md) | All 46 files in `src/types/`, key exported types per file. |
| [`24-constants.md`](./24-constants.md) | All 61 files in `src/constants/`, grouped by domain. |
| [`25-helpers.md`](./25-helpers.md) | All 119 files in `src/helpers/`, grouped by domain (one function per file). |
| [`26-components.md`](./26-components.md) | All 591 files in `src/components/`, by directory and domain grouping. |
| [`27-state-stores.md`](./27-state-stores.md) | All 27 Zustand stores in `src/store/`. |

## Testing & QA

| Doc | Contents |
|---|---|
| [`40-testing-guide.md`](./40-testing-guide.md) | Manual QA test cases (preconditions, steps, expected results, edge cases) derived from the flow docs. A living document — grows every doc-test round. |
| [`reports/`](./reports/) | Doc-quality test reports. Each round: a technical reader tries real tasks using only these docs, scores findability/accuracy, and produces a prioritized fix list — see [`reports/round-01-doc-test.md`](./reports/round-01-doc-test.md) for the format and the first round's findings. |

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
3. **Possible dead/duplicate type file**: `src/types/testData.ts` (`TestDataInterface`, `TestsData`) appears to overlap with `dataTypes.ts`'s `Test`/`TestMeta` — worth confirming whether it's still referenced anywhere.
4. **Possible duplicate helpers (Golden Rule #3)**: `src/helpers/flashcardCellHelpers.ts` (`parseFlashcardContent`) and `src/helpers/parseFlashcardCellContent.ts` (`parseFlashcardCellContent`) have near-identical names and both parse flashcard cell content. See [`25-helpers.md`](./25-helpers.md).
5. **Stylistic inconsistency in Server Actions**: `src/actions/notes.ts` declares `createNoteAction`/`updateNoteContentAction` as `export const ... = async (...) =>`, while the rest of the codebase (including `deleteNoteAction` in the same file) uses `export async function`. Not a functional issue, just an inconsistency worth normalizing.
6. **Filename typo**: `src/components/KieurnkiPageContent.tsx` (should be "Kierunki") — a working import path, cosmetic only.
7. **Possible store overlap**: `src/store/useSettingsStore.ts` vs. `src/store/useSettingsModalStore.ts` — worth a quick pass to confirm the split (modal visibility vs. settings values) is clean and not partially duplicated. See [`27-state-stores.md`](./27-state-stores.md).
8. **Possible legacy constant**: `src/constants/commands.ts` (`COMMANDS`) vs. `src/constants/toolCommands.ts` (`TOOL_COMMANDS`, the one referenced by root `CLAUDE.md`'s `requiresSource` rule) — worth confirming `commands.ts` isn't dead/superseded. See [`24-constants.md`](./24-constants.md).
9. **Ownership check trusts a client-submitted field**: `deletePostAction` (`src/actions/actions.ts:572`) authorizes the delete by comparing the session's real `userId` against an `authorId` value read from the submitted `FormData`, rather than re-fetching the post server-side and checking its stored `authorId`. The comparison itself can't be bypassed (an attacker still needs their own real `userId` to equal whatever `authorId` they send, which only matches if they submit their own id), but it's a looser pattern than the rest of the codebase's ownership checks (e.g. `findOwnedDeck`, `renameFlashcardDeckAction`) and worth tightening to look the post up by id and compare server-side. See [`34-flows-social-admin.md`](./34-flows-social-admin.md) → Flow 1.

What was verified and found **sound** (worth stating, since it was checked, not assumed):
- Every admin Server Action independently re-checks the admin role (`ensureAdmin()` or an inline `sessionClaims.metadata.role` check) rather than relying solely on the `admin/layout.tsx` gate — genuine defense-in-depth, not a gap. See [`13-pages-admin.md`](./13-pages-admin.md).
- The retrieval system (`retrieveContext()`) faithfully implements every rule listed in root `CLAUDE.md`'s "🔒 Retrieval rules" section — reserved corpus slots, rank-only fusion, per-document library misses, unnumbered chunk labels. See [`00-architecture.md`](./00-architecture.md).
- Course/premium access checks are consistently DB-authoritative (`courseEnrollments` table via `checkCourseAccessAction`), with Clerk `publicMetadata` used only as a fast, non-authoritative UI signal (e.g. graying out the panel nav link) — no code path was found trusting Clerk metadata for an actual access decision.

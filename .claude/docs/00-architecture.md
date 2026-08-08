# Architecture & Tech Stack

[← Back to index](./README.md)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL (Neon serverless, WebSocket pool) + Drizzle ORM |
| Auth | Clerk (`@clerk/nextjs`) |
| Payments | Stripe (Checkout + webhooks) |
| UI | TailwindCSS v4, Framer Motion, `lucide-react` icons |
| Client state | Zustand |
| Server cache/derived state | TanStack React Query (client-side only, seeded with server `initialData`) |
| Rich text | Lexical editor |
| File uploads | UploadThing |
| AI | Google Vertex AI (`@google-cloud/vertexai`, `@google/genai`) — RAG corpus, chat, embeddings |
| Diagrams / mind maps | `@xyflow/react`, `@excalidraw/excalidraw`, `d3-hierarchy` |
| Presentations | custom `pptx` parsing/generation (`src/lib/parsePptx.ts`, `src/actions/pptx.ts`) |
| Rate limiting | Upstash Redis (`@upstash/redis`) via `src/lib/rateLimit.ts` / `src/lib/redis.ts` |
| Error tracking | Sentry (`@sentry/nextjs`) |
| Package manager | pnpm |

Root layout: `src/app/layout.tsx` — sets the `Poppins` font, wraps everything in `ClerkProviderWrapper` → `Providers` (React Query) → `Navbar` → `ToastProvider`, plus Google Analytics scripts and a cookie-consent banner. This is the **only** client-side provider composition point; every page renders inside it.

## Repository structure

```
src/
├── app/            # Next.js App Router routes (see 10-14 docs for full route map)
├── server/         # DB client/schema, queries, retrieval, memory, planner, RAG
├── actions/        # Server Actions (Zod-validated, "use server")
├── components/     # Shared/domain UI components (591 files, see 26-components.md)
├── hooks/          # Custom React hooks (60 files, see 22-hooks.md)
├── types/          # Domain type definitions (46 files, see 23-types.md)
├── constants/      # Constant maps/config (61 files, see 24-constants.md)
├── helpers/        # One-function-per-file utilities (119 files, see 25-helpers.md)
├── lib/            # Larger utility modules (diagram/mindmap geometry, rate limiting, Stripe/Redis clients)
├── store/          # Zustand stores (27 files, see 27-state-stores.md)
└── styles/         # Tailwind globals
```

## Auth model — no middleware, per-layout gating

There is **no `middleware.ts`** in this repo. Route protection is done explicitly inside each segment's `layout.tsx` (or a page, where there's no shared layout), via two helpers in `src/helpers/`:

- **`requireUser()`** (`src/helpers/requireUser.ts`) — wraps Clerk's `auth.protect()`; throws/redirects to sign-in if unauthenticated, otherwise returns `{ userId, sessionClaims }`.
- **`requireAdmin()`** (`src/helpers/requireAdmin.ts`) — calls `requireUser()`, then reads `sessionClaims.metadata.role`; redirects to `/` if not `"admin"`.

Usage pattern seen throughout the app:
- `src/app/panel/layout.tsx` calls `requireUser()`, then fetches `getUserEnrolledCourses(userId)` and **redirects to `/kierunki?from=panel`** if the user has no course enrollment — the entire `/panel` segment is enrollment-gated, not just auth-gated.
- `src/app/admin/layout.tsx` calls `requireAdmin()` — the whole `/admin` segment is admin-role-gated.
- `src/app/blog/layout.tsx` calls `requireUser()` — the whole `/blog` segment requires sign-in (no signed-out UI path exists for blog).

Because gating lives in `layout.tsx` server components, every page under a gated segment is guaranteed to run with a valid session — pages themselves never re-check auth.

## Server/client boundary (Golden Rule #4)

Data fetching, auth, and redirects run in Server Components (`page.tsx`, `layout.tsx`, `async function` fetchers). Interactivity is isolated into `'use client'` "islands" that receive server-fetched data as props. A `page.tsx` file is never itself a client component — see `src/app/panel/testy/page.tsx` as the reference shell pattern (Golden Rule #2 in root `CLAUDE.md`).

## Client state layering

Two different tools are used for two different jobs — this split is deliberate, not incidental:

- **Zustand** (`src/store/`) — ephemeral, cross-component UI state that isn't "data": modal open/closed, confirm-dialog state, the AI chat drawer, editor UI state. See `useConfirmModalStore` + `<ConfirmModal />`, rendered once at `panel/layout.tsx` level (see Modal Components pattern below).
- **React Query** (`@tanstack/react-query`) — anything that is fetched, filtered, sorted, or cached data. `src/components/AllTests.tsx` is the reference: `useQuery` with a `queryKey` including every discriminator (category/slug/session), `initialData` seeded from the server-rendered props, shared `staleTime`. Never hand-rolled `useState` + `useEffect` + `.filter()` for this.

## Modal rendering rule

`src/app/panel/layout.tsx` sets `position: relative` on its wrapper, which breaks any `position: fixed` modal rendered from a component nested inside it. The fix used throughout: lift modal `useState` to the page (or layout) level and pass an `onOpenModal` callback down, or — for app-wide modals — drive them from a Zustand store and render the modal component once at layout level (`<ConfirmModal />`, `<FlashcardReviewModalHost />`, `<SettingsModal />` are all rendered once in `panel/layout.tsx`, never inside nested components).

## Forms — server-only Zod validation

Every form in the app follows one pattern (Golden Rule in root `CLAUDE.md`, reference implementation `MottoForm.tsx`):

1. `useActionState(serverAction, EMPTY_FORM_STATE)`
2. `<form action={action}>` wired directly to the Server Action
3. Shared `Input`/`Textarea`/`Label`/`Select` components from `src/components/ui`
4. `<FieldError name="..." formState={state} />` after every field
5. `useToastMessage(state)` for form-wide (non-field) errors
6. Validation happens **only** inside the Server Action via a Zod schema — no client-side `safeParse`, no HTML `required`/`pattern` attributes

Full catalog of every form → action → schema mapping: [`20-forms-catalog.md`](./20-forms-catalog.md).

## AI data sources — the four tiers

Every AI feature (tutor, mind map, tests, flashcards, plans, lectures, `/commands`) reads from up to four tiers, entirely through **one function**: `retrieveContext()` in `src/server/retrieval/context.ts`. A feature declares a `RetrievalMode` at the call site — a **closed set of exactly three** string literals (`src/types/retrievalTypes.ts`), not an example list: `canonical_only` (curriculum alone — what mind maps, AI tests, and plain `/commands` use today), `canonical_with_personal` (curriculum + the student's own notes/materials when they earn a slot), `explicit_resource` (the student named a specific note/material; it's the primary source and the corpus isn't consulted). Deliberately a closed union rather than independent `corpus`/`personal` booleans — the type's own comment notes `corpus: false, personal: false` isn't a state anything wants, and an attachment is a different *intent* from a search, not a filter bolted onto one. This makes the CLAUDE.md tier table executable rather than aspirational.

| Tier | Source | Notes |
|---|---|---|
| 1. Curriculum (corpus) | Vertex AI RAG corpus, global | `src/server/vertex-rag/retrieve.ts` → `retrieveContexts()`. Distance-based (lower = better). A corpus "miss" (`isCorpusMiss`, threshold `CORPUS_MISS_DISTANCE = 0.34` in `constants/rag.ts`) drops the **whole** source rather than keep its least-bad chunks. |
| 2. Personal library | The student's own notes/materials | `src/server/library/retrieve.ts` → `retrieveLibrary()`. Similarity-based (higher = better), trigram + HNSW vector search over `libChunks`. Gated by `mode === 'canonical_with_personal'` and the `ENABLE_IMPLICIT_PERSONAL_RETRIEVAL` flag. |
| 3. Attachments (`@resource`) | One explicitly picked note/material | `getAttachedSourceText()` — returns the **whole** source, not sampled chunks, when `mode === 'explicit_resource'`. |
| 4. Student memory | Facts/episodes/preferences about the student, never subject content | `src/server/memory/` — routed separately via `isSelfStateQuestion`, never enters a retrieval query. |

Key mechanics inside `retrieveContext()`:
- The corpus and personal-library reads run **in parallel** (`Promise.all`).
- Corpus gets a **reserved slot allocation** (`CANONICAL_RESERVED_SLOTS`) taken before any fusion, so personal notes can never crowd out curriculum on a request that has both.
- Whatever's left after the reserved slots is merged via **reciprocal rank fusion** (`reciprocalRankFusion`, `src/helpers/reciprocalRankFusion.ts`) — corpus (distance) and library (similarity) scores are never compared directly, only by rank.
- Query text for the personal library is stripped of filler (`stripQueryFiller`) before searching — prose wrappers measurably hurt `word_similarity` matches (documented inline in `context.ts`).

See root `CLAUDE.md` → "🔒 Retrieval rules" for the full non-negotiable list this implementation encodes, and [`21-server-actions.md`](./21-server-actions.md) / the panel-learning docs for which features call `retrieveContext()` with which mode.

## Directory map for AI/RAG subsystems

| Directory | Responsibility |
|---|---|
| `src/server/vertex-rag/` | Vertex AI corpus client, ingest, retrieve, generate, corpus management |
| `src/server/retrieval/` | The single `retrieveContext()` entry point — fuses corpus + library |
| `src/server/library/` | Personal library: chunking, embedding sweep, retrieval, note/material sync |
| `src/server/memory/` | Tutor memory: extract, retrieve, assemble (prompt prefix), erase (GDPR), gate (self-state routing) |
| `src/server/planner/` | Learning-plan catalog, scheduling engine, progress tracking |
| `src/server/tools/` | Tool/command definitions + executor for the AI tutor's `/commands` |

## Small server utility modules (found in round 8's reverse-direction check)

Four small `src/server/*.ts` files, each referenced by name throughout the flow docs but never described as files in their own right:

- **`src/server/user.ts`** — `getCurrentUser()`, wrapped in React's `cache()` so multiple independent calls within one request (e.g. several Suspense-boundary components on the same page each needing the current user) collapse into a single `auth()` + DB lookup rather than one per caller. Its own header comment says `// server/queries/user.ts` — stale, left over from a prior file move; the real path is `server/user.ts`.
- **`src/server/premium.ts`** — `getIsPremium()`, same `cache()` pattern, wrapping `checkPremiumAccessAction()`. The source comment explains why: `/panel/nauka` renders several independent Suspense boundaries that each need the premium flag, and `cache()` collapses those into one access check per request instead of N.
- **`src/server/flashcardAccess.ts`** — `findOwnedDeck(userId, deckId)`, `findOwnedCard(userId, cardId)`, `nextCardPosition(deckId)`. The ownership-scoping helpers behind every flashcard action in [`21-server-actions.md`](./21-server-actions.md) (`renameFlashcardDeckAction`, `deleteFlashcardDeckAction`, etc.) — the "does this deck/card actually belong to this user" check they all share.
- **`src/server/rag-queries.ts`** — `getRagConfig()`, `setRagConfig()`, `deleteRagConfig()`. Thin CRUD over the `ragConfig` table, called from `src/actions/admin-rag-actions.ts`.

## Rate limiting (`src/lib/rateLimit.ts`)

Found undocumented in rounds 1–4 of doc-testing — every flow/forms doc names the rate-limit **bucket** an action uses (e.g. `test:start`, `blog:like`) but none point at where the actual numbers live or explain the mechanism. One file, `checkRateLimit(userId, bucket)`, backs every `checkRateLimit(...)` call in the codebase:

- **Config is a single object**, `RATE_LIMITS: Record<string, {interval, maxRequests}>` — over 35 buckets, each independently tuned (examples: `note:create` 10/hour, `material:upload` 5/hour, `testimonial:create` 2/hour, `quiz:generate` 20/**day**, `egzamin:generate` 5/**day**, `blog:like` 100/hour, `forum:seen` 120/hour). Calling `checkRateLimit` with a bucket name not in this object **throws** — the bucket must exist in the config, so a new rate-limited action always needs a matching entry added here first.
- **Sliding window via Redis sorted sets** (`getRedis()`, Upstash) in production: old entries outside the window get trimmed (`zremrangebyscore`), the current count is read (`zcard`), then the new request is added — genuinely sliding, not fixed-window.
- **In-memory fallback for local dev** (`checkInMemoryRateLimit`) when `getRedis()` returns nothing — fixed-window, explicitly documented in the source as "not suitable for production (doesn't persist across server restarts)."
- **Fails open, not closed**: if the Redis call itself throws (an outage, a network error), `checkRateLimit` catches it and returns `{ success: true, ... }` — the source comment states this is deliberate, prioritizing availability over strict enforcement. Worth knowing: **every rate limit in this app is soft during a Redis outage**, not a hard guarantee — relevant if debugging "why did an abuse-prevention limit not trigger."

## Cron & background jobs

Three cron routes under `src/app/api/cron/` (see [`14-api-routes.md`](./14-api-routes.md)): session cleanup, personal-library embedding sweep, and memory-trace retention (90-day cleanup of `memTraces`, per the schema doc).

## Scripts & operational tooling (`/scripts`)

One-off and setup scripts, run via `pnpm run <name>` (see root `CLAUDE.md` → Development Commands) — **not** part of the running app, and per root `CLAUDE.md`'s Agent Instructions, never run without explicit user approval.

| Command | Script | Purpose |
|---|---|---|
| `db:seed` | `seed-courses.ts` | Seeds the `courses` table. |
| `db:seed:procedures` | `seed-procedures.ts` | Seeds `procedures` from `data/procedures.json` — see [`01-database-schema.md`](./01-database-schema.md). |
| `db:reset:challenges` | `reset-challenge-progress.ts` | Clears `challengeCompletions`/`procedureBadges` (dev reset, not a production path). |
| `db:memory:extensions` | `setup-memory-extensions.ts` | Installs the Postgres `vector`/`pg_trgm` extensions the memory and library tables require — must run before the first `db:push` touches those tables. |
| `db:memory:seed` | `seed-memory-policies.ts` | Seeds `memPolicies` (`DEFAULT_POLICIES`, see [`24-constants.md`](./24-constants.md)). |
| `rag:preflight` | `rag-preflight.ts` | Pre-flight checks before touching the Vertex RAG corpus. |
| `rag:migrate` | `rag-migrate.ts` | Corpus migration tooling. |
| `rag:set-corpus` | `rag-set-corpus.ts` | Points the app at a specific corpus (writes `ragConfig`). |
| `test:diagnozy` | `test-diagnozy.ts` | Diagnozy content/grading test harness. |
| `tests:replace-category` | `replace-category.ts` | Bulk category-rename tooling over existing test data. |

Not wired to a `package.json` script but present in the directory: `seed-diagnozy.ts`, `seed-pielegniarstwo-tests.ts`, `sync-clerk-metadata.ts`, `export-users.ts`, `generateProcedureSlugs.ts`, `fix_duplicates.py`, and a small cluster of `.mjs` mannequin-geometry tools (`apply-body-zones`, `bake-mannequin-zones`, `measure-mannequin`, `prune-mannequin`, `suggest-body-zones` — see `scripts/MANNEQUIN.md` for that subsystem specifically) used to prep the 3D mannequin asset consumed by the diagnozy exam (see [`31-flows-testing.md`](./31-flows-testing.md) → Flow 5). Run any of these directly with `tsx scripts/<name>.ts` (or `python3` for the one `.py` file).

## Where to look next

- Route-by-route flow documentation: [`10-pages-public.md`](./10-pages-public.md) through [`14-api-routes.md`](./14-api-routes.md)
- Database schema: [`01-database-schema.md`](./01-database-schema.md)
- Forms: [`20-forms-catalog.md`](./20-forms-catalog.md)
- Server actions / hooks / types / constants / helpers / components / stores: files `21` through `27`

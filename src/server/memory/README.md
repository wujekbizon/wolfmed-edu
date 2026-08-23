# Memory layer (`src/server/memory/`)

The interpretive layer over the database: what the tutor should know about a
student this turn. Neon + pgvector, built from scratch in TypeScript. The Vertex
corpus stays the **knowledge** layer; this is the **memory** layer.

> The database is the system of record (progress, quizzes, mind maps, goals).
> Memory is derived and disposable — rebuildable from the record + events, never
> the source of truth for anything shown in the UI.

## Status

- **M0 (done)** — migrations (6 tables + extensions), `config.ts`, `embeddings.ts`.
- **M1 (done)** — Path A: policy + preference stores, default policies seeded,
  preferences settings UI, and the static-prefix injection into the tutor
  (fail-safe). No ranked memory yet.
- **M2 (done, minus client-only activities)** — facts/episodes stores, atomic
  promotion/reactivation/supersession, idempotent episodes, and Path B hybrid
  retrieval. Deterministic hooks cover theory tests, diagnozy exams, procedure
  challenges, practical exams, and manual study logs. Versioned reconciliation
  rebuilds missing memory from canonical tables without embeddings. Flashcard
  review and mind-map mastery remain client-only with no committed event to promote.
- **M3 (done, minus rolling summary)** — Path B injected into the tutor: retrieved
  facts + recent episodes in the volatile prompt tail (token-budgeted, fail-safe).
  A constrained Flash-Lite semantic router separates self-state from medical
  questions without changing the RAG query. Self-state recall returns explicit
  ready/empty/unavailable states and never falls through to the corpus. Rolling
  Six bounded recent turns support short self-state follow-ups without changing
  medical RAG. Each free-form turn appends `user_msg`, retrieval, and `model_msg`
  trace events under one `(runId, turnIndex)` for replay/audit.
- **M5 (done)** — GDPR/RODO: `erase.ts` is part of the Clerk `user.deleted`
  transaction — tombstones facts/episodes under a random `deleted:*` owner,
  hard-deletes preferences/traces, and logs a pseudonymous deletion event. Nightly
  retention cron (`/api/cron/memory-retention`, vercel.json) purges traces >90d,
  active episodes >180d, expired facts, and revoked facts/episodes >30d.
- **M4 — remaining (optional, ships last)**: combined-call LLM extraction +
  background episode distillation. Per the plan, build last and kill if the gate
  rejection logs show noise.

## Layout

| File | Role |
|---|---|
| `config.ts` | Single source of truth: `EMBED_DIM = 768`, model, thresholds, token budget, table names. Pure constants — no `server-only`, so the Drizzle schema can import it. |
| `embeddings.ts` | `gemini-embedding-001` via the shared `vertex-rag/client`. `RETRIEVAL_DOCUMENT`/`RETRIEVAL_QUERY` task types, 1.5s timeout → `EmbeddingUnavailable` so retrieval cascades instead of hanging. |
| `stores/policies.ts` | Exact-match reads + versioned upsert of policies (never similarity). |
| `stores/preferences.ts` | Per-user preference upsert + load-all. |
| `classifyTutorIntent.ts` | Constrained semantic routing between typed self-state memory, medical RAG, and clarification. Classification failure preserves the existing RAG fallback. |
| `assemble.ts` | Builds the static policy/preference prefix. |
| `buildMemoryTail.ts` / `buildSelfStateContext.ts` | Bounded volatile recall and explicit ready/empty/unavailable self-state context. |
| `extract*.ts` | Deterministic committed-event → fact/episode hooks. |
| `reconcile*Memory.ts` | Versioned, idempotent rebuild from learning tables. |
| `recordTutorTurnTrace.ts` | Append-only user/retrieval/model trace sequence. |

Tables live in `src/server/db/memory-schema.ts` (re-exported from `db/schema.ts`)
so `drizzle-kit` and the ORM manage them: `wolfmed_mem_{policies,preferences,facts,episodes,traces,deletion_events}`.

Preferences UI: `src/components/memory/PreferencesForm.tsx` on `/panel/ustawienia`.
Preference definitions: `src/constants/memoryPreferences.ts`. Default policies:
`src/constants/memoryPolicies.ts`.

## Applying the schema

Run **once, in order** (the HNSW/trgm indexes need the extensions first):

```bash
pnpm run db:memory:extensions   # CREATE EXTENSION vector, pg_trgm  (idempotent)
pnpm run db:push                # creates wolfmed_mem_* tables + indexes
pnpm run db:memory:seed         # seed default policies (idempotent)
```

## Invariants

- The dimension `768` appears in exactly one place (`EMBED_DIM`); the schema and
  the embeddings client both import it.
- `embedding` columns are nullable projections — every row must survive
  `embedding = NULL` and be rebuildable from `content`/`summary`.
- Scope before rank: every retrieval filters `user_id` + `status='active'` +
  `superseded_by IS NULL` before ordering.
- The Vertex corpus never holds per-student data; memory never holds document
  contents. Three lanes, kept separate.

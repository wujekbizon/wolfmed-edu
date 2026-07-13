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
- **M2 (done, minus mind-map hook)** — facts/episodes stores, promotion gate
  (dedup + contradiction → supersession), Path B hybrid retrieval (pgvector +
  trgm + ILIKE cascade), and the deterministic **quiz** hook: on quiz completion
  (`submitTestAction` → `after()` → `onQuizCompleted`) a per-category performance
  fact is recomputed/superseded and a quiz episode logged. The mind-map hook is
  deferred — mastery is currently client-only state with no DB persistence to
  hook; wiring it needs mastery persisted first.
- **M3 (done, minus rolling summary)** — Path B injected into the tutor: retrieved
  facts + recent episodes in the volatile prompt tail (token-budgeted, fail-safe),
  plus the memory-answered guard (self-state questions → `answerFromMemory` via
  Flash-Lite, skipping corpus retrieval entirely). Rolling summary deferred (needs
  conversation-turn persistence the app doesn't have yet).
- M4–M5 — next (LLM extraction; GDPR erasure + retention).

## Layout

| File | Role |
|---|---|
| `config.ts` | Single source of truth: `EMBED_DIM = 768`, model, thresholds, token budget, table names. Pure constants — no `server-only`, so the Drizzle schema can import it. |
| `embeddings.ts` | `gemini-embedding-001` via the shared `vertex-rag/client`. `RETRIEVAL_DOCUMENT`/`RETRIEVAL_QUERY` task types, 1.5s timeout → `EmbeddingUnavailable` so retrieval cascades instead of hanging. |
| `stores/policies.ts` | Exact-match reads + versioned upsert of policies (never similarity). |
| `stores/preferences.ts` | Per-user preference upsert + load-all. |
| `assemble.ts` | **Path A** — `buildStaticPrefix(userId)`: active policies + preferences → prompt-cache-friendly system-instruction block. Fail-safe: returns `''` on any error so the tutor never breaks. |

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

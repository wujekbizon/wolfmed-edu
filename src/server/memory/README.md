# Memory layer (`src/server/memory/`)

The interpretive layer over the database: what the tutor should know about a
student this turn. Neon + pgvector, built from scratch in TypeScript. The Vertex
corpus stays the **knowledge** layer; this is the **memory** layer.

> The database is the system of record (progress, quizzes, mind maps, goals).
> Memory is derived and disposable — rebuildable from the record + events, never
> the source of truth for anything shown in the UI.

## Status

- **M0 (done)** — migrations (6 tables + extensions), `config.ts`, `embeddings.ts`.
- M1–M5 — see `RAG plan` + `Memory System Extension` docs. Sequencing rule:
  **do not land M2/M3 during the RAG Phase 2 Serverless bake-in** (memory context
  in prompts would confound the before/after retrieval-quality comparison).

## Layout

| File | Role |
|---|---|
| `config.ts` | Single source of truth: `EMBED_DIM = 768`, model, thresholds, token budget, table names. Pure constants — no `server-only`, so the Drizzle schema can import it. |
| `embeddings.ts` | `gemini-embedding-001` via the shared `vertex-rag/client`. `RETRIEVAL_DOCUMENT`/`RETRIEVAL_QUERY` task types, 1.5s timeout → `EmbeddingUnavailable` so retrieval cascades instead of hanging. |

Tables live in `src/server/db/memory-schema.ts` (re-exported from `db/schema.ts`)
so `drizzle-kit` and the ORM manage them: `wolfmed_mem_{policies,preferences,facts,episodes,traces,deletion_events}`.

## Applying the schema

Run **once, in order** (the HNSW/trgm indexes need the extensions first):

```bash
pnpm run db:memory:extensions   # CREATE EXTENSION vector, pg_trgm  (idempotent)
pnpm run db:push                # creates wolfmed_mem_* tables + indexes
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

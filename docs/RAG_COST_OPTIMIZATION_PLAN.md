# RAG Knowledge Base — Cost-Optimized Foundation Plan
**Date**: 2026-07-11
**Status**: PLAN — approved research, not yet implemented
**Base branch**: `practical-exam`
**Supersedes cost assumptions in**: `RAG_COST_AUDIT.md`, `RAG_COST_SIMULATION.md`
**Companion docs**: `RAG_CREDITS_PLAN.md` (credits system stays as planned)

---

## TL;DR

1. **Our corpus is almost certainly running on the Spanner-backed `RagManagedDb` default — a flat ~$65–80/month cost that runs 24/7 regardless of usage.** This is the single biggest RAG cost on the platform and it exists whether we have 3 documents or 3,000. Getting off it is Phase 2 of this plan.
2. **Vertex AI RAG Engine now has a Serverless deployment mode with $0 resource-management cost** (verified in official docs, currently Public Preview). Recommended target. Migration = switch project mode → recreate corpus → re-upload documents (data does NOT migrate between modes).
3. **Our old cost docs underestimated Gemini costs 4–8×.** Real Gemini 2.5 Flash pricing is **$0.30/1M input, $2.50/1M output** (the audit used $0.075/$0.30 — those were 1.5-Flash-era numbers). On top of that, 2.5 Flash has **thinking enabled by default and thinking tokens bill as output tokens**. We never set `thinkingConfig` anywhere — we are paying for reasoning tokens on every single call today.
4. **Quick wins exist before any migration**: disable thinking on RAG calls, drop the redundant second RAG call on the tool path, use Flash-Lite for the two cheap "dispatch/confirm" calls, and fix a live bug (`gemini-.5-flash` typo in `executor.ts`).
5. The uploaded research guide (`nextjsvertexragagentguide.md`) is **largely accurate** — every load-bearing claim checked out against official Google documentation. Corrections and caveats are listed in §3.

---

## 1. Current state (audited on `practical-exam`)

### Architecture we have today

| Piece | Implementation | File |
|---|---|---|
| Corpus management | REST `v1` `ragCorpora` create/delete/get, ADC auth | `src/server/google-rag.ts` |
| File ingestion | Direct synchronous `upload/v1 …/ragFiles:upload` multipart | `src/server/google-rag.ts` |
| Query path | **Managed grounding** — `retrieval.vertexRagStore` tool on `gemini-2.5-flash` via `@google/genai` | `src/server/google-rag.ts` |
| Tool path | 4 Gemini calls: RAG fetch → function-call dispatch → content generation → confirmation wrap | `rag-actions.ts` + `tools/executor.ts` |
| Config | Single `ragConfig` DB row holding the corpus resource name | `src/server/rag-queries.ts` |
| Admin UI | `/admin/rag` — create store, upload, list, test query, delete | `src/components/rag/*` |
| Protection | Premium gate + Redis rate limits (`rag:query` 10/h, `lecture:generate` 3/day) | `rag-actions.ts`, `lib/rateLimit.ts` |

This is a solid foundation — the auth pattern, direct upload, and managed grounding all match Google's current recommended shape, and we're already on `@google/genai` (the old `@google-cloud/vertexai` SDK is removed June 24, 2026, so nothing to migrate there).

### Problems found in the audit

1. **We're on the expensive backend by default.** `createFileSearchStore()` sends no `vector_db_config` and the project has never set a deployment mode → corpus lives in Spanner-mode `RagManagedDb`, Basic tier (100 processing units, fixed). That's a provisioned Spanner instance billed 24/7 in a Google-managed tenant project — it never shows under "Cloud Spanner" in our own console, only in Billing.
2. **No embedding model was specified at corpus creation** → defaulted to `text-embedding-005`, which is **English-optimized**. Our entire knowledge base is Polish medical content. Retrieval quality is silently degraded. The embedding model is locked at corpus creation — fixing it requires a new corpus anyway, which the Serverless migration gives us for free.
3. **Thinking tokens are being billed on every call.** No call in the codebase sets `thinkingConfig`. 2.5 Flash thinks by default; reasoning tokens bill at the $2.50/1M output rate and routinely exceed the visible answer tokens.
4. **Live bug**: `src/server/tools/executor.ts:208` — `model: 'gemini-.5-flash'` (missing `2`). The `utworz_test` generation call fails at runtime.
5. **Double RAG call on the tool path** (already flagged in `RAG_COST_AUDIT.md`, never fixed): `queryFileSearchOnly()` runs even when the user attached a `@material` PDF as primary source.
6. **Hardcoded project/location** (`project-9d10f80c-d5df-459f-8d8` / `europe-west3`) duplicated in two places inside `google-rag.ts` instead of single-sourced env vars.
7. **Old cost docs measured the wrong product.** `RAG_COST_AUDIT.md` says "File Search storage and queries are free" — that's true for the **Gemini Developer API File Search** tool, but our code uses **Vertex AI RAG Engine**, a different product with different billing. The free-storage claim never applied to us.

---

## 2. The cost picture, corrected (verified July 2026)

### Fixed costs (the real problem)

| Backend | Cost | Notes |
|---|---|---|
| **Spanner mode, Basic tier** (what we have) | **~$65–80/month flat** | 100 PU = 0.1 node × ~$0.90–1.09/node-hr (region/edition dependent) × 730h, + backup storage. Runs regardless of usage. One instance covers all corpora in the project. |
| Spanner mode, Scaled tier | ~$650+/month | Autoscaling 1–10 nodes. Not for us. |
| **Serverless mode** (target) | **$0 resource management** + usage-based Vector Search 2.0 collection | Official: "There is no additional charge when using Serverless deployment mode." The Vector Search 2.0 (a.k.a. Agent Retrieval) collection is provisioned **in our own project** — full cost visibility, usage-based. Google's own guidance: minimal setups run well under $100/mo *at high throughput*; our corpus (hundreds of small chunks, low QPS) should be near the floor. Exact per-GiB/per-query rates must be confirmed in the Agent Retrieval pricing calculator before committing (§6 pre-flight). |

### Per-call costs (corrected rates)

| Rate | Old docs assumed | Actual (Vertex, July 2026) |
|---|---|---|
| Gemini 2.5 Flash input | $0.075 /1M | **$0.30 /1M** |
| Gemini 2.5 Flash output | $0.30 /1M | **$2.50 /1M** (thinking tokens bill here too) |
| Gemini 2.5 Flash-Lite input/output | — | $0.10 / $0.40 per 1M |
| `gemini-embedding-001` | — | $0.15 /1M tokens (multilingual, MTEB leader) |
| `text-embedding-005` | — | $0.025 /1M tokens (English-optimized) |
| Ranking API (`semantic-ranker`) | — | $1.00 per 1,000 queries (up to 100 records/query) |

**Corrected per-action estimates** (thinking OFF, managed grounding, ~2K retrieved-context tokens):

| Action | Calls | Est. cost |
|---|---|---|
| Plain RAG query | 1× Flash | ~$0.002–0.003 |
| Plain RAG query (today, thinking ON) | 1× Flash | ~$0.005–0.010 |
| Tool request (current 4-call chain) | 4× Flash | ~$0.015–0.03 |
| Tool request (optimized, §4) | 2× Flash + 1× Flash-Lite | ~$0.008–0.015 |

Still cheap in absolute terms at our volume (hundreds–low thousands of queries/month → single-digit dollars). **The flat Spanner instance dwarfs all generation costs combined** — at current usage it's equivalent to ~10,000–30,000 plain queries per month of pure waste. That's why the migration is the headline item, and thinking-off is the second.

---

## 3. Research-guide verification (claim → verdict)

Every load-bearing claim in `nextjsvertexragagentguide.md` was checked against official Google documentation. Summary:

| Claim | Verdict |
|---|---|
| Two deployment modes (Spanner / Serverless), project-level setting via `Get/UpdateRagEngineConfig` | ✅ Confirmed — [Deployment modes](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/deployment-modes) |
| Switching modes does NOT migrate or delete data; corpora are permanently tied to the mode active at creation; only one mode visible at a time | ✅ Confirmed — [Switching between modes](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/switching-modes) |
| Serverless: $0 additional charge; provisions a Vector Search 2.0 collection in your own project | ✅ Confirmed — [Serverless mode](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/serverless-mode). **Caveat the guide undersold: Serverless mode is Public Preview**, not GA. |
| Spanner Basic = fixed 100 PU (0.1 node); Scaled = autoscaling 1–10 nodes; billed as standard Spanner SKUs in a Google-managed tenant project (invisible in our console) | ✅ Confirmed — [Understanding RagManagedDb](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/understanding-ragmanageddb), [Managing Spanner mode](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/spanner-mode) |
| ~$60–65/mo for Basic tier | ⚠️ Directionally right, region-dependent. `europe-west3` node rates are higher than US; budget **$65–80/mo**. Some third-party guides quote $200+/mo — that appears to include storage/backup or Enterprise edition; verify our actual SKU in Billing → Reports. |
| `UNPROVISIONED` tier deletes the Spanner instance **and all corpora in it**, irreversibly | ✅ Confirmed. This is the "stop billing" switch — and it must never be reachable from admin UI without a manual confirmation step. |
| Embedding model locked at corpus creation; changing requires recreate + re-import | ✅ Confirmed — [Use embedding models](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-embedding-models). Known SDK pitfall: specifying an embedding model without `vector_db` config can silently fall back to `text-embedding-005`. |
| Import (`:import`) is async LRO, idempotent by content hash; direct upload (`upload/v1 …:upload`) is synchronous | ✅ Confirmed; matches our working implementation. |
| `retrieveContexts` costs embedding + vector search only (no generation) | ✅ Confirmed — no separate RAG Engine charge; you pay the query embedding + vector DB usage. |
| Ranking API `semantic-ranker` for two-stage retrieval | ✅ Confirmed — [Ranking API](https://docs.cloud.google.com/generative-ai-app-builder/docs/ranking), $1/1k queries. Newer ranker versions support 1024 tokens/record. |
| `@google-cloud/vertexai` deprecated, removed June 24, 2026; use `@google/genai` with `vertexai: true` | ✅ Confirmed — [SDK migration guide](https://cloud.google.com/vertex-ai/generative-ai/docs/deprecations/genai-vertexai-sdk). We already use `@google/genai`. |
| "Watch for Thinking Text Output billing line" | ✅ Confirmed and **worse than the guide implies** — thinking is ON by default for 2.5 Flash and we never disable it. |
| KNN default fine under ~10K files; ANN is Preview | ✅ Reasonable; not a concern at our scale. |
| Managed grounding vs manual pipeline trade-off table | ✅ Sound. Managed grounding stays our default; manual `retrieveContexts` (+ optional rerank) becomes an additional cheap path. |

**Verdict on the guide: adopt it as the technical reference**, with three amendments: (a) Serverless is Preview — pre-flight region/quota check required; (b) use `gemini-embedding-001` or `text-multilingual-embedding-002`, not the default English `text-embedding-005`, for Polish content; (c) its silence on `thinkingConfig` leaves the biggest per-call cost lever on the table.

---

## 4. Recommended architecture

### Decision: stay on Vertex AI RAG Engine, migrate to Serverless mode

Options considered:

| Option | Fixed cost | Verdict |
|---|---|---|
| **A. RAG Engine, Serverless mode** | $0 + usage-based Vector Search 2.0 | ✅ **Recommended.** Keeps our entire working code surface (same endpoints, same auth, same managed grounding — mode is invisible at the call sites). EU region, ADC auth, corpus in our project. |
| B. Gemini Developer API File Search | $0 storage, free query embeddings, $0.15/1M one-time indexing | Genuinely cheapest, but: API-key auth (we deliberately removed key-based auth), separate product surface (rewrite of store/upload/query code), Developer-API data-residency terms — weaker story for EU medical content. Keep as fallback if Serverless preview disappoints. |
| C. pgvector on existing Neon Postgres | ~$0 | Full control and no new vendor, but we'd own chunking, embedding calls, index tuning, and retrieval quality forever. Not worth it while RAG Engine Serverless is $0-floor. Revisit only if Google's preview pricing surprises us. |
| D. Do nothing (stay Spanner Basic) | ~$65–80/mo | ❌ Pure waste at our corpus size and query volume. |

### Target query paths

- **Default (user Q&A, tools)**: managed grounding — unchanged, 1 call, Google handles retrieval. Add `thinkingConfig: { thinkingBudget: 0 }`.
- **Cheap search (new capability)**: `retrieveContexts` only — embedding + vector search, no LLM. Powers "search the knowledge base" in admin UI and pre-flight checks before expensive generation.
- **Premium answers (later, optional)**: `retrieveContexts` top-10 → Ranking API top-3 → grounded generation. Only if we measure managed grounding quality as insufficient. $1/1k rerank queries is affordable; skip until proven necessary.

---

## 5. Implementation phases

### Phase 0 — Quick wins (no migration, immediate savings, low risk)

1. **Fix the `gemini-.5-flash` typo** — `src/server/tools/executor.ts:208`. Live bug in `utworz_test`.
2. **Disable thinking on all RAG/tool calls**: add `thinkingConfig: { thinkingBudget: 0 }` to every `generateContent` config in `google-rag.ts` and `tools/executor.ts`. Largest per-call saving (output tokens are 8× input price). If a specific tool (e.g. `/planuj`) measurably benefits from reasoning, re-enable per-call with a small budget.
3. **Kill the redundant RAG call on the tool path** (`rag-actions.ts`): skip `queryFileSearchOnly()` when `pdfFiles.length > 0` or `additionalContext` is substantial (the audit doc has flagged this since April).
4. **Downgrade the cheap chain links to `gemini-2.5-flash-lite`**: the function-call dispatch and final confirmation-wrap calls are structurally trivial — Flash-Lite is ~6× cheaper on output. Content generation stays on Flash.
5. **Single-source config**: move `PROJECT_ID` / `LOCATION` to env vars (`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`) read in exactly one module; both the REST helper and `GoogleGenAI` client consume the same constants.
6. **Log `response.usageMetadata`** (prompt/candidates/thoughts token counts) on every Gemini call behind a debug flag → real numbers replace estimates within a week of usage.

### Phase 1 — Foundation module (restructure, no behavior change)

Reshape `src/server/google-rag.ts` (600 lines, mixed concerns) into a `src/server/vertex-rag/` module mirroring the guide's layout:

```
src/server/vertex-rag/
├── client.ts        # auth, ragFetch, uploadFetch, PROJECT/LOCATION single source
├── config.ts        # getRagEngineConfig / deployment-mode helpers (NEW)
├── corpus.ts        # create/delete/get corpus — WITH explicit embedding model param
├── ingest.ts        # direct upload + (new) GCS batch :import for bulk backfills
├── retrieve.ts      # retrieveContexts (NEW — cheap search path)
├── generate.ts      # managed grounding + function-calling (existing logic moved)
└── errors.ts        # parseGoogleApiError
```

Key additions:
- `getRagEngineConfig()` / `setDeploymentMode()` / `setRagTier()` wrappers (`v1beta1 ragEngineConfig`, `PATCH` with `update_mask`). **Always read-back after write** — the guide's warning is right: a failed mode switch silently lands the next corpus in the wrong backend.
- `createCorpus(displayName, embeddingModel)` — embedding model becomes a **required** parameter (default `gemini-embedding-001`), never implicit again.
- `ragConfig` DB table gains columns: `deploymentMode`, `embeddingModel`, `corpusId` — so the app knows what it's actually running on.
- **No UI wiring for `UNPROVISIONED`.** Tier changes stay a manual, documented operator action.

### Phase 2 — Serverless migration (the money step)

Pre-flight (§6 checklist) → then:

1. `GET ragEngineConfig` — record current state (expect Spanner/Basic).
2. `PATCH deployment_mode: SERVERLESS`; **verify with read-back**.
3. Create new corpus with `gemini-embedding-001` (multilingual — Polish retrieval quality fix rides along for free).
4. Re-upload the document library through the existing admin upload flow (or GCS `:import` if the library has grown). Source documents must be re-uploadable — confirm we still hold the originals; the old corpus cannot export them.
5. Update `ragConfig` row → app now queries the new corpus. Old Spanner corpus stays untouched (hidden but safe) as rollback for a bake-in period.
6. Bake for 1–2 weeks: compare answer quality (same test-question set through `/admin/rag` test form), watch Billing.
7. Decommission: switch mode back to Spanner temporarily → delete old corpus → `PATCH rag_tier: UNPROVISIONED` (manual, console/curl — the irreversible step) → switch back to Serverless. Spanner line item goes to $0.
8. Confirm in Billing → Reports (Group by SKU): Cloud Spanner → $0; Vector Search/Agent Retrieval line appears with usage-based amounts.

Rollback at any point before step 7: flip `ragConfig` back to the old corpus + switch mode to Spanner.

### Phase 3 — Retrieval upgrades (optional, after migration)

- `retrieveContexts` with `vector_distance_threshold` (~0.3 start) + `similarity_top_k` for the admin search feature.
- Empty-retrieval guard: if `retrieveContexts` returns nothing above threshold, short-circuit with "not in knowledge base" **before** paying for generation.
- Ranking API two-stage retrieval only if quality measurements demand it.
- HyDE query expansion: **skip for now** — one extra LLM call per query against unproven need.

### Phase 4 — Observability & guardrails

- **Budget alerts** (Billing → Budgets): 50% / 90% thresholds — one-time setup, do it during Phase 2.
- Weekly billing checklist in `/admin/rag`: surface `usageMetadata` aggregates per feature (query vs tool vs lecture).
- Credits system from `RAG_CREDITS_PLAN.md` proceeds unchanged — it's the demand-side control; this plan is the supply-side one. With corrected pricing, 1,000 lifetime queries ≈ $2–3 (not $0.88) — still <2.5% of course revenue; allocations stay valid.
- TTS remains the dominant *variable* cost (unchanged analysis in `RAG_COST_SIMULATION.md`); the 10-lectures/month cap recommendation stands.

---

## 6. Pre-flight checklist before Phase 2

- [ ] Confirm Serverless mode availability + quota in `europe-west3` (`GET ragEngineConfig` in a test project, or docs region list). If unavailable in `europe-west3`, decide: wait vs move region (moving = new corpus anyway, but check Gemini + data-residency needs).
- [ ] Run corpus size + expected QPS through the Agent Retrieval pricing calculator; sanity-check the "$0 floor + small usage" assumption. Abort criteria: projected cost > current Spanner Basic.
- [ ] Verify we hold re-uploadable source copies of every document currently in the corpus (`listStoreDocuments` count vs local library).
- [ ] Confirm current billing reality in Billing → Reports (Group by SKU, Service = Cloud Spanner) — establishes the baseline number this plan saves.
- [ ] Check Preview terms (no SLA) are acceptable — mitigated by the rollback path in Phase 2.

## 7. Open questions / risks

| Risk | Mitigation |
|---|---|
| Serverless mode is Public Preview (no SLA, API may shift `v1beta1`) | Old corpus retained during bake-in; rollback is a config flip. Our REST-based client makes API tweaks cheap to absorb. |
| Agent Retrieval pricing not precisely public | Pre-flight calculator check with abort criteria; usage visible in our own project post-migration (unlike Spanner tenant billing). |
| Retrieval quality change (new embedding model + new backend) | Fixed test-question set through admin test form before/after; `gemini-embedding-001` is expected to *improve* Polish retrieval, but measure. |
| `UNPROVISIONED` is irreversible | Never wired to UI; manual operator step, last in sequence, after bake-in. |
| Thinking-off degrades a specific tool's output quality | Re-enable per-call with bounded `thinkingBudget`; measure per tool. |

## 8. Sources (official documentation)

- [Deployment modes in Vertex AI RAG Engine](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/deployment-modes)
- [Serverless mode](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/serverless-mode)
- [Switching between modes](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/switching-modes)
- [Managing Spanner mode](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/spanner-mode)
- [Understanding RagManagedDb](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/understanding-ragmanageddb)
- [RAG Engine billing](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-engine-billing)
- [Use embedding models with RAG Engine](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/use-embedding-models)
- [Agent Retrieval (formerly Vector Search 2.0)](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/vector-search-2/overview)
- [Ranking API](https://docs.cloud.google.com/generative-ai-app-builder/docs/ranking)
- [Vertex AI SDK migration guide (deprecation of @google-cloud/vertexai)](https://cloud.google.com/vertex-ai/generative-ai/docs/deprecations/genai-vertexai-sdk)
- [Gemini Developer API File Search (option B reference)](https://ai.google.dev/gemini-api/docs/file-search)
- [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

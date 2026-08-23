// ── Single source of truth for the memory layer ─────────────────────────────
// Anything the schema, retrieval, gate, and assembly all need to agree on lives
// here. Pure constants only — no 'server-only', no DB, no Vertex client — so the
// Drizzle schema (and drizzle-kit tooling) can import it without pulling in
// server-only runtime dependencies.
//
// Embedding settings are NOT here: EMBED_DIM and the model are platform-wide
// (the personal library uses the same space), so they live in
// @/constants/embeddings and neither layer owns them.

// Multi-tenant on single-tenant bones. Constant until a B2B tier arrives; kept
// so class/school scopes slot in later with zero schema change.
export const TENANT_ID = 'wolfmed'

// ── Retrieval fusion + tiers (Path B) ───────────────────────────────────────
// When both vector and lexical signals fire, fuse them; below the floor, drop.
export const FUSION_WEIGHTS = { vector: 0.4, lexical: 0.6 } as const
export const FUSED_SCORE_FLOOR = 0.4
export const TIER_THRESHOLDS = { high: 0.7, standard: 0.5 } as const
export type RetrievalTier = 'high' | 'standard' | 'low'

// ── Promotion gate thresholds (tune on real data) ───────────────────────────
export const GATE_THRESHOLDS = {
  fact: 0.7,
  preference: 0.5,
  // episodes: on completion only; policies: manual/admin only.
} as const

// ── Per-turn assembly budget ────────────────────────────────────────────────
// Reserved slots (policies, preferences) always in; ranked slots fill to this
// budget. ~4 chars/token estimate keeps us tokenizer-free.
export const ASSEMBLY_TOKEN_BUDGET = 1200
export const CHARS_PER_TOKEN = 4

// ── Retention (nightly cron) ────────────────────────────────────────────────
export const RETENTION = {
  traceDays: 90,
  revokedFactDays: 30,
  activeEpisodeDays: 180,
} as const

// ── Table names ─────────────────────────────────────────────────────────────
// createTable() prefixes 'wolfmed_', so these resolve to wolfmed_mem_*.
export const MEM_TABLES = {
  policies: 'mem_policies',
  preferences: 'mem_preferences',
  facts: 'mem_facts',
  episodes: 'mem_episodes',
  traces: 'mem_traces',
  deletionEvents: 'mem_deletion_events',
} as const

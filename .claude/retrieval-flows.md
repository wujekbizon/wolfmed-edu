# 🔎 Retrieval Flows

How a student's question reaches an answer, and how their notes and files get there
first. Rules live in `CLAUDE.md` (§ Retrieval rules); this is the shape of the system.

Names here are stable entry points. Signatures are not — read the file.

---

## 📥 Write path — how material becomes searchable

Two sources, one table. Both end in `lib_chunks` rows with a null embedding, filled
in afterwards.

```
NOTE                                   MATERIAL (PDF)
createNoteAction                       uploadMaterialAction
  │                                      │
  ├─ insert notes row                    ├─ storage quota (20 MB, every plan)
  │                                      ├─ insert materials row
  │                                      │    basic → index_status 'not_indexed'
  ▼                                      ▼
  premium?  ──no──▶ done                 premium?  ──no──▶ done
  │yes                                   │yes
  ├─ syncNoteChunks        (sync)        ├─ after(): syncMaterialChunks
  │    getLexicalContent → chunkText     │    ├─ Gemini reads the file  ← the cost
  │                                      │    ├─ extracted_text saved once
  │                                      │    └─ chunkText → lib_chunks
  ▼                                      ▼
  after(): embedPendingChunks(scope)     after(): embedPendingChunks(scope)
       └─ Vertex embeddings  ← the cost
```

**Why the split.** Chunk rows are Postgres and transactional with the write.
Embedding is a model call per batch, so it runs in `after()` — the note is saved
before it starts. Until embeddings land the chunk is still findable through the
trigram tier, so the delay costs ranking quality, not visibility.

**The backstop.** `/api/cron/library-index` (04:00 daily) re-runs extraction for
materials stuck at `pending` or `failed`, then embeds any chunk still missing a
vector. It exists for functions torn down mid-call, not as the main path — a daily
cron would leave a fresh upload unreadable for up to 24 hours.

**`embedding IS NULL` means "queued", and nothing else.** That is why a basic plan
writes no chunk rows at all rather than rows that would stay null forever.

**Terminal statuses** are never retried: `unindexable` (a video has no text layer)
and `not_indexed` (a basic-plan upload, deliberately never read). The cron selects
`pending` and `failed` by name, so terminal values are excluded by construction.

---

## 📤 Read path — how a question finds context

`retrieveContext` (`server/retrieval/context.ts`) is the single entry point. The
caller declares a mode; the mode decides everything below.

```
                        retrieveContext({ query, mode })
                                    │
        ┌───────────────────────────┴────────────────────────┐
        │ explicit_resource                                  │ canonical_*
        ▼                                                    ▼
  getAttachedSourceText                        query ─┬─────────────┐
  whole document, no chunking                         │             │
  no corpus, hasCanonical: true                  (as typed)   stripQueryFiller
        │                                             ▼             ▼
        │                                        CORPUS         LIBRARY
        │                                     retrieveContexts  retrieveLibrary
        │                                     Vertex, distance   vector + trigram
        │                                             │          → fuse()
        │                                             ▼             ▼
        │                                        isCorpusMiss   dropMissedSources
        │                                     best > 0.34?      per DOCUMENT,
        │                                     drop all          best < 0.6? drop
        │                                             └──────┬──────┘
        │                                                    ▼
        │                                        reserve 8 corpus slots
        │                                        cap personal at limit/3
        │                                        reciprocalRankFusion (by RANK)
        └────────────────────────────┬───────────────────────┘
                                     ▼
                            { chunks, sources, hasCanonical }
```

**Modes** (`RetrievalMode`) — a closed set, not independent flags:

| mode | corpus | personal | used by |
|---|---|---|---|
| `canonical_only` | yes | no | mind maps, AI tests, plain commands |
| `canonical_with_personal` | yes | yes | conversational tutor |
| `explicit_resource` | no | named source only | `@resource` |

**`explicit_resource` short-circuits before retrieval.** The student named the
source, so it is the answer's material — whole, not sampled. Chunking it here would
turn `@skrypt /podsumuj` into a summary of the three passages matching the word
"podsumuj". There is no `[retrieval]` log line for this path; that absence is the
test that it worked.

**Two gates, opposite directions.** Corpus is a Vertex *distance* (lower is better,
gate on the minimum); library is a similarity (higher is better, gate on the
maximum). The library gate runs **per document** — a tier-wide gate opens on one
relevant note and lets every unrelated file in behind it.

**Fusion is by rank.** The two tiers come from different embedding models, so their
scores share no scale. `reciprocalRankFusion` never compares them numerically.
Corpus takes reserved slots *before* fusion, because rank fusion alone lets a
personal chunk at rank 0 of a short list beat curriculum at rank 4 of a long one.

---

## 🖨️ Prompt path — how context becomes an answer

```
retrieveContext → formatContextChunks → buildGroundedPrompt → Gemini
                        │                       │                │
              origin label per chunk    NO_CANONICAL_NOTICE   stripContextCitations
              UNNUMBERED                when hasCanonical      strips leaked markers
                                        is false
```

**Origin labels weight sources; they are not citations.** `BAZA WIEDZY`,
`TWÓJ MATERIAŁ`, `TWOJA NOTATKA` tell the model how much authority a fragment
carries. The student reads the sources panel (`SourceChip`), never a marker in the
prose. Chunks go in unnumbered — a numbered list is an invitation to cite a number.

**`hasCanonical: false`** adds a notice: answer from the student's own material and
say so, rather than borrowing the curriculum's voice. It shapes attribution, never
refusal.

**`stripContextCitations` is the backstop, the prompt is the fix.** It matches an
origin label anywhere inside a bracket, in any wrapper — enumerating exact shapes
lost twice, as each ban pushed the marker into a new form.

---

## 💰 Cost boundary

| | basic | premium |
|---|---|---|
| create / edit / read notes | ✅ | ✅ |
| upload to 20 MB, preview, delete | ✅ | ✅ |
| PDF text extraction (Gemini) | ❌ | ✅ |
| chunks + embeddings, appears in AI answers | ❌ | ✅ |

The course is sold with notes and 20 MB of storage, so neither is blocked. What
premium buys is the **model calls**. A basic user's marginal cost is UploadThing
storage, Postgres and serverless — no Vertex, no Gemini.

**The gate is at the write path only** (`notes.ts`, `materials.ts`).
`embedPendingChunks()` with no scope — how the cron calls it — takes every chunk
with a null embedding regardless of owner. A third write path that skips the premium
check would leak cost silently.

**Upgrade** indexes a note the first time it is edited on premium. Older untouched
notes stay unindexed; there is no backfill, deliberately.

---

## 🧭 Reading the logs

```
[retrieval] "pytanie ucznia"
  personal query: "pytanie"        ← only when stripQueryFiller changed it
  corpus (12) · distance, lower better
  ✓ 0.162  corpus   01_fizjologia_komorki.md
  personal (2) · score, higher better
  ✓ 0.707  note     transport przez błonę
  selected 12
```

`✓` reached the model, `·` was retrieved and dropped. Gate decisions print their
own line with the number that triggered them. **Never compare a corpus number with
a personal one** — different models, opposite directions.

`logRetrievalScores` prints document titles on every request. Gate or remove it
before production.

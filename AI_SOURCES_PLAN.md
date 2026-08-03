# Wolfmed — AI data sources: the plan

A decision document. Read §1 and §6; the rest is why.

Revision 3. Revisions 1 and 2 are superseded — r2's cron-based ingestion was
wrong (§3.3) and its step order buried the only user-visible work last (§4).

---

## 1. What you are deciding

**Move materials from "attach the whole PDF on every request" to "ingest once at
upload," and make notes and materials searchable instead of `@`-only.**

What it costs: one new table, a chunker, one Gemini extraction call wired into
the upload flow, and a merge function. No new vendor, no new dependency, no
schema changes to `notes` or `materials` beyond one text column.

What you get:

- A student's PDF stops being re-uploaded to the model on every question. Today
  `fetchResourceContent` downloads the file and base64-encodes it *per request*.
- Notes and materials become searchable, not just attachable by exact name.
- One retrieval entry point instead of four.

What you are *not* deciding here: whether to keep materials at all. Keep them.
Students study from lecture PDFs and skrypty they did not write; notes-only means
retyping a 40-page skrypt before the AI can help, which nobody does.

---

## 2. The rule

Already in `CLAUDE.md`, unchanged. Four tiers: curriculum (the Vertex corpus),
personal library (notes + materials), attachments (`@resource`), and student
memory. The first three carry content; memory never does. The search query is the
subject alone. No source, no output.

Everything below is about making tier 2 real without breaking the others.

---

## 2b. The flow

`[exists]` is in the code today. `[NEW]` is what this plan builds.

### Getting content in

```
   NOTE SAVED  [exists]              MATERIAL UPLOADED  [exists]
        │                                     │
        │ Lexical JSON                        │ PDF → UploadThing
        ▼                                     │ (original kept, for download)
 getLexicalContent()  [exists]                ▼
        │                            materials row  [exists]
        │                                     │
        │                            ┌────────┴────────┐
        │                            │  JOB SYSTEM     │  [NEW wiring,
        │                            │  progress-store │   existing machinery]
        │                            │  + SSE progress │
        │                            │  Gemini extract │  "Przetwarzam PDF…"
        │                            └────────┬────────┘
        │                                     ▼
        │                            materials.extractedText  [NEW column]
        │                                     │
        └──────────────────┬──────────────────┘
                           ▼
                       chunk()  [NEW]   ~1000 chars
                           ▼
        ┌──────────────────────────────────────┐
        │  lib_chunks  [NEW TABLE]             │
        │  userId · sourceType · sourceId      │
        │  title · content · contentHash       │
        │  embedding = NULL  ◄─────────────────┼── findable NOW, by trigram
        └──────────────────────────────────────┘
                           │
                    lazy embed  [NEW]
                           ▼
                  UPDATE embedding
                           │
                           └──► also findable by meaning
```

Extraction is **not** on a cron. A material has no text until it runs, so a
nightly sweep would leave a PDF uploaded at 09:00 invisible until 03:30. Embedding
*is* lazy, because trigram already covers unembedded rows once text exists.

### Answering a question

```
                    student's question
                            │
                 parse: @attachment? /command?
                            │
              ┌─────────────┴─────────────┐
              │                           │
        @attachment                  no attachment
              │                           │
    that source is PRIMARY,               ▼
    corpus skipped  [exists]     retrieveContext()  [NEW]
              │                           │
              │              ┌────────────┴────────────┐
              │              ▼                         ▼
              │      Vertex corpus              lib_chunks
              │      curriculum,                WHERE userId = …
              │      everyone  [exists]         vector + trigram  [NEW]
              │              │                         │
              │        ranked list A            ranked list B
              │              └────────────┬────────────┘
              │                           ▼
              │                RECIPROCAL RANK FUSION  [NEW]
              │                  ranks, never scores
              │                           │
              └─────────────┬─────────────┘
                            ▼
                 chunks labelled by origin
             [curriculum] [your note] [your PDF]
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      /command  [exists]          plain question  [exists]
   tool generates test/           grounded answer
   plan/note/diagram              + sources panel
```

Memory appears in neither diagram on purpose: it shapes the tutor's tone in the
system instruction and never reaches a retrieval query.

### What dies

```
TODAY    every question  →  download PDF  →  base64  →  model
                            the whole file, every single time

AFTER    upload once     →  extract  →  chunk  →  embed
         every question  →  retrieve a few chunks  →  model
```

Same feature, paid for once instead of per question — and searchable rather than
reachable only by typing its exact name after `@`.

---

## 3. Architecture — the three decisions that matter

### 3.1 The personal library lives in your Postgres

`lib_chunks` in Neon with a `vector(768)` column, searched the same way
`mem_facts` already is.

**Not** a Vertex corpus per student: `createCorpus` polls a long-running
operation up to 30 × 3 s, which cannot sit on a signup or a first upload, and
`rag_config` is a single-row table whose helpers delete every row before
inserting — per-user corpora mean rewriting all of that.

**Not** one shared corpus with per-user metadata filters. That is the cheap-looking
option and the dangerous one: isolation would depend on a filter clause being
present on every retrieval call, and one path that forgets it serves one student's
notes to another silently. In Postgres it is `WHERE userId =` plus a foreign key
cascade — a deleted account takes its chunks with it, and `eraseUserMemory`
already establishes the erasure pattern to join.

You already have pgvector, `pg_trgm`, HNSW indexes, and `embed`/`embedQuery` with
timeouts and a lexical fallback. This decision adds no infrastructure.

### 3.2 Corpus and library results merge by rank, not by score

`createCorpus` sets `gemini-embedding-001` but never sets an output
dimensionality, so the corpus embeds at the model's default. The library
truncates to 768. **Different vector spaces — the cosine distances are not on a
comparable scale**, so `RAG_VECTOR_DISTANCE_THRESHOLD = 0.5` means nothing on the
library side and `FUSED_SCORE_FLOOR = 0.4` means nothing on the corpus side.

Sorting both lists by score would let whichever space produces tighter distances
dominate every answer, and it would look like a relevance result rather than a
units bug.

So: reciprocal rank fusion. Each chunk scores `1 / (k + rank)` summed across the
lists it appears in. Start `k` around 10 and tune — the conventional 60 is
calibrated for lists of hundreds, not twelve. Plus a cap so at most a third of
`RAG_TOP_K` comes from the library: the curriculum is the authority, the library
is context.

This survives a future change to either embedding model without recalibration,
which the alternative (re-embedding the whole corpus at 768 to make the numbers
match) does not.

### 3.3 Extraction happens at upload, embedding happens lazily

Revision 2 put both on a nightly cron. That was wrong, and it broke the feature
rather than merely slowing it.

**What exists today:** two Vercel crons, `cleanup-sessions` (08:00) and
`memory-retention` (03:30). Both are nightly *retention* jobs — deleting things
nobody is waiting for. Neither is a work queue. Two daily crons is also exactly
the Vercel Hobby ceiling (see §5).

**Why cron breaks materials specifically:** a note's text exists the moment it
saves, so trigram search finds it instantly and the embedding delay is invisible.
A material's text **does not exist until extraction runs**. On a nightly sweep, a
PDF uploaded at 09:00 is not "less well searched" until 03:30 — it is completely
invisible for eighteen hours.

**What to use instead:** the job system you already built. `progress-store.ts`
(Redis-backed) with `createJob` / `emitProgress` / `completeJob`, streamed over
SSE from `/api/rag/progress` — the same machinery that drives "Analizuję
zapytanie… / Przeszukuję bazę wiedzy…" during RAG generation. A student uploads a
PDF and watches it process. That UI already exists.

So:

| stage | when | why |
|---|---|---|
| extract PDF → text | at upload, via the job system | text must exist for the file to be findable at all |
| chunk → rows | same transaction as the source row | pure Postgres, fast, cannot desync |
| embed chunks | lazily | trigram covers the gap once text exists |
| cron | backstop only | retry rows whose extraction failed — retention-shaped, like the two you have |

**PDF text comes from Gemini, not a Node library.** You already send base64 PDFs
to Gemini and it reads them, so extraction is one call on a path already in
production. No new dependency, and scanned skrypty work — a multimodal model reads
the page as an image where `pdf-parse` returns nothing. UploadThing caps PDFs at
4 MB, so size is bounded.

---

## 4. The steps, in order

Reordered from revision 2, which put the only user-visible work last.

### Step 1 — Command chips and the count bug

Independent of everything else here, and the only step a student notices. The
tester's complaint can still reproduce: `executor.ts:190` silently defaults
`questionCount = 5`, and nothing validates the generated array length afterwards.

- Replace `/commands` with labelled chips built from `TOOL_COMMANDS`. Picking
  "Test" sets a mode; a number field sets the count. The number stops being prose
  an LLM has to recover, which is what makes "asked for 10, got 5" structurally
  impossible rather than a prompt instruction.
- Validate the output contract: asked for 10, got 7 → top up or say so. Never
  silently deliver 5.
- Keep slash as an accelerator, parsing into the same typed invocation so the two
  surfaces cannot drift.
- The settings toggle the tester asked for **already exists** —
  `SettingsModal.tsx:37`, "Komendy /", wired end to end. It sits under *Interfejs*;
  the tester expected it under *Nauka*. That is a placement fix, not a feature.

Ships alone. Nothing below depends on it.

### Step 2 — The chunk store and the note write path

`lib_chunks`: `chunkId`, `userId` (FK, cascade), `sourceType` (`note`|`material`),
`sourceId`, `title`, `position`, `content`, `contentHash`, `embedding`
(`vector(768)`, nullable), `createdAt`.

Indexes mirroring `mem_facts`: `(userId, sourceType)`, a GIN trigram index on
`content`, an HNSW index on `embedding`, plus a partial index on
`embedding IS NULL`.

On note save: derive text with the existing `getLexicalContent` helper — **not**
from `plainText`, which is a client-supplied hidden input and nullable — chunk it,
then **diff against the existing rows by `contentHash`**. Only changed chunks are
written; unchanged ones are left alone entirely, keeping their embeddings.

Diff rather than delete-and-replace, for two reasons. It avoids re-embedding a
whole note to fix one paragraph, and — see §5b — Neon bills instant restore per
GB of write history, so rewriting every 4 KB chunk row on every save costs real
money for no change in content.

Nothing reads these chunks yet. Reversible by dropping one table.

### Step 3 — Materials: extract at upload *(built and verified)*

Measured on a real `@material` request after this shipped: 5753 prompt tokens,
**all of them `modality: TEXT`** — no document tokens, so no PDF is being sent —
of which 5733 hit implicit context caching, and 6 output tokens on the dispatch
call. Base64 could never cache, because every request re-encoded the file.


Add `extractedText` to `materials`, plus a status (`pending` / `indexed` /
`unindexable` — the uploader also accepts MP4 and JSON, which yield no text).
Extraction runs through the job system per §3.3, then chunks into `lib_chunks`
through the same path Step 2 built.

**This is where the base64 cost dies.** `fetchResourceContent` returns stored text
instead of downloading and encoding the file — strictly cheaper on every
`@material` request, and available before unified retrieval exists.

### Step 4 — Unified retrieval

One entry point, sources as explicit flags:

```ts
retrieveContext({ userId, query, corpus: true, personal: true, attachments, limit })
```

Returns chunks carrying an `origin` of `'corpus' | 'note' | 'material'`, merged by
RRF per §3.2. The flags make the tier table in `CLAUDE.md` executable rather than
documentary — a feature that must not read the personal library says so at the
call site.

Migrates the four existing entry points (`rag-actions.ts`, `queryFileSearchOnly`,
`actions/aiTests.ts`, `lib/mindmap/generateTree.ts`) onto it. Prompt assembly
labels chunks by origin, so an answer built on your own note reads differently
from one built on the curriculum — which is what makes indexing half-written notes
safe.

---

## 5. Check these three things before starting

1. **Your Vercel plan.** Two crons, both daily, is exactly the Hobby ceiling. If
   you are on Hobby, the job-system route in §3.3 is not merely better — it is the
   only one available.
2. **The corpus embedding dimensionality.** One `getCorpus(storeName)` call. §3.2
   holds for any mismatch, but record the real number in `rag_config`, which
   already has an `embeddingModel` column waiting beside it.
3. ~~**Gemini extraction on one real scanned Polish skrypt.**~~ **Settled — it
   works.** An Adobe Scan of a signed form produced 11 clean chunks: Polish
   diacritics intact, checkbox states (`☑`), legal citations verbatim, email
   addresses and a URL read off the scan, and form fields kept next to their
   labels. A text-layer parser returns nothing at all for that file. This was the
   assumption the whole materials case rested on.

---

## 5b. What it costs

Neon does not charge for embeddings — it is Postgres hosting, and `pgvector` is a
free extension. Embedding *generation* is a Google cost you already pay for the
memory layer.

On the current Launch plan: **$0.35/GB-month storage, $0.20/GB-month instant
restore**, autoscale to 16 CU, scale to zero after 5 minutes, 500 GB transfer
included.

**Storage.** A chunk row is a 768-dim `float4` vector (3.0 KB) plus ~1 KB of text
plus ~0.3 KB of columns and overhead, and the HNSW index roughly doubles the
vector portion — call it 8-9 KB all-in per chunk. Rule of thumb: **a student who
fills their 20 MB upload quota generates roughly 16 MB of chunks and index**, so
about 1:1 with what they uploaded. A thousand such students is ~16 GB, ~$5.60 a
month. Most will not fill the quota.

**Instant restore is billed on write churn, not data size.** This is why Step 2
diffs by `contentHash` instead of delete-and-replace: rewriting every chunk of a
note to fix one paragraph generates history for content that did not change.
Check the configured restore window — it multiplies this directly.

**Compute.** Vector queries and index builds burn CU-hours. Scale-to-zero means
you only pay while students are active, which is another reason extraction runs
in the job system (§3.3) rather than on a frequent cron: a sweep would wake a
sleeping database on its own schedule to do work nobody is waiting for. The two
existing nightly crons are fine precisely because they run once a day.

**None of this is what decides the plan.** The cost this project removes is a
Gemini bill, not a Neon one — today a student asking six questions about one
skrypt base64-encodes and uploads that skrypt six times. Storage at $0.35/GB is
noise against that.

---

## 6. Honest assessment

**Verified in the code:** the 4 MB PDF cap and the MP4/JSON types; the base64
per-request path; `createCorpus` setting no output dimensionality; the pgvector /
trigram / HNSW cascade in `memory/retrieve.ts`; that `vectorSearch` skips NULL
embeddings; `rag_config` being single-row; both cron routes being nightly
retention; the Redis job system and its SSE route; `plainText` being
client-supplied while `getLexicalContent` runs server-side; the surviving
`questionCount = 5` default and missing length check.

**Not verified — general knowledge, not researched:** that row-level scoping beats
metadata filters for tenant isolation, that RRF is right for incomparable ranked
lists, that hybrid lexical+vector beats pure vector for inflected languages. These
are established patterns and I am reciting them, not citing them.

**Guesses:** every constant — chunk size, overlap, RRF `k`, the library slot cap,
the per-source chunk cap. All of them live in one config file so they can be tuned
against real data rather than argued about now. Also unmeasured: the token figures
for PDFs. The direction is not in doubt (the current path re-sends the whole
document every time); the magnitude is.

**If you want this smaller:** Step 1 alone is worth shipping and needs none of the
rest. Steps 2–4 are the actual project, and Step 4 is where the benefit becomes
visible to a student.

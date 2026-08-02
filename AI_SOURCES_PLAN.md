# Wolfmed — AI data sources: plan (revision 2)

Revision 1 established the rule and shipped Phase 0. This revision picks the
architecture for the personal library and revises the steps around it. The rule
itself does not change.

Status: the rule and Phase 0 are **done**. The architecture in §4 is **decided
but not built**. Steps in §5 are specced to the point of being implementable;
constants marked *tune* are first guesses that need real data.

An external review of revision 1 is folded in throughout; §8 records where each
suggestion landed, including the one place this revision argues against it.

---

## 1. What this revision changes

Five things, in descending order of how much they alter the plan.

1. **The personal library lives in Neon with pgvector, not in Vertex.** Revision 1
   implied this by proposing a table; it never argued the case against the
   alternative. §4.1 argues it, because the alternative looks cheaper right up
   until it isn't.
2. **The corpus and the personal library are two different vector spaces.**
   Their scores cannot be compared, so "merge the results" — revision 1's plan
   for unified retrieval — is not implementable as written. It has to be rank
   fusion. §4.2.
3. **PDF text extraction needs no library.** The app already hands base64 PDFs to
   Gemini on every `@material` request. Extraction is one Gemini call at upload
   time, which also solves scanned PDFs. §4.4. This removes the largest open
   question in revision 1 and most of the reason Step 2 stayed a sketch.
4. **Notes and materials are the same mechanism, not an easy case and a hard
   case.** Both become "write chunk rows synchronously, embed them out of band."
   The write path is §4.3; it is what lets Step 2 stop being scary.
5. **The steps re-split by capability instead of by content type.** Revision 1 cut
   them "notes, then materials"; this revision cuts them "storage and writes, then
   the sweep, then unified retrieval" — so notes still land first, but through the
   code materials will use. Unified retrieval moves from last to third. §5.

Revision 1 also cited commit `6182c56` for Phase 0. That hash is not in this
branch's history — the top commit is `f56d767`. The *work* is present and
verifiable (the data-sources section is in `CLAUDE.md`, all seven entries in
`constants/toolCommands.ts` carry `requiresSource`, `docs/` and `POST /api/mcp`
are gone), so the claim holds and only the hash is stale.

---

## 2. The rule

Unchanged, and now the canonical copy lives in `CLAUDE.md` under *Data Sources —
what the LLM may see*. Four tiers: curriculum, personal library, attachments,
memory. Three carry content; memory never does. The search query is the subject
and nothing else. No source, no output.

Everything below is about making tier 2 real without breaking tiers 1, 3 or 4.

---

## 3. Phase 0 — where it actually stands

Done and verified in the tree:

- The rule is in `CLAUDE.md`.
- All seven `/commands` carry `requiresSource`, and `rag-actions.ts` enforces it
  before the dispatch call — the check that stops a forced function call from
  inventing its own subject.
- `docs/` is gone, along with the MCP server, its `read` tool and `POST /api/mcp`.

One correction to revision 1's account: `GET /api/mcp/resources` still exists and
should. It is the autocomplete feed for `@resource`, it lists only the caller's
own notes and materials, and it serves names — never file contents. The route
that mattered was the one that served bodies, and that one is gone.

---

## 4. The architecture

Where this is going, so the sections below have something to hang on:

```text
                        student's question
                                │
                                │  subject only — no memory, no prose
                                ▼
                       retrieveContext()
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
      Vertex RAG corpus                 lib_chunks (Neon/pgvector)
      curriculum, global                personal library, WHERE userId = …
      embed dim: model default          embed dim: 768
              │                                   │
      ranked list A                       ranked list B
              └─────────────────┬─────────────────┘
                                ▼
                    reciprocal rank fusion
                    (ranks, never scores — §4.2)
                                │
                                ▼
                 chunks labelled by origin
              corpus │ your note │ your material
                                │
                                ▼
                               LLM
```

Attachments bypass the fusion entirely: an `@resource` is the primary source and
suppresses corpus retrieval, as it does today. Memory never enters this diagram —
it shapes tone in the system instruction and never reaches a retrieval query.

### 4.1 Where the personal library lives

Three options were real. The decision is the first.

**Chosen — Neon + pgvector, following the memory layer's pattern.** A
`lib_chunks` table with a `vector(768)` column and an HNSW index, searched by the
same hybrid cascade as `mem_facts`.

**Rejected — a Vertex RAG corpus per student.** `createCorpus` in
`server/vertex-rag/corpus.ts` polls a long-running operation up to thirty times
at three-second intervals. A provisioning step that can take a minute and a half
cannot sit on signup or on a student's first upload, and the surrounding
plumbing assumes exactly one corpus: `rag_config` is a single row, `setRagConfig`
deletes every row before inserting, and `getRagConfig` returns `[0]`. Per-user
corpora mean rewriting all of that to serve the case that scales worst.

**Rejected — one shared corpus with per-user metadata filters.** This is the
option that looks cheapest and is the most dangerous. Isolation would rest
entirely on a filter clause being present and correct on every retrieval call.
One code path that forgets it serves one student's notes to another, silently,
with no error and nothing in the logs. Compare the pgvector version, where
`scopeFor(userId)` is a `WHERE` clause on a table with a foreign key to
`users.userId` — a missing scope returns rows the query planner can be made to
refuse, and a deleted account takes its chunks with it by cascade.

The deciding arguments, in order:

- **Isolation is structural, not procedural.** `server/memory/retrieve.ts` already
  states the invariant — *scope BEFORE rank* — and enforces it in one place. The
  personal library is the same problem and should reuse the same answer.
- **Erasure already has a pattern.** `eraseUserMemory` wipes a student's memory in
  one transaction and logs a deletion event. Library chunks join that transaction
  as a hard delete (they carry no supersession FK, so nothing needs tombstoning).
  In Vertex, erasure is a separate API call against a Google-managed store that
  can fail without the transaction knowing.
- **The retrieval code exists.** `vectorSearch` / `trgmSearch` / `ilikeSearch` and
  the fusion in `memory/retrieve.ts` are 130 lines that already do exactly this
  against a user-scoped table. The library reuses the shape, not the code.
- **The failure modes are ones we can see.** A pgvector query that returns nothing
  is debuggable in Drizzle Studio. A Vertex retrieval that returns nothing because
  a filter was misspelled is a support ticket.

The cost of choosing this is that we write the chunker. That is roughly forty
lines, and §4.4 removes the part that would have been hard.

### 4.2 Two vector spaces — why "merge the results" cannot work

`createCorpus` sets the embedding model to `gemini-embedding-001` but never sets
an output dimensionality, so the corpus embeds at whatever that model produces by
default. The memory layer, and therefore the library, truncates to
`EMBED_DIM = 768` via Matryoshka. Different dimensionality means different
vectors, and cosine distances taken in the two spaces are not on a comparable
scale even though both are "cosine distance from gemini-embedding-001."

`RAG_VECTOR_DISTANCE_THRESHOLD = 0.5` is therefore calibrated for the corpus and
means nothing in the library, and `FUSED_SCORE_FLOOR = 0.4` is the reverse. A
merge that sorts both lists by score would let whichever space happens to produce
tighter distances dominate every answer, and the bias would look like a relevance
result rather than a units bug.

**So the merge is rank-based.** Reciprocal rank fusion over the two ordered
lists: each chunk scores `1 / (k + rank)` summed across the lists it appears in,
and the merged list is sorted by that. RRF's usual `k = 60` is calibrated for
lists of hundreds; against lists of about twelve it flattens everything, so start
around `k = 10` and *tune*.

Two guards on top of the fusion:

- **A floor on the personal side, in its own units.** A weak note should not
  displace a strong curriculum chunk merely by being rank 1 of a bad list.
- **A cap on personal slots.** Out of `RAG_TOP_K = 12`, at most a third from the
  library unless the student attached something explicitly. The curriculum is the
  authority; the library is context.

Attachments are unaffected: an `@resource` is already the primary source and
already suppresses corpus retrieval in `rag-actions.ts`. That behaviour stays.

There is a tempting alternative — recreate the corpus at 768 dimensions so the
spaces match and scores merge directly. It is not worth it. Re-embedding the
whole corpus to make two numbers comparable buys one simpler function, and rank
fusion is more robust anyway: it survives a future change to either side's
embedding model without recalibration.

### 4.3 The write path — rows now, embeddings later

Embedding on the request path is not viable. `EMBED_TIMEOUT_MS` is 1500, a note
chunks into several pieces, and `createNoteAction` is a server action the student
waits on. Five sequential embeddings is a note save that takes seven seconds in
the bad case, and revision 1's "embed each one while it saves" would have shipped
exactly that.

The write path splits in two:

**Synchronous, inside the existing transaction.** Derive plain text, chunk it,
delete the source's old rows, insert the new ones with `embedding` left NULL.
This is pure Postgres — fast, transactional with the note or material row, and it
cannot fail in a way that leaves the library disagreeing with the source.

**Asynchronous, on a sweep.** A cron route selects rows where
`embedding IS NULL`, embeds them in batches, and writes the vectors back.
`vercel.json` already runs two crons and `@upstash/redis` is already a
dependency, so this needs no new infrastructure — it is the same mechanism as
`/api/cron/memory-retention`, pointed at a different table.

The elegant consequence, and the reason this shape is right rather than merely
acceptable: **the hybrid cascade makes the delay invisible.** A chunk with a NULL
embedding is skipped by `vectorSearch` (which already filters
`isNotNull(embedding)`) but is fully visible to `trgmSearch` and `ilikeSearch`. A
note saved thirty seconds ago is findable by its words immediately, and becomes
findable by meaning when the sweep catches up. There is no "processing…" state to
build, no status field to display, and no empty-result window to explain.

That same property is what makes Polish medical vocabulary work at all here.
Trigram similarity catches inflected forms and near-spellings that a 768-dim
truncated embedding blurs, which is why `memory/retrieve.ts` weights lexical
above vector (`0.6` / `0.4`). The library inherits that weighting and the same
`EmbeddingUnavailable` cascade, so an embedding outage degrades search instead of
returning a 500.

Materials that cannot yield text — the uploader accepts `video/mp4` and
`application/json` alongside PDFs, which revision 1 did not account for — get an
explicit terminal state rather than sitting in the sweep forever. A `status`
column on the *source* side (`pending` / `indexed` / `unindexable`) covers it,
and `@material` on an unindexable file keeps today's behaviour.

### 4.4 PDF text — Gemini, not a Node library

Revision 1 treated "which text-extraction library suits this runtime" as the
question that kept materials in sketch form. It is not a question we have to
answer, because the app already reads PDFs with Gemini: `fetchResourceContent`
downloads the file, base64-encodes it, and `executeToolWithContent` pushes it as
`inlineData`. That path works today.

So extraction is one Gemini call at upload time, storing the text, and never
sending base64 again. This is strictly better than a Node library on three counts:

- **Scanned PDFs work.** Revision 1 listed them as unsolvable — "no text layer and
  yield nothing." A multimodal model reads the page as an image. It is not perfect,
  but it is not nothing, which is what `pdf-parse` returns.
- **No new dependency, no runtime question.** No native bindings, no worker
  threads, no bundling decisions on Vercel.
- **Size is already bounded.** `app/api/uploadthing/core.ts` caps PDFs at 4 MB,
  comfortably inside inline-data limits. The "files too large to process during a
  request" concern was real for an unbounded uploader and is not real for this one.

The cost is one Flash-Lite call per uploaded PDF, once, against a per-question
saving on every subsequent use. Revision 1 estimated that saving at roughly 25 000
tokens down to roughly 2 000 per question; those figures are still unverified, but
the direction is not in doubt — the current path re-sends the entire document on
every single request.

Where the call goes: the sweep, not the upload action. Same reasoning as §4.3, and
it means extraction and embedding share one retry story instead of two.

### 4.5 Module shape

```
src/server/library/
  config.ts       chunk size, overlap, slot caps, RRF k, table names
  chunk.ts        text → chunks (pure, testable, no I/O)
  index-source.ts write path: derive text, chunk, replace rows
  extract.ts      PDF → text via Gemini (called by the sweep)
  retrieve.ts     hybrid cascade over lib_chunks, user-scoped
  erase.ts        joins eraseUserMemory's transaction
src/server/db/library-schema.ts   re-exported from schema.ts, as memory-schema is
src/server/retrieval/context.ts   the unified entry point (§5, Step 3)
```

`config.ts` follows `server/memory/config.ts`: pure constants, no `server-only`,
no imports that would stop the Drizzle schema reading it. **Every knob in §5 lives
there** — chunk size, overlap, the per-source cap, RRF `k`, the personal-slot cap,
the sweep batch size. None of them are literals at their use sites, for the same
reason `RAG_TOP_K` is not: retrieval quality is tuned by changing one file and
re-measuring, and a constant inlined in a query is a constant nobody tunes.

One preparatory move. `EMBED_DIM` is defined in `server/memory/config.ts` under a
comment declaring it the only place `768` may appear, and `embed()` /
`EmbeddingUnavailable` live in `server/memory/embeddings.ts`. Both are
platform-wide concerns, not memory's property, and a library module importing
them from `@/server/memory` gets the dependency backwards. Hoist the constants to
`src/constants/embeddings.ts` and the client to `src/server/embeddings.ts`. This
is cheap: only two files outside `server/memory/` import from `memory/config`, and
nothing outside imports `memory/embeddings`. Do it before Step 1, as its own
commit, so the diff stays a move.

---

## 5. The steps

### Step 1 — the chunk store and the write path

Revision 1 cut the steps by content type: notes, then materials. This cuts them by
capability, because §4.3 and §4.4 leave the two content types differing only in
where their text comes from. Notes have theirs already, so they are searchable at
the end of this step; materials need the extraction call, which is Step 2.

**`lib_chunks`**

| column | purpose |
|---|---|
| `chunkId` | primary key |
| `userId` | scope; FK to `users.userId`, cascade delete |
| `sourceType` | `'note'` \| `'material'` |
| `sourceId` | the note or material id |
| `title` | so a result can name its origin |
| `position` | order within the source |
| `content` | ~1 000 characters, ~150 overlap (*tune*) |
| `contentHash` | so an edit re-embeds only what changed |
| `embedding` | `vector(768)`, nullable — NULL means "not swept yet" |
| `createdAt` | |

Indexes mirroring `mem_facts`: `(userId, sourceType)` for scope, a GIN trigram
index on `content`, an HNSW index on `embedding`. Plus a partial index on
`embedding IS NULL` so the sweep's driving query stays cheap as the table grows.

Notes derive their text from the Lexical JSON in `content` via the existing
`getLexicalContent` helper — **not** from `plainText`, which is a client-supplied
hidden input and nullable. `server/schema.ts` already uses the helper this way.

A per-source chunk cap (*tune*: 400) stops one 4 MB PDF from becoming thousands
of rows. Storage quota does not change; see §7.

**Re-indexing is delete-and-replace, with one refinement.** Rewriting every chunk
on every save is correct and simple, and for a note it costs nothing — the
synchronous half is pure Postgres. What it *would* waste is embeddings, since
fixing a typo in paragraph one would re-embed the whole note on the next sweep.
So the write path compares the new chunks' `contentHash` against the existing
rows' and carries the embedding across where the hash matches. Unchanged chunks
keep their vectors and never re-enter the sweep. `mem_facts` already uses
`contentHash` for exactly this kind of dedup, so the pattern is established;
`chunk.ts` staying pure and deterministic is what makes the hashes stable.

**Nothing reads these chunks yet.** `@notatka` and `@material` keep working
exactly as they do today. Reversible by dropping one table.

### Step 2 — the sweep: embeddings, and PDF text

`/api/cron/library-index`, alongside the two existing crons. Each run: extract
text for materials in `pending`, chunk them, then embed a bounded batch of NULL
rows across both source types. Bounded so a run cannot exceed the function
timeout; the next run picks up the rest.

Step 1 is genuinely useful without this — trigram search already covers unembedded
rows, so notes are findable by their words the moment they save — which is what
makes it safe to ship the two separately rather than merely convenient.

### Step 3 — unified retrieval

One entry point, with the sources as explicit flags rather than an options blob:

```ts
retrieveContext({
  userId,
  query,          // the subject alone, always
  corpus: true,
  personal: true,
  attachments: [],
  limit: RAG_TOP_K,
})
```

It returns chunks that each carry an `origin` of `'corpus' | 'note' | 'material'`,
merged by RRF per §4.2.

The flags are the point, and they come from the review. They make the tier table
in `CLAUDE.md` executable instead of documentary: the mind map's row in that table
*is* `{ corpus: true, personal: true, attachments, memory: never }`, and a feature
that should not read the personal library says so at the call site where a reviewer
will see it. An options bag hides that in a default.

Revision 1 put this step last. It belongs here, because the alternative is writing
the personal-library search once as a standalone function and then rewriting its
call sites when the unified version lands. The corpus half already exists
(`retrieveCorpusContext`), so the unified function is thin from the start.

The three existing callers — `rag-actions.ts`, `actions/aiTests.ts`,
`lib/mindmap/generateTree.ts` — migrate to it here. `retrieveCorpusContext` stays
as the corpus-only primitive underneath; it does not gain a second job.

This is also where `@material` stops sending base64: with chunks available, the
attachment path retrieves from `lib_chunks` scoped to that one `sourceId`
instead of downloading and encoding the file.

Prompt assembly labels chunks by origin, which is what answers the "are notes
trustworthy" question in §7 — the model and the sources panel both see whether a
claim came from the curriculum or from the student's own words.

### Step 4 — memory boundary and command buttons

Unchanged from revision 1, and independent of everything above. Generators get no
memory. The tutor keeps preferences for tone. `/commands` become labelled chips
built from `TOOL_COMMANDS`, where picking "Test" sets a mode and a number field
sets the question count — which makes "asked for 10, got 5" structurally
impossible instead of a prompt instruction the model may ignore.

---

## 6. Defects found while specifying this

Not part of the plan, but found in the code the plan touches, and each one
undercuts the rule the plan exists to enforce.

**The empty-retrieval fallback reintroduces the diluted query.** In
`queryFileSearchOnly`, when disciplined retrieval returns nothing, the code falls
back to managed grounding with `enhanceUserQuery(question)` — the full prose
question wrapped in *more* prose about desired answer format, handed to the same
corpus. That is the maximally diluted query, used at exactly the moment the
disciplined one already failed. Two lines below it, a comment correctly explains
why inline context makes the retrieval tool unnecessary. The fallback should
either search again with the bare subject or return the no-data message.

**"No source, no output" is not enforced on the tutor path.** `/commands` are
guarded by `requiresSource`. The conversational path is not: when retrieval is
empty it hands the model a grounding tool and a prose question, and the only thing
standing between that and an answer from pretraining is rule 3 of `SYSTEM_PROMPT`.
Prompt instructions are not a guard.

**The two paths disagree about which source is primary.** `SYSTEM_PROMPT` and
`executeToolWithContent` both put the student's attachment first.
`buildGroundedPrompt` puts the corpus first and the attachment second. One of them
is wrong; the tool path matches the stated hierarchy.

**`resolveDisplayNameToUri` duplicates `GET /api/mcp/resources`.** Same two
queries, same two `.map()` calls building the same `Resource[]`, in
`actions/rag-actions.ts` and `app/api/mcp/resources/route.ts`. One helper in
`/src/helpers`, both call it.

---

## 7. Open decisions — answered

**Are notes searchable, or attachment-only?** Searchable. The concern was that a
half-written note surfaces as though it were fact; the `origin` discriminator in
§5 Step 3 handles it directly. Chunks are labelled at assembly, an answer sourced
from a note reads visibly differently from one sourced from the curriculum, and
the sources panel shows which. No per-note toggle — a setting nobody changes is
not a safety mechanism.

**Does the storage quota change?** No, and the reason is sharper than revision 1's.
The quota measures what the student uploaded and can delete. Chunks and vectors
are the platform's cost of serving them, not the student's allowance, and
reporting a 2 MB upload as 3 MB used reads as a bug because it is one. The real
control is the per-source chunk cap in Step 1.

**What backs the personal library?** Neon and pgvector. §4.1.

**How do corpus and personal results combine?** Rank fusion, not score merge.
§4.2. This was not an open question in revision 1 because the problem had not been
noticed.

---

## 8. Response to the external review

The review approved Phase 0 and Step 1 and made five suggestions. Four are adopted;
one rests on a premise the codebase contradicts.

**Adopted — make chunk size configurable.** §4.5. Extended past chunk size to
every retrieval knob, on the reviewer's underlying reasoning: a value that will be
tuned against real usage should never be a literal at its use site.

**Adopted — leave room for incremental re-indexing.** §5 Step 1, via `contentHash`.
The reviewer scoped this to "if notes become significantly larger later," but the
cost of building it now is one column and one comparison, and it becomes the
difference between a typo fix costing one embedding and costing forty once
materials land.

**Adopted, and promoted — introduce the retrieval interface early.** §5 Step 3,
using the reviewer's flag-based shape over the options object this revision had.
Moved from last to third.

**Adopted — keep notes searchable, labelled as the student's own.** §7. This
revision reaches the same answer by a different route: the `origin` discriminator
that rank fusion needs anyway is also what carries the label, so "From your notes"
falls out of the retrieval design rather than being bolted onto the prompt.

**Already load-bearing, not deferred — hybrid retrieval.** The review lists
lexical matching as a possible later improvement over pure vector search. It is in
the design from day one, and not for ranking quality: the trigram tier is what
makes a just-saved note findable before the embedding sweep runs (§4.3), and what
keeps search alive when `EmbeddingUnavailable` fires. Without it, Step 1 would need
a "processing…" state. Of the reviewer's specific ideas, **title matching is worth
adding** — `lib_chunks.title` is already there and a student searching for a note's
title is searching for the note. Recency weighting is not: the newest note is not
the most relevant one, and study material does not decay.

**Argued against — defer PDFs to keep Step 1 small.** The review praises Step 1 for
validating the pipeline on notes rather than "solving PDF extraction, OCR,
background jobs, storage, and retrieval simultaneously." That reasoning is right,
and the premise is wrong: PDF extraction is not an unsolved problem here, because
the app already reads PDFs with Gemini on every `@material` request (§4.4). Once
extraction is one call to a path already in production, notes and materials differ
only in where their text comes from, and building two mechanisms to keep them
apart costs more than building one.

The incrementalism the review is protecting is preserved, in sequence rather than
in architecture. Step 1 ships the table and the write path, and notes are
searchable at the end of it — their text is already in the database. Materials
need the sweep, which is Step 2. So notes still land first and still validate
chunking, indexing and search on the easy content type; they just do it through
the code materials will use, instead of through code that would be replaced.

---

## 9. Confidence

**Verified in the codebase:** `materials` accepts PDF, MP4 and JSON with a 4 MB
PDF cap (`api/uploadthing/core.ts`); the 20 MB quota logic in `actions/materials.ts`;
`embedDocument` / `embedQuery` at 768 dimensions via `outputDimensionality`;
`createCorpus` sets an embedding model but no output dimensionality; the
`cosineDistance` cascade and HNSW indexes in `memory/retrieve.ts`; that
`vectorSearch` filters `isNotNull(embedding)`; `createCorpus`'s 30 × 3 s polling
loop; `rag_config` being a single-row table; two crons in `vercel.json` and
Upstash Redis in `progress-store.ts`; that no PDF library is installed; that
`plainText` is a client-supplied hidden input while `getLexicalContent` runs
server-side; the four defects in §6.

**Inferred, and worth one command before building:** that the corpus therefore
embeds at the model's default dimensionality rather than 768. The conclusion in
§4.2 — that the two spaces are not score-comparable — holds for *any* mismatch,
so the architecture does not depend on the exact number, but confirm it against
the live corpus with `getCorpus(storeName)` and record it in `rag_config`
alongside `embeddingModel`, which already has a column waiting for it.

**Unverified assumptions:** every token and timing figure quoted for PDFs,
inherited from revision 1 and still unmeasured; the quality of Gemini extraction
on a scanned Polish medical PDF, which needs one real file tried before Step 2 is
committed to; and every constant marked *tune* — chunk size, overlap, RRF `k`,
the personal-slot cap, the per-source chunk cap. None of them are load-bearing for
the architecture; all of them need real data.

# Building a Vertex AI RAG Agent in Next.js — Mechanics Guide

This walks through the same architecture as a Python/ADK RAG agent, but rebuilt for a Next.js/TypeScript backend (API routes / Server Actions). Every step has two parts: **why this stage exists in a RAG pipeline** (mechanics) and **how to wire it up in Next.js**.

Stack assumption: Next.js 14+ (App Router), TypeScript, calling Vertex AI over its REST API via `google-auth-library` for the pieces that don't have first-class Node SDK coverage yet, and `@google/genai` (`vertexai: true`) for generation — both authenticate via Application Default Credentials, no API key involved anywhere.

---

## 1. Why a "corpus" exists at all

**Mechanics:** A RAG corpus is not your data — it's an *index over* your data. When you "create a corpus," you're really provisioning three things bundled together: a storage pointer (where your source files live, e.g. GCS), an embedding model binding (locked at creation time — you cannot swap embedding models on an existing corpus without rebuilding it), and a vector index backend (Spanner-based `RagManagedDb` by default). The corpus is the unit that groups all downstream config — chunk size, chunking strategy, retrieval parameters — so that every file imported into it gets processed identically. This matters for you specifically: if you create separate corpora for "pharmacology," "genetics," "hospital infections," each can have different chunk sizes tuned to that content, but you lose the ability to do a single cross-topic retrieval call — you'd need to fan out to multiple corpora and merge results yourself.

**Next.js implementation:**

Corpus management (create/list/delete) isn't yet exposed through a mature Node client library the way it is in the Python `vertexai.preview.rag` module — so you call the REST API directly with an authenticated client.

```typescript
// lib/vertex-rag/client.ts
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT!;
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION!;
const BASE = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT}/locations/${LOCATION}`;

async function ragFetch(path: string, init?: RequestInit) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token.token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Vertex RAG API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function createCorpus(displayName: string, embeddingModel: string) {
  return ragFetch('/ragCorpora', {
    method: 'POST',
    body: JSON.stringify({
      display_name: displayName,
      rag_embedding_model_config: {
        vertex_prediction_endpoint: {
          publisher_model: `publishers/google/models/${embeddingModel}`,
        },
      },
    }),
  });
}
```

Why REST-and-auth rather than a wrapper library: it keeps you unblocked on preview features Google adds to the Python SDK first, and it's the same pattern you'll reuse for every other RAG Engine call below.

---

## 2. Ingestion — getting files into the corpus

**Mechanics:** Import is asynchronous and idempotent by content hash. Vertex hashes each file by content + path + filename; if you re-import an unchanged file, it's skipped (`skipped_rag_files_count` in the response tells you how many). This means your ingestion pipeline can be "dumb" — just re-run the whole import on every deploy — without re-processing (and re-billing) unchanged content. The chunking configuration is attached to the import call, not the corpus, so you *can* re-chunk by re-importing with new `chunk_size`/`chunk_overlap` values, but only unchanged-content files get skipped; changing chunk config invalidates that skip.

**Next.js implementation:**

```typescript
// lib/vertex-rag/ingest.ts
export async function importFiles(corpusId: string, gcsUris: string[]) {
  return ragFetch(`/ragCorpora/${corpusId}/ragFiles:import`, {
    method: 'POST',
    body: JSON.stringify({
      import_rag_files_config: {
        gcs_source: { uris: gcsUris },
        rag_file_chunking_config: {
          fixed_length_chunking: { chunk_size: 512, chunk_overlap: 100 },
        },
      },
    }),
  });
}
```

For your Wolfmed use case (books split under 1MB, plain text), skip the layout/LLM parser entirely — the digital parser is free and sufficient once you've pre-converted PDFs to clean text/Markdown per chapter, which you're already doing.

Trigger this from an API route so your admin UI can kick off imports on demand:

```typescript
// app/api/rag/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { importFiles } from '@/lib/vertex-rag/ingest';

export async function POST(req: NextRequest) {
  const { corpusId, gcsUris } = await req.json();
  const result = await importFiles(corpusId, gcsUris);
  return NextResponse.json(result);
}
```

Import is a long-running operation — the response is an operation name, not a completed result. Poll it or, better, have the route return immediately and let your admin UI poll `operations.get` for status, since import of many files can take minutes.

---

## 2b. Direct file upload — the alternative to GCS import

**Mechanics:** The `:import` endpoint in step 2 assumes your files already live in Cloud Storage. If your admin UI instead accepts a file straight from a browser upload, staging it to GCS first is an extra hop you don't need — Vertex RAG Engine also exposes a direct `ragFiles:upload` endpoint that takes the file bytes in the request body itself. This is **synchronous**, unlike `:import` — no operation to poll, you get the result back on the same request. The trade-off is that it uses a different base path (`upload/v1` instead of `v1`) and requires a `multipart/form-data` body with two parts: a JSON metadata part (the file's display name and any RAG-specific config) and the raw file bytes part. This is the RAG-Engine equivalent of `ai.fileSearchStores.uploadToFileSearchStore()`, which only exists on the Gemini Developer API side — RAG Engine doesn't have a one-line SDK method for it, so you build the multipart body by hand.

The header that trips people up here is `Content-Disposition` on the file part — omit it and the upload can fail silently (the request succeeds at the HTTP level but the file never actually attaches to the corpus), because the server has no `filename` to key the upload to.

**Next.js implementation:**

```typescript
// lib/vertex-rag/upload.ts
async function getAccessToken(): Promise<string> {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) throw new Error('Failed to obtain access token from ADC');
  return tokenResponse.token;
}

export async function uploadFileDirect(
  corpusName: string, // full resource name: projects/{p}/locations/{l}/ragCorpora/{id}
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
) {
  const token = await getAccessToken();
  const boundary = `rag_upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const url = `https://${LOCATION}-aiplatform.googleapis.com/upload/v1/${corpusName}/ragFiles:upload`;

  const metadataPart =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="metadata"\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify({ rag_file: { display_name: fileName } })}\r\n`;

  const filePartHeader =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`;

  const body = Buffer.concat([
    Buffer.from(metadataPart, 'utf-8'),
    Buffer.from(filePartHeader, 'utf-8'),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--`, 'utf-8'),
  ]);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'X-Goog-Upload-Protocol': 'multipart',
    },
    body,
  });
  if (!res.ok) throw new Error(`Vertex AI upload error (${res.status}): ${await res.text()}`);
  return res.json();
}
```

Use this when your admin UI takes files directly from a `<input type="file">` and you want them in the corpus without a GCS staging bucket in between. Use step 2's `:import` instead when you're bulk-loading a folder of files you've already staged in Cloud Storage — it's the better fit for a one-time backfill of your whole book library, since it batches many files into a single call rather than looping one `uploadFileDirect` call per file.

---

## 3. Chunking strategy — the decision that actually moves retrieval quality

**Mechanics:** Chunk size trades off two failure modes. Too small (e.g. 128 tokens) and a chunk loses surrounding context — a definition gets separated from the term it defines, a dosage number gets separated from the drug it applies to. Too large (e.g. 2000 tokens) and irrelevant text dilutes the embedding, so semantically-close-but-not-quite-matching chunks start out-competing the genuinely relevant one in similarity search. Overlap (e.g. 100 tokens between consecutive chunks) exists specifically to stop a sentence from being severed exactly at a chunk boundary — without it, a fact split across the boundary becomes retrievable by neither chunk's embedding. For structured medical/exam content like yours, chunking on semantic boundaries (per question, per definition, per topic section) beats fixed-length chunking, which is why pre-converting to Markdown with headings before ingest is worth the effort — it lets you chunk consistently rather than at arbitrary character counts.

**Next.js implementation** — if you want fixed-length chunking done client-side before upload (useful when you want deterministic control rather than trusting the server-side chunker):

```typescript
// lib/chunking.ts
export function chunkText(text: string, chunkSize = 512, overlap = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(' '));
    start += chunkSize - overlap; // step forward by (size - overlap), not by size
    if (end === words.length) break;
  }
  return chunks;
}
```

Stepping forward by `chunkSize - overlap` rather than `chunkSize` is what actually produces the overlap — a common off-by-one bug is stepping by the full chunk size and getting no overlap at all despite setting the parameter.

---

## 4. Retrieval — turning a question into a similarity search

**Mechanics:** At query time, your question text gets embedded with the *same* embedding model the corpus was built with (this is why the model is locked to the corpus — mismatched embedding spaces produce meaningless similarity scores). The vector index then returns the `top_k` nearest chunks by cosine similarity. Two retrieval algorithms exist: KNN (exact nearest-neighbor, perfect recall, but latency grows with corpus size) and ANN (approximate, faster at scale, still Preview and requires an index rebuild + allowlisting). For a corpus under ~10,000 files — which covers your nursing question bank comfortably — KNN default is fine and you don't need to think about this further.

**Next.js implementation:**

```typescript
// lib/vertex-rag/retrieve.ts
export async function retrieveContexts(corpusId: string, query: string, topK = 5) {
  return ragFetch(`:retrieveContexts`, {
    method: 'POST',
    body: JSON.stringify({
      vertex_rag_store: {
        rag_resources: [{ rag_corpus: `projects/${PROJECT}/locations/${LOCATION}/ragCorpora/${corpusId}` }],
        vector_distance_threshold: 0.3, // filters out weak matches, not just top-k truncation
      },
      query: { text: query, similarity_top_k: topK },
    }),
  });
}
```

Note `retrieveContexts` alone doesn't invoke an LLM — this call only costs you an embedding + vector search, not generation. That's useful for you: you can expose a "search my question bank" feature in the admin UI that's much cheaper than a full grounded-answer feature, because it skips the generation step entirely.

`vector_distance_threshold` matters separately from `top_k`: `top_k` says "give me the 5 closest," but if none of them are actually close, you still get 5 weak matches. The threshold discards matches below a similarity floor, which is what prevents low-relevance chunks from padding your prompt with noise.

---

## 5. Reranking — the two-stage retrieval pattern

**Mechanics:** Embedding-based retrieval is fast but coarse — it's optimized to *not miss* relevant chunks (high recall), not to perfectly order them (precision). Reranking re-scores the top-N candidates from vector search using a model built specifically for relevance ranking, which is a different (and more expensive) computation than embedding similarity. The pattern is: retrieve broad (e.g. top 10 via fast vector search), rerank down to precise (e.g. top 3), then only those top 3 go into the generation prompt. Skipping reranking and just cranking up `similarity_top_k` doesn't get you the same effect — it gives the LLM more text to sift through itself, which burns more input tokens and is exactly the "lost in the middle" problem reranking exists to solve: LLMs attend less reliably to information buried in the middle of a long context than to information at the start or end.

**Next.js implementation:**

```typescript
// lib/vertex-rag/rerank.ts
export async function rerank(query: string, candidates: string[], topN = 3) {
  return ragFetch('/publishers/google/models/semantic-ranker-512@latest:rank', {
    method: 'POST',
    body: JSON.stringify({
      query,
      records: candidates.map((text, i) => ({ id: String(i), content: text })),
      topN,
    }),
  });
}
```

Use this on anything user-facing. For your internal question-bank-building workflow it's optional — you likely already know which source chunk you want when generating distractors — but for a future "student asks a question, get a grounded answer" feature on Wolfmed, this is the step that most improves perceived quality relative to its cost.

---

## 6. Query transformation — improving the question before you search with it

**Mechanics:** Raw user questions are often bad search queries. A student typing "why does insulin drop potassium" is phrased as a causal question, but the textbook chunk that answers it is phrased declaratively ("Insulin promotes intracellular potassium uptake via Na+/K+-ATPase..."). Embedding similarity is sensitive to phrasing, not just meaning, so a mismatch in *how* something is said can lose real hits even when the meaning matches. HyDE (Hypothetical Document Embeddings) works around this by having an LLM first generate a hypothetical *answer* to the question, then embedding and searching with that generated answer instead of the raw question — because a generated answer is phrased more like the textbook prose you're searching against than a question is. This costs one extra LLM call per query, which is why it's worth reserving for cases where plain retrieval measurably underperforms, rather than applying it to every query by default.

**Next.js implementation:**

```typescript
// lib/vertex-rag/hyde.ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

export async function hydeExpand(question: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Write a short, factual passage (2-3 sentences) that would answer this question, ` +
      `as if it were an excerpt from a medical textbook: "${question}"`,
  });
  return response.text ?? question;
}
```

`vertexai: true` is what tells the unified SDK to hit the Vertex backend and authenticate via ADC instead of the Gemini Developer API's key-based auth — same credential chain the REST calls in step 1 use under the hood via `GoogleAuth`. One thing worth pinning explicitly in production: set `vertexai: true` directly in code rather than relying only on the `GOOGLE_GENAI_USE_VERTEXAI` env var, so an environment misconfiguration can't silently reroute a call to the wrong backend or pick up a leaked `GOOGLE_API_KEY` meant for something else.

Then feed the *output* of this into `retrieveContexts` in step 4 instead of the raw question.

---

## 7. Generation — constructing the grounded prompt

**Mechanics:** "Grounded generation" just means: retrieved chunks go into the prompt as context, and the prompt explicitly instructs the model to answer only from that context. The mechanical reason this reduces hallucination isn't magic — it's that the model's most probable continuation, given a prompt that contains the answer text right above the question, is to reproduce/paraphrase that text rather than fall back on parametric (training-data) knowledge. The strictness of the instruction ("answer only using the provided context; say you don't know if it's not covered") determines how often the model still drifts into unsupported claims when the context is thin or ambiguous — this is a prompt-engineering lever, not a platform setting.

**Next.js implementation:**

```typescript
// lib/vertex-rag/generate.ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

export async function generateGroundedAnswer(question: string, contextChunks: string[]) {
  const context = contextChunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n');
  const prompt = `Answer the question using ONLY the numbered context below. ` +
    `Cite sources inline like [1]. If the context doesn't contain the answer, say so.\n\n` +
    `Context:\n${context}\n\nQuestion: ${question}`;
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text;
}
```

The `[1]`, `[2]` citation markers aren't cosmetic — they're what lets your admin UI map a claim in the generated answer back to the specific source chunk, which matters for a medical exam platform where you'd want to verify every generated answer against its source before trusting it in a question bank.

---

## 7b. Managed grounding — collapsing retrieve → rerank → generate into one call

**Mechanics:** Steps 4, 5, and 7 above give you full manual control over the retrieval pipeline — useful if you want to inspect retrieved chunks, swap the reranker, or apply HyDE conditionally. But Vertex AI also supports handing Gemini the corpus reference directly as a **tool**, and letting it perform retrieval internally as part of generation. This is "grounding" in the platform sense: instead of you fetching chunks and stuffing them into a prompt string yourself, you declare `retrieval: { vertexRagStore: { ragCorpora: [...] } }` as a tool, and the model decides when and what to retrieve, then generates the answer in the same response. You lose the ability to rerank or inspect intermediate chunks before generation, but you gain a much smaller surface area to maintain — one API call instead of three chained ones, and Google's own grounding logic (not your hand-rolled prompt template) decides what counts as relevant.

This is the right default for most features. Reach for the manual pipeline (steps 4/5/7) only when you specifically need to show users which chunks were retrieved *before* generating, or when you've measured that Vertex's built-in grounding retrieval quality isn't good enough for your content and reranking would clearly help.

**Next.js implementation:**

```typescript
// lib/vertex-rag/managed-query.ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

export async function queryWithManagedGrounding(
  question: string,
  corpusName: string, // full resource name: projects/{p}/locations/{l}/ragCorpora/{id}
  systemInstruction: string
) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: question,
    config: {
      systemInstruction,
      tools: [
        {
          retrieval: {
            vertexRagStore: {
              ragCorpora: [corpusName],
            },
          },
        },
      ],
    },
  });

  const answer = response.text || '';
  if (!answer) throw new Error('Empty response from Gemini');
  return { answer, sources: [] };
}
```

Note this uses the *same* `GoogleGenAI` client from step 7 — `vertexRagStore` is just another tool declaration, so managed grounding and plain generation aren't different SDKs, just different `config.tools` on the same `generateContent` call.

---

## 7c. Function calling — letting the model trigger your own application logic

**Mechanics:** Retrieval tools (7b) let Gemini pull context from your corpus. Function-calling tools let Gemini trigger *your own code* — e.g. "create a question-bank entry," "flag this chunk for review" — by declaring a function schema and having the model return a structured call instead of (or before) prose. The model doesn't execute anything itself: it returns `functionCalls` in the response, your server matches the name/args against your own executor, runs it, and then — if you want a natural-language confirmation — makes a *second* `generateContent` call feeding the function's result back in as context. This two-call round trip (call → execute → confirm) is the core loop every agent framework wraps in a nicer interface; doing it by hand in Next.js means you own that loop explicitly, which is more code but no hidden control flow.

`FunctionCallingConfigMode.ANY` (vs `AUTO`) forces the model to call one of the allowed functions rather than optionally replying in plain text — useful when the user has explicitly picked a tool from a UI and you want a guaranteed structured result, not a chance the model just talks instead of acting.

**Next.js implementation:**

```typescript
// lib/vertex-rag/tool-execution.ts
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT, location: LOCATION });

export async function executeWithTool(
  toolName: string,
  prompt: string,
  toolDefinition: { name: string; description: string; parameters: any },
  systemInstruction: string,
  executor: (name: string, args: any) => Promise<any>
) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [toolDefinition] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [toolName],
        },
      },
    },
  });

  const call = response.functionCalls?.[0];
  if (!call?.name) throw new Error(`Tool ${toolName} was not called by Gemini`);

  const result = await executor(call.name, call.args);

  // Second call: turn the raw tool result into a natural-language confirmation
  const confirmation = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Tool ${call.name} executed successfully.\n\nResult: ${JSON.stringify(result, null, 2)}\n\nProvide a brief confirmation message to the user.`,
    config: { systemInstruction },
  });

  return { answer: confirmation.text || 'Done.', toolResults: { [call.name]: result } };
}
```

For Wolfmed specifically, this is the pattern to reach for once you want the admin UI to say "generate a distractor set for this question" and have the model both decide *how* to structure the tool call and hand back a result your UI can render directly, instead of you parsing free-form text output.

---

## 8. Wiring the full pipeline into one API route

**Mechanics:** The stages above are independent and composable specifically so you can skip or swap them per use case — this is the actual design benefit of building it yourself instead of using a single black-box "ask" endpoint. A cheap "search only" feature uses steps 1, 2, 4. A high-quality "answer my question" feature chains 4 → 5 → 7. A hard-query feature adds 6 before 4.

**Next.js implementation:**

```typescript
// app/api/rag/ask/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { retrieveContexts } from '@/lib/vertex-rag/retrieve';
import { rerank } from '@/lib/vertex-rag/rerank';
import { generateGroundedAnswer } from '@/lib/vertex-rag/generate';

export async function POST(req: NextRequest) {
  const { corpusId, question } = await req.json();

  const retrieved = await retrieveContexts(corpusId, question, 10);
  const candidates = retrieved.contexts.map((c: any) => c.text);

  const ranked = await rerank(question, candidates, 3);
  const topChunks = ranked.records.map((r: any) => r.content);

  const answer = await generateGroundedAnswer(question, topChunks);

  return NextResponse.json({ answer, sources: topChunks });
}
```

This is a single request/response cycle, not a stateful agent loop — for your current Wolfmed needs (question bank generation, RAG-backed search) that's the right shape. You'd only need conversation-history/tool-calling agent orchestration (the ADK pattern) if you're building an interactive tutoring chat rather than a lookup/generation tool.

---

## Two valid shapes for the "ask a question" endpoint

This guide now has two complete patterns for going from question to grounded answer — pick per feature, not once for the whole app:

| | Manual pipeline (steps 4 → 5 → 7) | Managed grounding (7b) |
|---|---|---|
| API calls per question | 3 (retrieve, rerank, generate) | 1 |
| Control over which chunks get used | Full — you see and can filter/rerank every candidate | None — Vertex decides internally |
| Best for | User-facing "show your sources" features, anything where retrieval quality needs tuning | Internal tools, first pass on a new feature, anything where "good enough" grounding beats engineering time |
| Code to maintain | Three functions, three failure points | One function, one failure point |

Both use the same `GoogleGenAI` client and the same ADC auth — switching between them later is a config change (`tools` array), not a rewrite.

---

## Where this differs from the Python/ADK version conceptually

- **No agent framework dependency.** ADK gives you conversation-state management and a tool-calling loop out of the box. In Next.js, if you need that (e.g. a multi-turn tutoring chat), you'd manage conversation history yourself — store it server-side keyed by session, pass it into `generateContent` as prior turns — rather than getting it from a framework. Section 7c's call → execute → confirm loop is the hand-rolled version of what ADK's agent loop does automatically.
- **REST + auth instead of `vertexai.preview.rag`.** The Python SDK wraps the RAG Engine preview API in convenience classes; Node's client library coverage lags behind, so the REST calls above are the more honest current state, not a workaround you'll outgrow soon.
- **`@google/genai` instead of `@google-cloud/vertexai`.** The older package is deprecated (removal June 24, 2026), so all generation calls above use the unified SDK with `vertexai: true` — same ADC-based auth as the raw REST calls, no API key anywhere in this stack.
- **Long-running operations need explicit polling.** Python examples often call `.result()` and block; in a serverless Next.js route you don't want to hold a request open for a multi-minute import, so the import route above should return the operation name and let the client poll, rather than awaiting completion inline. Direct uploads (2b) sidestep this entirely by being synchronous.

## Notes from a working implementation

Sections 2b, 7b, and 7c above are pulled from patterns validated in a production Wolfmed RAG service, not just theory — a few field notes worth carrying forward if you build this yourself:

- **The `Content-Disposition` header on the multipart file part is not optional.** Omitting it doesn't throw an error — the upload request succeeds at the HTTP level, but the file silently fails to attach to the corpus. If files seem to "upload" but never show up in `listStoreDocuments`, this header is the first thing to check.
- **Wrap raw Google API errors before they reach the user.** `error.message` from a failed Vertex call is often a stringified JSON blob (`{"error": {"message": "..."}}`) rather than plain text — parse it out rather than surfacing the raw string, and fall back to a generic message only if parsing fails.
- **Keep `PROJECT_ID` and `LOCATION` as single-sourced constants**, not duplicated between your REST-auth module and your `GoogleGenAI` client instantiation — both need the exact same values, and letting them drift apart (e.g. one read from an env var, one hardcoded) is a quiet way to end up calling two different projects from the same service.

---

## 9. Deployment modes — where your corpus actually lives, and what it costs

**Mechanics:** RAG Engine has two entirely separate backends, and your corpus lives permanently in whichever one was active when you created it. Switching modes doesn't move data between them — it just changes which backend your API calls can see. Think of it as two isolated projects sharing one API surface, not a setting you tune on existing data.

- **Spanner mode** — the default if you never explicitly choose a mode. `createCorpus` in section 1 above, called with no `vector_db_config`, defaults here. You pick a tier:
  - **Basic** (default): a small, fixed-cost Spanner instance — 100 processing units. This is a flat, always-on cost, roughly **$60–65/month** at Standard-edition compute rates (100 PU = 0.1 node × ~$0.90/node-hour × 730 hours), before backup storage on top. It runs whether your corpus has 3 files or 3,000, because you're paying for a provisioned instance, not for bytes stored. This one instance cost covers *every* corpus in your project that uses RagManagedDb — splitting content into separate corpora per subject doesn't multiply this cost. Treat the $60–65 figure as a ballpark, not exact — rates vary slightly by edition/region.
  - **Scaled**: autoscaling, starts at 1 node — only relevant at real production volume.
- **Serverless mode** — the newer default Google now steers new projects toward. Resource management (corpora, files, metadata) is billed at a confirmed **$0** — no floor, no instance. But it has no bundled vector database: you pick one separately, defaulting to Agent Retrieval (formerly Vector Search 2.0), and *that* is billed on its own as usage-based pricing for smaller workloads.

**Honest caveat on cost comparison:** the $0 resource-management floor in Serverless is confirmed and real. Whether the Agent Retrieval vector DB underneath ends up cheaper than Spanner Basic's ~$60–65/month *at your specific scale* is genuinely unclear from public docs — Google's own pricing page only says a minimal setup runs "under $100/month" for high-throughput, moderate-sized workloads, which isn't precise enough to call a winner for a few hundred small text chunks with low query volume. Don't take "Serverless is cheaper" as settled — run your numbers through Google's Agent Retrieval pricing calculator before committing either way. What *is* settled: Serverless removes the flat Spanner floor, so it can't be worse for a small, intermittent workload, even if the exact savings are unverified.

**One thing that trips people up:** the Spanner instance behind Spanner mode is provisioned in a *separate Google-managed project*, not your own — so you'll never find it by looking under Cloud Spanner in your own console's resource list. It only shows up as a line item in Billing.

**Creating a corpus explicitly in Serverless mode vs Spanner mode, in Next.js:**

Deployment mode is a **project-level** setting, not a per-corpus one — you set it once via `RagEngineConfig`, and every corpus created afterward inherits whichever mode is active. There's no `vector_db_config` flag on corpus creation that picks Serverless vs Spanner directly; you switch the project's mode first, then create the corpus.

```typescript
// lib/vertex-rag/deployment-mode.ts
export async function getRagEngineConfig() {
  // GET /v1/projects/{project}/locations/{location}/ragEngineConfig
  return ragFetch('/ragEngineConfig');
}

export async function setSpannerTier(tier: 'BASIC' | 'SCALED' | 'UNPROVISIONED') {
  return ragFetch('/ragEngineConfig?update_mask=rag_tier', {
    method: 'PATCH',
    body: JSON.stringify({ rag_tier: tier }),
  });
}

// Switch the project to Serverless mode before creating new corpora there.
export async function switchToServerlessMode() {
  return ragFetch('/ragEngineConfig?update_mask=deployment_mode', {
    method: 'PATCH',
    body: JSON.stringify({ deployment_mode: 'SERVERLESS' }),
  });
}

export async function switchToSpannerMode() {
  return ragFetch('/ragEngineConfig?update_mask=deployment_mode', {
    method: 'PATCH',
    body: JSON.stringify({ deployment_mode: 'SPANNER' }),
  });
}
```

Once Serverless is active, corpus creation from section 1 (`createCorpus`) works unchanged — same endpoint, same request shape. The mode is invisible at the corpus-creation call site; it's entirely a consequence of which mode was active on the project at the moment you called it. This is exactly why it's easy to accidentally end up back in Spanner mode: if a switch operation fails silently or your `RagEngineConfig` update didn't apply, the next `createCorpus` call just quietly lands in whatever mode was already active — always call `getRagEngineConfig` to confirm before an ingestion run you care about, rather than assuming your last switch call succeeded.

Setting `UNPROVISIONED` deletes the Spanner instance **and every corpus stored in it**, immediately and irreversibly — this is the actual "stop billing" switch for Spanner mode, not a pause. Don't wire this to anything your admin UI could hit by accident.

**Checking the actual cost, in the Cloud Console:** this isn't visible from the API — go to **Billing → Reports**, set **Group by: SKU**, and check filters separately:
- **Service = Cloud Spanner** — your Spanner mode instance cost (flat, tier-driven, not per-file). Should read $0 once fully switched to Serverless with no remaining Spanner-mode corpora.
- **Service = Vertex AI** — your usage cost: `Embeddings for Text - Predictions` for ingestion and query embedding, plus the `Gemini ... Predictions` rows for generation. Watch specifically for a `Thinking Text Output` line — reasoning tokens bill at the output rate and can outweigh your actual answer tokens if thinking is enabled somewhere in your generation calls.
- **Service = Vector Search** (or its current renamed billing label) — this is where the Serverless-mode Agent Retrieval cost will show up once you're generating real usage, separate from the Vertex AI generation/embedding line items above.

Setting a budget alert (**Billing → Budgets & alerts**) at, say, 50%/90% of your free-trial credit is worth doing once, up front, rather than checking manually during development.

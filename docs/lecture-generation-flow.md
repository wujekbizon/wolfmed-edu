# Lecture Generation Flow

Complete end-to-end technical documentation for the AI lecture generation system.

---

## Overview

The lecture generator transforms a study plan cell into a narrated MP3 lecture by orchestrating:
1. **RAG retrieval** – pulls relevant context from the knowledge base and user materials
2. **LLM synthesis** – generates a structured lecture script via Gemini 2.5 Flash
3. **Text-to-speech** – converts the script to Polish audio via Google Wavenet TTS

Progress is streamed to the client in real-time over SSE.

---

## Trigger – `PlanCell.tsx`

The user clicks "Generuj wykład" inside a Plan cell.

```
PlanCell.handleGenerate()
  ├─ Generate unique jobId (uuid)
  ├─ startListening(jobId)        → open SSE connection to /api/rag/progress
  └─ generateLectureAction(cell.content, jobId)   → Server Action
```

The `cell.content` is the raw text of the study plan node used as the lecture topic.

---

## Server Action – `generateLectureAction`

**File**: `src/actions/rag-actions.ts`

### Guards (run first, fail fast)

| Step | Function | Failure |
|------|----------|---------|
| Create progress job | `createJob(jobId)` | – |
| Authenticate user | `auth()` (Clerk) | 401 |
| Premium check | `checkPremiumAccessAction()` | 403 |
| Rate limit | `checkRateLimit(userId, 'rag:query')` | 429 |

### Stage 1 – RAG Search (progress → 30%)

```
queryFileSearchOnly(topic)   [src/server/google-rag.ts]
  ├─ getRagConfig()           → ragConfig table → fileSearchStoreName
  ├─ enhanceUserQuery(topic)  → rewrite query for better retrieval
  └─ Gemini 2.5 Flash
       tool: fileSearch
       store: fileSearchStoreName
       → returns { answer: string, sources?: string[] }
```

**Data sources**:
- **Knowledge base** – Google File Search Store (pre-indexed medical content)
- **User notes** – `notes` table, fetched via `getNoteById()` when user attaches `@note:id`
- **User materials** – `materials` table, fetched via `getMaterialById()` when user attaches `@material:id`

All user-owned resources are verified with `WHERE userId = ${userId}` before being passed as additional context to the retrieval step.

### Stage 2 – Script Generation (progress → 70%)

```
executeToolLocally('wyklad_tool', { content: enrichedContent })
  [src/server/tools/executor.ts]
  ├─ Load templates/lecture-template.json
  ├─ Replace {{planContent}} with RAG answer + plan content
  └─ Gemini 2.5 Flash
       systemInstruction: template.systemPrompt
       temperature: 0.6
       → returns markdown lecture script
```

The tool returns a `ToolResult`:
```typescript
{
  cellType: 'note',
  content: lectureMarkdown,
  metadata: { type: 'lecture', generated: ISO8601 }
}
```

### Stage 3 – Text-to-Speech (progress → 85–95%)

The script is chunked before sending to avoid the Google TTS 5,000-byte limit.

```
1. Split script on sentence boundaries (/(?<=[.!?])\s+/)
2. Accumulate sentences until chunk would exceed 4,800 bytes (UTF-8 measured)
3. For each chunk:
     POST https://texttospeech.googleapis.com/v1/text:synthesize
       input: { text: chunk }
       voice: { languageCode: 'pl-PL', name: 'pl-PL-Wavenet-A' }
       audioConfig: { audioEncoding: 'MP3' }
     → base64 MP3 fragment
4. Decode each fragment → Buffer
5. Buffer.concat(audioBuffers) → single MP3
6. Re-encode to base64 → audioBase64
```

MP3 files can be binary-concatenated directly; no re-encoding needed.

### Completion

```
completeJob(jobId)           → SSE emits 'complete' event
return { status: 'SUCCESS', values: { audioBase64 } }
```

---

## Progress Tracking – SSE

### Client hook – `src/hooks/useRagProgress.ts`

Opens `EventSource` to `/api/rag/progress?jobId=xxx` immediately after action is called.

Listens for:
| Event | Payload | Effect |
|-------|---------|--------|
| `progress` | `{ stage, percent, message }` | Updates progress bar |
| `log` | `{ userLog, techLog }` | Appends to log panels |
| `complete` | – | Closes connection, triggers audio playback |
| `error` | `{ message }` | Shows error state |

### Server route – `src/app/api/rag/progress/route.ts`

- Polls `progress-store` every **2 seconds**
- Sends keep-alive ping every **30 seconds**
- Replays missed events on reconnect (via `Last-Event-ID`)
- Closes stream when job reaches `complete` or `error`

### Progress store – `src/server/progress-store.ts`

| Backend | Condition | TTL |
|---------|-----------|-----|
| Redis | `REDIS_URL` configured | configurable |
| In-memory Map | fallback | 60 seconds |

Key format: `progress:{jobId}`

---

## Progress Stages

| Stage | % | User message | Technical log |
|-------|----|-------------|---------------|
| `searching` | 30 | "Przeszukuję bazę wiedzy..." | `[RAG] Querying knowledge base` |
| `executing` | 70 | "Generuję skrypt wykładu..." | `[LLM] Sending request to Gemini` |
| `finalizing` | 85 | "Syntezuję głos..." | `[TTS] Converting script to audio` |
| `finalizing` | 95 | "Wykład gotowy!" | `[TTS] Audio synthesis complete` |
| `complete` | 100 | – | – |

---

## Client Playback – `PlanCell.tsx`

```
Receive audioBase64 from Server Action
  → atob(audioBase64) → binary string
  → Uint8Array(binary)
  → Blob({ type: 'audio/mp3' })
  → URL.createObjectURL(blob)
  → <audio> element with Play / Pause / Restart controls
```

Audio is **not persisted** to the database – generated on demand and held in client memory as an object URL.

---

## External APIs

| API | Purpose | Auth | SDK/Endpoint |
|-----|---------|------|--------------|
| Gemini 2.5 Flash | RAG retrieval via File Search | `GOOGLE_API_KEY` | GoogleGenAI SDK |
| Gemini 2.5 Flash | Lecture script generation | `GOOGLE_API_KEY` | GoogleGenAI SDK |
| Google TTS v1 | MP3 audio synthesis | `GOOGLE_TTS_API_KEY` | REST `text:synthesize` |
| Clerk | Authentication | Clerk secret | `auth()` |

---

## Database Tables Involved

| Table | Used for |
|-------|---------|
| `ragConfig` | File Search store name lookup |
| `notes` | User note content (optional context) |
| `materials` | User uploaded file metadata (optional context) |

No new rows are written during lecture generation.

---

## Key Files

| File | Role |
|------|------|
| `src/actions/rag-actions.ts` | Orchestrates entire flow |
| `src/components/cells/PlanCell.tsx` | UI trigger & audio playback |
| `src/server/google-rag.ts` | Gemini File Search wrapper |
| `src/server/tools/executor.ts` | `wyklad_tool` – script generation |
| `src/server/progress-store.ts` | Job state (Redis / in-memory) |
| `src/app/api/rag/progress/route.ts` | SSE endpoint |
| `src/hooks/useRagProgress.ts` | Client SSE consumer |
| `src/server/queries.ts` | DB queries for notes & materials |
| `templates/lecture-template.json` | Gemini system prompt + template |

---

## Full Call Graph

```
PlanCell.handleGenerate()
│
├─ startListening(jobId) ──────────────────────────── SSE /api/rag/progress
│                                                          │ polls progress-store every 2s
│
└─ generateLectureAction(planContent, jobId)
    │
    ├─ createJob(jobId)
    ├─ auth()                         [Clerk]
    ├─ checkPremiumAccessAction()
    ├─ checkRateLimit(userId)
    │
    ├─ progressStep(30, 'searching')
    ├─ queryFileSearchOnly(topic)
    │   ├─ getRagConfig()             [DB: ragConfig]
    │   ├─ [optional] getNoteById()   [DB: notes]
    │   ├─ [optional] getMaterialById()[DB: materials]
    │   └─ Gemini 2.5 Flash ─ fileSearch ─→ Knowledge base
    │
    ├─ progressStep(70, 'executing')
    ├─ executeToolLocally('wyklad_tool', enrichedContent)
    │   ├─ Load lecture-template.json
    │   └─ Gemini 2.5 Flash ─ generateContent ─→ Markdown script
    │
    ├─ progressStep(85, 'finalizing')
    ├─ chunk script by bytes
    ├─ for each chunk → Google TTS API → MP3 Buffer
    ├─ Buffer.concat → base64
    │
    ├─ progressStep(95)
    ├─ completeJob(jobId) ────────────────────────── SSE emits 'complete'
    └─ return { audioBase64 }
                │
                └─ PlanCell: Blob → objectURL → <audio> player
```

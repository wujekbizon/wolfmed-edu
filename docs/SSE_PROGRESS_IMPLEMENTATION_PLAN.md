# Full Implementation Plan: SSE Progress Notifications

**Date:** 2026-02-09
**Goal:** Real-time progress updates for RAG/tool operations while keeping `useActionState`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   RagCellForm                                                            │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ 1. Generate jobId (uuid)                                          │  │
│   │ 2. Open EventSource → /api/rag/progress?jobId=xxx                 │  │
│   │ 3. Submit form with jobId → useActionState(askRagQuestion)        │  │
│   │ 4. Receive SSE events → Update progress UI                        │  │
│   │ 5. Server action completes → useActionState gets result           │  │
│   │ 6. Close EventSource                                              │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   useRagProgress (Hook)                RagProgressIndicator (UI)        │
│   ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│   │ • Manage EventSource    │          │ • Progress bar              │  │
│   │ • Handle reconnection   │          │ • Stage messages            │  │
│   │ • Track connection state│          │ • Expandable logs           │  │
│   │ • Expose progress state │          │ • Error display             │  │
│   └─────────────────────────┘          └─────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │ SSE Connection               │ Form Submit
                    ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   /api/rag/progress (SSE Endpoint)        rag-actions.ts (Server Action)│
│   ┌─────────────────────────┐             ┌─────────────────────────┐   │
│   │ • Stream events from    │             │ • Parse commands        │   │
│   │   progress store        │             │ • Fetch resources       │   │
│   │ • Send keep-alive       │             │ • Call Gemini           │   │
│   │ • Handle Last-Event-ID  │             │ • Execute tools         │   │
│   │ • Return 204 when done  │             │ • Emit progress events  │   │
│   └─────────────────────────┘             └─────────────────────────┘   │
│                    ▲                              │                      │
│                    │         progress-store.ts   │                      │
│                    │         ┌───────────────────▼───┐                  │
│                    └─────────│ In-memory Map<jobId>  │                  │
│                              │ • events[]            │                  │
│                              │ • status              │                  │
│                              │ • lastEventId         │                  │
│                              └───────────────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## SSE Event Protocol

### Event Format (Following MDN spec)

```
id: <incrementing-number>
event: <event-type>
retry: 3000
data: <json-payload>

```

### Event Types

| Event Type | Purpose | Payload |
|------------|---------|---------|
| `progress` | Stage update | `{ stage, message, progress, total }` |
| `log` | Detailed log message | `{ level, message, timestamp }` |
| `complete` | Operation finished | `{ success: true }` |
| `error` | Operation failed | `{ message, code }` |
| `keepalive` | Prevent timeout | `{}` |

### Example Event Stream

```
id: 1
event: progress
retry: 3000
data: {"stage":"parsing","message":"Analizuję zapytanie...","progress":10,"total":100}

id: 2
event: log
data: {"level":"info","message":"Wykryto polecenie: /diagram","timestamp":"2026-02-09T10:30:00Z"}

id: 3
event: progress
data: {"stage":"fetching","message":"Pobieram zasoby...","progress":25,"total":100}

: keep-alive

id: 4
event: progress
data: {"stage":"calling_tool","message":"Wywołuję narzędzie diagram_tool...","progress":60,"total":100,"tool":"diagram_tool"}

id: 5
event: complete
data: {"success":true}

```

---

## Progress Stages

| Stage | Message (PL) | Progress | When |
|-------|-------------|----------|------|
| `idle` | Oczekiwanie... | 0% | Initial state |
| `parsing` | Analizuję zapytanie... | 10% | Parsing @ and / commands |
| `resolving` | Rozwiązuję referencje... | 20% | Resolving resource URIs |
| `fetching` | Pobieram zawartość zasobów... | 30% | Fetching notes/materials/docs |
| `searching` | Przeszukuję dokumenty... | 45% | RAG file search |
| `calling_tool` | Wywołuję narzędzie {tool}... | 60% | Tool selected by Gemini |
| `executing` | Generuję zawartość... | 75% | Tool execution (e.g., diagram generation) |
| `finalizing` | Finalizuję odpowiedź... | 90% | Final Gemini response |
| `complete` | Gotowe | 100% | Done |
| `error` | Wystąpił błąd | - | Error state |

---

## Files to Create

### 1. `src/lib/progress-store.ts`
In-memory store for progress events per job.

```typescript
interface ProgressEvent {
  id: number
  type: 'progress' | 'log' | 'complete' | 'error'
  data: Record<string, any>
  timestamp: number
}

interface JobProgress {
  events: ProgressEvent[]
  status: 'active' | 'complete' | 'error'
  lastEventId: number
}

// Map<jobId, JobProgress>
// Methods: createJob, emitProgress, emitLog, complete, error, getEvents, cleanup
```

### 2. `src/lib/progress-events.ts`
Type definitions and helper functions.

```typescript
type ProgressStage = 'idle' | 'parsing' | 'resolving' | 'fetching' | 'searching' | 'calling_tool' | 'executing' | 'finalizing' | 'complete' | 'error'

interface ProgressData {
  stage: ProgressStage
  message: string
  progress: number
  total: number
  tool?: string
}

// Helper: getStageMessage(stage, tool?)
// Helper: formatSSEMessage(id, event, data, retry?)
```

### 3. `src/app/api/rag/progress/route.ts`
SSE streaming endpoint.

```typescript
// GET /api/rag/progress?jobId=xxx
// Headers: Content-Type: text/event-stream, Cache-Control: no-cache, Connection: keep-alive
// Handles: Last-Event-ID header for reconnection
// Sends: Keep-alive comments every 15 seconds
// Returns: 204 when job complete (stops reconnection)
```

### 4. `src/hooks/useRagProgress.ts`
Client-side hook for SSE connection management.

```typescript
interface UseRagProgressReturn {
  jobId: string
  stage: ProgressStage
  message: string
  progress: number
  logs: LogEntry[]
  connectionState: 'connecting' | 'open' | 'closed' | 'error'
  isComplete: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
}
```

### 5. `src/components/cells/RagProgressIndicator.tsx`
Progress UI component.

```
┌─────────────────────────────────────────────────────────────┐
│  ◐ diagram_tool                                       call  │
│  ├─ ✓ Analizuję zapytanie...                               │
│  ├─ ✓ Pobieram zasoby...                                   │
│  ├─ ⟳ Generuję diagram...                                  │
│  └─ ━━━━━━━━━━━━━━━━━━░░░░░░░░░░  60%                      │
│  ▼ Pokaż szczegóły                                          │
└─────────────────────────────────────────────────────────────┘

Expanded:
┌─────────────────────────────────────────────────────────────┐
│  ▲ Ukryj szczegóły                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 10:30:00 [INFO] Wykryto polecenie: /diagram             ││
│  │ 10:30:01 [INFO] Rozwiązano zasób: Anatomia.md           ││
│  │ 10:30:02 [INFO] Wywołuję diagram_tool...                ││
│  │ 10:30:03 [INFO] Generuję Mermaid flowchart...           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

### 1. `src/actions/rag-actions.ts`
Add `jobId` parameter and emit progress at each stage.

```typescript
export async function askRagQuestion(prevState: FormState, formData: FormData) {
  const jobId = formData.get('jobId') as string

  emitProgress(jobId, 'parsing', 10)
  // ... parse commands

  emitProgress(jobId, 'resolving', 20)
  // ... resolve URIs

  emitProgress(jobId, 'fetching', 30)
  // ... fetch resources

  // ... etc

  completeJob(jobId)
  return result
}
```

### 2. `src/server/google-rag.ts`
Add progress callback to RAG functions.

```typescript
export async function queryWithFileSearch(
  question: string,
  options?: { jobId?: string }
) {
  if (options?.jobId) {
    emitProgress(options.jobId, 'searching', 45)
  }
  // ... existing logic
}
```

### 3. `src/server/tools/executor.ts`
Add progress callback to tool execution.

```typescript
export async function executeToolLocally(
  toolName: string,
  args: any,
  options?: { jobId?: string }
) {
  if (options?.jobId) {
    emitProgress(options.jobId, 'executing', 75)
    emitLog(options.jobId, 'info', `Executing ${toolName}...`)
  }
  // ... existing logic
}
```

### 4. `src/components/cells/RagCellForm.tsx`
Integrate progress hook and UI.

```typescript
// Add:
const { jobId, stage, progress, message, logs, startListening, stopListening } = useRagProgress()

// Before submit:
startListening()

// In form:
<input type="hidden" name="jobId" value={jobId} />

// Replace RagLoadingState with:
{isPending && <RagProgressIndicator stage={stage} progress={progress} message={message} logs={logs} />}

// On complete:
stopListening()
```

---

## Best Practices Implementation

### 1. Reconnection with Last-Event-ID

**Server:**
```typescript
export async function GET(request: Request) {
  const lastEventId = request.headers.get('Last-Event-ID')
  const startFrom = lastEventId ? parseInt(lastEventId) + 1 : 0

  // Send events starting from startFrom
  const events = getEvents(jobId, startFrom)
}
```

**Client:**
```typescript
// EventSource automatically sends Last-Event-ID on reconnect
// No manual handling needed
```

### 2. Keep-Alive Comments

```typescript
// Server sends every 15 seconds:
`: keep-alive\n\n`

// Prevents proxy buffering and connection timeout
```

### 3. Clean Termination (HTTP 204)

```typescript
// When job is complete and client reconnects:
if (job.status === 'complete') {
  return new Response(null, { status: 204 })
}
```

### 4. Retry Time

```typescript
// First event includes retry directive:
`retry: 3000\n`  // 3 seconds
```

### 5. Connection State Handling

```typescript
// Client hook tracks state:
eventSource.onopen = () => setState('open')
eventSource.onerror = () => {
  if (eventSource.readyState === EventSource.CLOSED) {
    setState('closed')
  } else {
    setState('reconnecting')
  }
}
```

### 6. Cleanup on Unmount

```typescript
useEffect(() => {
  return () => {
    eventSource?.close()
    // Optionally: notify server to cleanup job
  }
}, [])
```

### 7. Job Cleanup (Memory Management)

```typescript
// Server cleans up jobs after 5 minutes:
const JOB_TTL = 5 * 60 * 1000

setInterval(() => {
  for (const [jobId, job] of progressStore) {
    if (Date.now() - job.createdAt > JOB_TTL) {
      progressStore.delete(jobId)
    }
  }
}, 60 * 1000)
```

---

## Error Handling

### Server Errors
```typescript
try {
  // ... operation
} catch (error) {
  emitError(jobId, error.message)
  // Server action still returns error via FormState
}
```

### Client Errors
```typescript
eventSource.onerror = (e) => {
  if (eventSource.readyState === EventSource.CLOSED) {
    setError('Połączenie zostało zamknięte')
  }
  // Auto-reconnect happens for transient errors
}
```

### Timeout Detection
```typescript
// Client-side: if no event received for 30s, show warning
const TIMEOUT = 30000
useEffect(() => {
  const timer = setTimeout(() => {
    if (stage !== 'complete' && stage !== 'error') {
      setWarning('Operacja trwa dłużej niż zwykle...')
    }
  }, TIMEOUT)
  return () => clearTimeout(timer)
}, [lastEventTime])
```

---

## Implementation Order

1. **Phase 1: Core Infrastructure**
   - `progress-store.ts` - In-memory store
   - `progress-events.ts` - Types and helpers
   - `/api/rag/progress/route.ts` - SSE endpoint

2. **Phase 2: Server Integration**
   - Modify `rag-actions.ts` - Add jobId and emit calls
   - Modify `google-rag.ts` - Add progress callbacks
   - Modify `executor.ts` - Add progress callbacks

3. **Phase 3: Client Integration**
   - `useRagProgress.ts` - SSE hook
   - `RagProgressIndicator.tsx` - Progress UI
   - Modify `RagCellForm.tsx` - Wire everything together

4. **Phase 4: Polish**
   - Error states UI
   - Timeout warnings
   - Cleanup and testing

---

## References

- [MDN: Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [WHATWG HTML Standard - SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Server Sent Events - javascript.info](https://javascript.info/server-sent-events)

---

**Status:** Ready for implementation after review.

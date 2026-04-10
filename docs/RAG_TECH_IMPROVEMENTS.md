# RAG System — Technical Improvements & Tests
**Date**: 2026-04-10
**Status**: Living document — add items as discovered

---

## Known Issues

### 1. Dead Code — `queryWithFileSearch` is unused
**File**: `src/server/google-rag.ts`  
**Problem**: The multi-turn function-call path (`queryWithFileSearch`) was built but the main action (`rag-actions.ts`) never calls it — tool path uses `executeToolWithContent` instead.  
**Action**: Either wire it in or remove it to reduce confusion.

---

### 2. Redundant Gemini call on tool + resource path
**File**: `src/actions/rag-actions.ts:321`  
**Problem**: When a user provides `@material.pdf`, we still call `queryFileSearchOnly()` for supplementary context — that's an extra Gemini call and extra latency even when the PDF already contains everything needed.  
**Fix**:
```typescript
// Skip RAG search if user provided substantial resource context
const shouldSearchRag = !pdfFiles.length && !additionalContext
if (shouldSearchRag) {
  const ragResult = await queryFileSearchOnly(effectiveQuestion)
  // ...
}
```

---

### 3. Tool execution always makes 3 Gemini calls
**File**: `src/server/google-rag.ts:executeToolWithContent`  
**Problem**: Call 1 → Gemini decides to call the function. Call 2 → tool calls Gemini internally (in `executor.ts`). Call 3 → Gemini wraps the final answer. The final wrap (call 3) adds cost and latency for minimal value — it just reformats the tool result.  
**Action**: Consider returning tool result directly without the final confirmation call for most tools.

---

### 4. No error boundary on template file reads
**File**: `src/server/tools/executor.ts:64`  
**Problem**: If a template file is missing in production, it throws an unhandled FS error with no helpful message.  
**Fix**: Wrap `loadTemplate` with a meaningful error message that names the missing file.

---

### 5. Rate limit values not documented
**File**: `src/lib/rateLimit.ts`  
**Action**: Document the actual limits for `rag:query` and `lecture:generate` so they can be validated against the cost projections in `RAG_COST_AUDIT.md`.

---

## Tests To Write

### Unit Tests

#### `parseMcpCommands` (pure function — easiest to test)
**File**: `src/helpers/parse-mcp-commands.ts`
```
- "@cardiology.pdf /utworz" → resources: ["cardiology.pdf"], tools: ["utworz"]
- "plain question" → cleanQuestion: "plain question", resources: [], tools: []
- "@note1 @note2 /fiszka" → resources: ["note1", "note2"], tools: ["fiszka"]
- "/notatka" with no topic → cleanQuestion: "", tools: ["notatka"]
```

#### `executeToolLocally` — executor.ts
```
- Unknown tool throws "Unknown tool: xyz"
- `query` tool returns autoHandled: true without calling Gemini
```

#### Template loading
```
- All 7 templates parse as valid JSON
- Required fields present in each template
```

---

### Integration Tests (mock Gemini)

#### Tool path — `askRagQuestion`
```
- Non-premium user → returns ERROR "Funkcja dostępna tylko dla użytkowników premium."
- Unauthenticated → returns ERROR "Unauthorized"
- Rate limited → returns ERROR with reset time
- /notatka with topic → calls executeToolWithContent, returns SUCCESS with toolResults
- /notatka with no topic and no resource → returns ERROR asking for topic
- @material + /utworz → fetches PDF, skips RAG (after fix #2), returns test questions
```

#### Plain RAG path
```
- Valid question → calls queryFileSearchOnly, returns SUCCESS with answer
- Empty question → validation error
```

#### `generateLectureAction`
```
- Same planContent hash → returns cached lecture without calling TTS
- Missing GOOGLE_TTS_API_KEY → throws clear error
- TTS response non-200 → throws "Google TTS error: ..."
```

---

### E2E / Smoke Tests (manual checklist for premium QA)

- [ ] Log in as premium user → AI Asystent button is enabled
- [ ] Log in as free user → AI Asystent button is greyed out, tooltip visible
- [ ] Send plain question → progress bar moves, answer appears
- [ ] `/notatka fizjologia serca` → note cell opens with generated content
- [ ] `/utworz kardiologia` → test questions generated in correct JSON format
- [ ] `/fiszka` + `@MyPDF` → flashcards based on PDF content
- [ ] `/planuj` → learning plan JSON renders correctly as plan cell
- [ ] `/planuj` → generate lecture button → audio plays
- [ ] Same lecture plan generated twice → second request instant (cache hit)
- [ ] Rate limit hit → correct Polish error message shown

---

## Improvement Backlog (lower priority)

- Add `maxTokens` cap on tool content input to prevent runaway context costs
- Consider streaming tool results via SSE instead of waiting for full completion
- `diagram_tool` uses Mermaid internally but description says "Excalidraw format" — align description with reality
- Add structured logging (currently `console.error` scattered throughout)

---

## Rate Limit — Lecture Generation (cost risk)

**File**: `src/lib/rateLimit.ts:49`  
**Current**: `lecture:generate` → 3/day = **90/month max**  
**Problem**: At $0.40/lecture avg TTS cost, a max-usage Pielęgniarstwo user costs **$36/month** on a 599.99 PLN one-time payment. Revenue is consumed within 4–5 months.  
**Fix**: Change to a monthly hard cap instead of daily:
```typescript
'lecture:generate': { interval: 30 * 24 * 60 * 60 * 1000, maxRequests: 10 },
```
**Recommended cap**: 10/month → worst-case $4/user/month → one-time revenue covers 37+ months.  
See full analysis in `RAG_COST_SIMULATION.md`.

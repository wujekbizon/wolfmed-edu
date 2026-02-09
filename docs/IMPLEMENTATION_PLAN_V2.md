# Wolfmed MCP Implementation Plan V2
**Date**: 2026-01-29
**Status**: Architecture Finalized - Ready for Implementation

---

## 🎯 Vision: Hybrid RAG + AI-Driven Tools

**Goal**: Build a pioneer educational platform where AI has tools at its disposal to help users learn, not just answer questions.

**User Flow Example**:
```
User: "Take my @cardiology.pdf and create test with 20 questions based on information there"

What happens:
1. Parser extracts: resources=["cardiology.pdf"], tools=[], cleanQuestion="create test with 20 questions"
2. Fetch cardiology.pdf content → inject into Gemini context
3. Gemini receives tool list: [/utworz, /podsumuj, /flashcards, ...]
4. Gemini DECIDES to call /utworz (questionCount: 20, difficulty: 'medium')
5. We execute /utworz → generates Wolfmed JSON format tests
6. Send result back to Gemini
7. Gemini returns final answer: "I've created 20 cardiology questions for you..." + JSON
```

**Key Insight**: The model is AWARE of available tools and decides when to use them. We're not forcing tools, we're making them available.

---

## 🏗️ Architecture Deep Dive

### Core Components

```
┌────────────────────────────────────────────────────────────┐
│                    USER                                     │
│  "Take @cardiology.pdf and create 20 questions /utworz"   │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ↓
┌────────────────────────────────────────────────────────────┐
│              NEXT.JS APP (MCP Client-like)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1. Parse @ and / commands                            │ │
│  │    parseMcpCommands(input)                           │ │
│  │    → resources: ["cardiology.pdf"]                   │ │
│  │    → tools: ["utworz"]                               │ │
│  │    → cleanQuestion: "create 20 questions"            │ │
│  └──────────────────────────────────────────────────────┘ │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 2. Resolve resources                                 │ │
│  │    - Fetch /api/mcp/resources (list all)            │ │
│  │    - Match displayName → URI                         │ │
│  │    - Fetch content (note://, material://, docs://)   │ │
│  └──────────────────────────────────────────────────────┘ │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 3. Build tool definitions for Gemini                 │ │
│  │    If user mentioned /utworz OR if any / command:    │ │
│  │    → Include ALL available tools in Gemini config    │ │
│  │    → Let Gemini decide which to call                 │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ↓
┌────────────────────────────────────────────────────────────┐
│                   GEMINI API                                │
│                                                             │
│  Query: "create 20 questions" + context from PDF           │
│  Tools Available:                                           │
│  - fileSearch (Gemini File Search Store)                   │
│  - functionDeclarations:                                    │
│    * utworz_test (generate test questions)                 │
│    * podsumuj (summarize)                                  │
│    * flashcards (create flashcards)                        │
│    * quiz (quick quiz)                                     │
│    * tlumacz (translate)                                   │
│                                                             │
│  Gemini Decision:                                           │
│  "User wants test questions → I should call utworz_test"   │
│                                                             │
│  Response:                                                  │
│  {                                                          │
│    functionCalls: [{                                        │
│      name: "utworz_test",                                  │
│      args: { questionCount: 20, difficulty: "medium" }     │
│    }]                                                       │
│  }                                                          │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ↓
┌────────────────────────────────────────────────────────────┐
│              TOOL EXECUTION (Next.js)                       │
│                                                             │
│  executeTool("utworz_test", args)                          │
│    ↓                                                        │
│  Load template: /templates/wolfmed-test-format.json        │
│    ↓                                                        │
│  Call Gemini with structured prompt:                        │
│    "Generate 20 test questions in this JSON format:        │
│     { id, meta: {course, category}, data: {question,       │
│       answers: [{option, isCorrect}]} }"                   │
│    ↓                                                        │
│  Parse and validate JSON                                    │
│    ↓                                                        │
│  Return: [q1, q2, ..., q20]                                │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ↓
┌────────────────────────────────────────────────────────────┐
│           SEND RESULTS BACK TO GEMINI                       │
│                                                             │
│  ai.models.generateContent({                                │
│    contents: [                                              │
│      { text: "create 20 questions" },                      │
│      {                                                      │
│        functionResponse: {                                  │
│          name: "utworz_test",                              │
│          response: { questions: [...] }                    │
│        }                                                    │
│      }                                                      │
│    ]                                                        │
│  })                                                         │
│                                                             │
│  Final Answer from Gemini:                                  │
│  "I've created 20 test questions based on your cardiology  │
│   PDF. The questions cover key topics like heart anatomy,  │
│   ECG interpretation, and cardiac medications. Here they    │
│   are: [JSON]"                                              │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ↓
┌────────────────────────────────────────────────────────────┐
│                  USER SEES RESULT                           │
│  - AI's explanation of what was created                     │
│  - 20 test questions in Wolfmed format                      │
│  - Ready to take test or save to database                   │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 What Needs to Be Built

### 1. Multi-Turn Tool Execution (CRITICAL - Week 1)

**File**: `/src/server/google-rag.ts`

**Current Code** (simplified):
```typescript
export async function queryWithFileSearch(...) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: enhancedQuery,
    config: {
      tools: [...toolDefinitions]
    }
  });

  return {
    answer: response.candidates[0].content.parts[0].text,
    sources: extractSources(response)
  };
}
```

**Problem**: If Gemini returns `functionCalls`, we ignore them!

**Solution**: Add multi-turn handling:
```typescript
export async function queryWithFileSearch(
  question: string,
  fileSearchStoreName?: string,
  additionalContext?: string,
  toolDefinitions?: FunctionDeclaration[]
) {
  // Build initial query
  const enhancedQuery = additionalContext
    ? `${additionalContext}\n\nQuestion: ${question}`
    : question;

  // Initial request
  let response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: enhancedQuery }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: buildToolsConfig(fileSearchStoreName, toolDefinitions)
    }
  });

  // Extract function calls
  const functionCalls = extractFunctionCalls(response);

  // If Gemini wants to call tools, execute them
  if (functionCalls && functionCalls.length > 0) {
    const toolResults = [];

    for (const call of functionCalls) {
      console.log(`🔧 Executing tool: ${call.name}`, call.args);
      const result = await executeToolLocally(call.name, call.args);
      toolResults.push({
        name: call.name,
        response: result
      });
    }

    // Send results back to Gemini for final answer
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: enhancedQuery }] },
        {
          role: 'model',
          parts: functionCalls.map(call => ({ functionCall: call }))
        },
        {
          role: 'function',
          parts: toolResults.map(result => ({
            functionResponse: {
              name: result.name,
              response: result.response
            }
          }))
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: buildToolsConfig(fileSearchStoreName, toolDefinitions)
      }
    });

    return {
      answer: extractText(finalResponse),
      sources: extractSources(response),
      toolResults: toolResults
    };
  }

  // No tool calls, return answer directly
  return {
    answer: extractText(response),
    sources: extractSources(response)
  };
}
```

---

### 2. Tool Execution Handler (Week 1)

**File**: `/src/server/tools/executor.ts` (NEW)

```typescript
import { utworzTool } from './utworz-tool';
import { podsumujTool } from './podsumuj-tool';
import { flashcardsTool } from './flashcards-tool';
import { quizTool } from './quiz-tool';
import { tlumaczTool } from './tlumacz-tool';

export async function executeToolLocally(
  toolName: string,
  args: any
): Promise<any> {
  switch (toolName) {
    case 'utworz_test':
      return await utworzTool(args);

    case 'podsumuj':
      return await podsumujTool(args);

    case 'flashcards':
      return await flashcardsTool(args);

    case 'quiz':
      return await quizTool(args);

    case 'tlumacz':
      return await tlumaczTool(args);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

---

### 3. Test Generation Tool (Week 1)

**File**: `/src/server/tools/utworz-tool.ts` (NEW)

```typescript
import { GoogleGenAI } from '@google/genai';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UtworzArgs {
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface WolfmedQuestion {
  id: string;
  meta: {
    course: string;
    category: string;
  };
  data: {
    question: string;
    answers: Array<{
      option: string;
      isCorrect: boolean;
    }>;
  };
}

export async function utworzTool(args: UtworzArgs): Promise<any> {
  const { questionCount, difficulty = 'medium', category = 'medycyna' } = args;

  // Load template
  const templatePath = join(process.cwd(), 'templates', 'wolfmed-test-format.json');
  const template = JSON.parse(await readFile(templatePath, 'utf-8'));

  // Build structured prompt
  const prompt = `
You are a medical education expert. Generate exactly ${questionCount} test questions in Polish.

Difficulty level: ${difficulty}
Category: ${category}

REQUIREMENTS:
1. Each question must have 4 answer options
2. Exactly ONE option must be correct (isCorrect: true)
3. Questions should test understanding, not just memorization
4. Use clear, professional medical terminology
5. Follow the EXACT JSON structure provided

Return ONLY a valid JSON array with NO additional text or explanation.

JSON Structure (repeat ${questionCount} times):
${JSON.stringify(template, null, 2)}
`;

  // Call Gemini to generate questions
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.7,
      responseMode: 'json'  // Request JSON output
    }
  });

  const text = response.candidates[0].content.parts[0].text;

  // Parse and validate JSON
  let questions: WolfmedQuestion[];
  try {
    questions = JSON.parse(text);

    // Validate structure
    if (!Array.isArray(questions) || questions.length !== questionCount) {
      throw new Error('Invalid question count');
    }

    // Add UUIDs if missing
    questions = questions.map(q => ({
      ...q,
      id: q.id || uuidv4(),
      meta: {
        ...q.meta,
        course: category,
        category: category
      }
    }));

  } catch (error) {
    console.error('Failed to parse questions:', error);
    throw new Error('Tool execution failed: Invalid JSON response');
  }

  return {
    questions,
    count: questions.length,
    difficulty,
    category
  };
}
```

---

### 4. Test Format Template (Week 1)

**File**: `/templates/wolfmed-test-format.json` (NEW)

```json
{
  "id": "example-uuid",
  "meta": {
    "course": "medycyna",
    "category": "cardiology"
  },
  "data": {
    "question": "Jakie jest główne zadanie serca w układzie krążenia?",
    "answers": [
      {
        "option": "Produkcja czerwonych krwinek",
        "isCorrect": false
      },
      {
        "option": "Pompowanie krwi do całego organizmu",
        "isCorrect": true
      },
      {
        "option": "Filtracja toksyn z krwi",
        "isCorrect": false
      },
      {
        "option": "Regulacja temperatury ciała",
        "isCorrect": false
      }
    ]
  },
  "createdAt": "2026-01-29T10:00:00Z",
  "updatedAt": null
}
```

---

### 5. Other Tool Implementations (Week 2)

**File**: `/src/server/tools/podsumuj-tool.ts`
```typescript
export async function podsumujTool(args: { text: string }): Promise<any> {
  // Call Gemini with summarization prompt
  // Return 50-100 word summary
}
```

**File**: `/src/server/tools/flashcards-tool.ts`
```typescript
export async function flashcardsTool(args: { count: number }): Promise<any> {
  // Generate Q&A flashcards
  // Return array of {front: string, back: string}
}
```

**File**: `/src/server/tools/quiz-tool.ts`
```typescript
export async function quizTool(): Promise<any> {
  // Generate 3 quick questions
  // Similar to utworz but simpler
}
```

**File**: `/src/server/tools/tlumacz-tool.ts`
```typescript
export async function tlumaczTool(args: { text: string }): Promise<any> {
  // Translate to English using Gemini
  // Return translated text
}
```

---

### 6. Material PDF Extraction (Week 2)

**File**: `/src/actions/rag-actions.ts` - Update `fetchResourceContent`

```typescript
import { getMaterialById } from '@/server/queries';

async function fetchResourceContent(uri: string, userId: string): Promise<string> {
  if (uri.startsWith('note://')) {
    const noteId = uri.replace('note://', '');
    const note = await getNoteById(noteId, userId);
    return note ? `# ${note.title}\n\n${note.content}` : '';
  }

  if (uri.startsWith('material://')) {
    const materialId = uri.replace('material://', '');
    const material = await getMaterialById(materialId, userId);

    if (!material) return '';

    // Extract PDF text using Gemini File API
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

    // Upload PDF temporarily
    const file = await ai.files.upload({
      file: await fetch(material.url).then(r => r.blob()),
      mimeType: 'application/pdf'
    });

    // Extract text
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { fileData: { fileUri: file.uri, mimeType: 'application/pdf' } },
          { text: 'Extract all text content from this PDF. Return only the text, no commentary.' }
        ]
      }]
    });

    const extractedText = response.candidates[0].content.parts[0].text;

    // Apply 50KB truncation
    const MAX_CHARS = 50000;
    return extractedText.length > MAX_CHARS
      ? extractedText.substring(0, MAX_CHARS) + '\n\n[... content truncated ...]'
      : extractedText;
  }

  // For docs:// files
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'read', args: { filename: uri } }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || '';
}
```

---

## 🎯 Implementation Roadmap

### Week 1: Core Tool Execution
- [ ] Multi-turn execution in `google-rag.ts`
- [ ] Tool executor handler
- [ ] `/utworz` implementation with template
- [ ] Test with: "create 10 test questions about heart anatomy"

### Week 2: Additional Tools + PDF Extraction
- [ ] `/podsumuj`, `/flashcards`, `/quiz`, `/tlumacz`
- [ ] Material PDF extraction
- [ ] Test with: "@cardiology.pdf create flashcards"

### Week 3: Cell Persistence + Polish
- [ ] Save RAG responses to database
- [ ] Load previous responses on cell mount
- [ ] Error handling and UX improvements
- [ ] Remove debug logging

---

## 📊 Architecture Decisions Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| **MCP Server Role** | Resources only | Keep it simple, tools via direct Gemini functions |
| **Tool Execution** | Local in Next.js | No need for external MCP server |
| **Resource Fetching** | On-demand injection | Don't index user content, fetch as needed |
| **RAG Implementation** | Gemini File Search | Free, managed, built-in citations |
| **Multi-turn Pattern** | Yes, implemented | Required for proper tool usage |
| **Template Storage** | `/templates` folder | JSON files for test formats |

---

## 🧪 Testing Plan

### Test 1: Basic Tool Call
```
User: "What is the heart? /utworz count=5"
Expected: Answer + 5 test questions
```

### Test 2: Resource + Tool
```
User: "Take @cardiology.pdf and create 10 questions"
Expected: Gemini reads PDF context, calls /utworz, returns questions
```

### Test 3: Multiple Resources
```
User: "@anatomy.pdf @physiology.pdf compare heart and lungs /flashcards"
Expected: Context from both PDFs, flashcards generated
```

### Test 4: No Tool (Baseline)
```
User: "Explain the cardiac cycle"
Expected: Answer from File Search, no tool calls
```

---

## ✅ Success Criteria

1. **Gemini can call tools** - Function calls execute successfully
2. **Multi-turn works** - Results sent back for final answer
3. **Test generation** - `/utworz` produces valid Wolfmed JSON
4. **PDF extraction** - Materials content fetched correctly
5. **User experience** - Seamless, feels like talking to smart assistant

---

**Status**: Ready to implement. Start with multi-turn execution in `google-rag.ts`.

---

## 🔄 SSE Progress System (Implemented)

**Date Implemented**: 2026-02-09
**Status**: ✅ Complete

Real-time progress notifications for RAG/tool operations using Server-Sent Events (SSE) with Redis-backed state persistence.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   useRagProgress (Hook)                 useProgressStore (Zustand)       │
│   ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│   │ • Manage EventSource    │          │ • jobId, stage, progress    │  │
│   │ • Handle reconnection   │          │ • logs[] (user/technical)   │  │
│   │ • useMemo for logs      │          │ • connectionState           │  │
│   │ • Expose progress state │          │ • Actions: update/reset     │  │
│   └─────────────────────────┘          └─────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                    │ SSE Connection
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   /api/rag/progress (SSE Endpoint)        progress-store.ts (Server)    │
│   ┌─────────────────────────┐             ┌─────────────────────────┐   │
│   │ • Stream events from    │             │ • Upstash Redis storage │   │
│   │   progress store        │◄────────────│ • In-memory fallback    │   │
│   │ • Send keep-alive       │             │ • Async operations      │   │
│   │ • Handle Last-Event-ID  │             │ • 5-min TTL cleanup     │   │
│   └─────────────────────────┘             └─────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### File Structure

| File | Purpose |
|------|---------|
| `src/server/progress-store.ts` | Redis-backed job state with in-memory fallback |
| `src/store/useProgressStore.ts` | Zustand store for client-side progress state |
| `src/hooks/useRagProgress.ts` | SSE connection management hook |
| `src/app/api/rag/progress/route.ts` | SSE streaming endpoint |
| `src/types/progressTypes.ts` | All progress-related TypeScript types |
| `src/constants/progress.ts` | Stage messages, progress values, timing constants |
| `src/helpers/progress-helpers.ts` | SSE formatting, stage/tool label helpers |
| `src/lib/redis.ts` | Upstash Redis singleton |

### Progress Stages

| Stage | Message (PL) | Progress |
|-------|-------------|----------|
| `idle` | Oczekiwanie... | 0% |
| `parsing` | Analizuję zapytanie... | 10% |
| `resolving` | Rozwiązuję referencje... | 20% |
| `fetching` | Pobieram zawartość zasobów... | 30% |
| `searching` | Przeszukuję dokumenty... | 45% |
| `calling_tool` | Wywołuję narzędzie {tool}... | 60% |
| `executing` | Generuję zawartość... | 75% |
| `finalizing` | Finalizuję odpowiedź... | 90% |
| `complete` | Gotowe | 100% |

### Server-Side Progress Store

The progress store uses Upstash Redis for persistence with an in-memory Map fallback when Redis is not configured:

```typescript
// src/server/progress-store.ts
export async function createJob(jobId: string): Promise<void>
export async function emitProgress(jobId: string, stage: ProgressStage, progress: number, tool?: string): Promise<void>
export async function logUser(jobId: string, message: string): Promise<void>
export async function logTechnical(jobId: string, message: string, level?: LogLevel): Promise<void>
export async function completeJob(jobId: string): Promise<void>
export async function errorJob(jobId: string, message: string): Promise<void>
export async function getJob(jobId: string): Promise<JobProgress | undefined>
export async function getEvents(jobId: string, fromId?: number): Promise<ProgressEvent[]>
```

### Client-Side Hook Usage

```typescript
// In component
const {
  jobId,
  stage,
  message,
  progress,
  userLogs,        // Filtered via useMemo
  technicalLogs,   // Filtered via useMemo
  connectionState,
  isComplete,
  error,
  startListening,
  stopListening,
  reset,
} = useRagProgress()

// Start listening before form submit
startListening()

// Include jobId in form data
<input type="hidden" name="jobId" value={jobId} />
```

### SSE Event Protocol

```
id: <incrementing-number>
event: <progress|log|complete|error>
retry: 3000
data: <json-payload>
```

### Key Implementation Details

1. **Async Redis Operations**: All progress-store functions are async and properly awaited in `rag-actions.ts`

2. **Log Filtering with useMemo**: Replaced Zustand selectors with `useMemo` to prevent infinite re-render loops:
   ```typescript
   const userLogs = useMemo(
     () => logs.filter((log) => log.audience === 'user' || !log.audience),
     [logs]
   )
   ```

3. **Connection Recovery**: SSE endpoint supports `Last-Event-ID` header for reconnection, sending missed events

4. **Keep-Alive**: Server sends heartbeat comments every 15 seconds to prevent proxy buffering

5. **Job TTL**: Jobs automatically expire after 5 minutes (300,000ms) to prevent memory leaks

### Environment Variables

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

When not configured, the system falls back to in-memory storage with a console warning.

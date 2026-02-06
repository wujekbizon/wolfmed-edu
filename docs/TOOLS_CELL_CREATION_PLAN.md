# AI-Powered Cell Creation Tools - Implementation Plan

**Date**: 2026-01-30
**Vision**: Hybrid approach - some tools create cells, some return formatted responses
**Status**: ✅ Week 1 Complete - Tools Implemented | ⚠️ Gemini API Limitation Discovered | ✅ Diagram Tool with Mermaid-to-Excalidraw

---

## ✅ LATEST UPDATE: Diagram Tool Implementation (2026-02-06)

### Mermaid-to-Excalidraw Approach

**Problem Solved**: LLMs cannot reliably predict pixel sizes for Excalidraw elements, resulting in overlapping text and cramped layouts.

**Solution**: Use Mermaid syntax for diagram generation, then convert to Excalidraw with automatic layout.

### Implementation Details

**Package Added**: `@excalidraw/mermaid-to-excalidraw`

**Flow**:
```
1. User: "/diagram utwórz schemat budowy serca"
2. Gemini generates Mermaid syntax (flowchart/sequence)
3. diagramTool returns: { cellType: 'draw', content: mermaidSyntax }
4. Excalidraw component detects Mermaid syntax
5. parseMermaidToExcalidraw() → skeleton elements
6. convertToExcalidrawElements() → actual elements with text binding
7. Cell updated with Excalidraw JSON
```

**Supported Diagram Types**:
- `flowchart` - processes, algorithms, decision trees, anatomy structures
- `sequence` - time-based interactions, signaling cascades, drug metabolism
- `class` - (commented out, available for future use)

**Key Files**:
- `templates/mermaid-template.json` - Prompt template with examples for each diagram type
- `src/server/tools/executor.ts` - `diagramTool()` generates Mermaid via Gemini
- `src/components/excalidraw/Excalidraw.tsx` - Detects Mermaid, converts to Excalidraw

**Mermaid Detection** (`Excalidraw.tsx`):
```typescript
function isMermaidSyntax(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith('flowchart') ||
           trimmed.startsWith('graph') ||
           trimmed.startsWith('sequenceDiagram') ||
           trimmed.startsWith('classDiagram');
}
```

**Conversion** (`Excalidraw.tsx`):
```typescript
const { elements: skeletonElements, files } = await parseMermaidToExcalidraw(cellContent);
const elements = convertToExcalidrawElements(skeletonElements);
```

**Why This Works**:
- Mermaid handles layout automatically (no pixel guessing)
- Text always fits in shapes
- Consistent spacing and connections
- LLM only needs to know Mermaid syntax (well-documented)

---

## ⚠️ CRITICAL LIMITATION: Gemini API FileSearch + Function Calling Conflict

**Date Discovered**: 2026-01-30
**Issue**: Known bug in Gemini 2.5 Pro API when combining `fileSearch` with `functionDeclarations`

### The Problem

When Gemini API's `generateContent` includes BOTH `fileSearch` tool AND custom `functionDeclarations`, the model incorrectly returns a `functionCall` with name `"query"` instead of performing file search or calling the intended custom tools.

**Official Bug Report**: [Gemini 2.5 Pro file_search and function_declarations issue](https://discuss.ai.google.dev/t/title-gemini-2-5-pro-file-search-and-function-declarations/109436) (November 2025)

**Expected Behavior**:
- FileSearch should automatically ground responses using document store
- Custom tools (notatka_tool, utworz_test, etc.) should be callable when appropriate
- Both should work together seamlessly

**Actual Behavior**:
- When both are enabled, Gemini calls an unknown `"query"` function
- This is NOT in our function declarations list
- Our custom tools are never called
- FileSearch doesn't execute automatically

**Workaround Attempted (Failed)**:
```typescript
// Added handler for 'query' tool
case 'query':
  return {
    content: 'File search is already active...',
    metadata: { autoHandled: true }
  }
```
Result: Gemini continues calling `query` instead of custom tools, even with explicit keyword detection and guidance prompts.

### Root Cause Analysis

The Gemini API appears to expose fileSearch as a callable tool named `"query"` when `functionDeclarations` are also present. This creates tool selection conflict where Gemini must choose between:
1. `query` (file search)
2. `notatka_tool` (custom)
3. `utworz_test` (custom)
4. etc.

When user asks "Stwórz notatkę o fizjologii", Gemini interprets this as:
- "User needs information about fizjologia" → calls `query`
- Instead of: "User wants to CREATE a note" → calls `notatka_tool`

### Community Reports

Multiple developers have reported this issue:
- When both tools work individually but fail when combined
- Documentation search fails when both are enabled
- Forum post: [Combining fileSearch e functionDeclarations](https://discuss.ai.google.dev/t/combining-filesearch-e-functiondeclarations-in-gemini-api/111146)

### Google's Official Position

No official fix or workaround documented as of 2026-01-30. The feature is marked as supported in Gemini 3 models, but the bug persists in practice.

---

## ✅ OUR SOLUTION: Hybrid Slash Command Approach

Since Gemini API has this limitation, we're implementing a **two-phase execution pattern** triggered by explicit user commands.

### Architecture Decision

**Hybrid Approach**: Combine automatic RAG with explicit tool invocation

**Phase 1: RAG Retrieval** (Always happens)
```
User: "/notatka Stwórz notatkę o działach w fizjologii"
↓
1. Detect /notatka command
2. Extract topic: "działach w fizjologii"
3. Perform fileSearch FIRST (without custom tools)
4. Retrieve relevant documents → text content
```

**Phase 2: Tool Execution** (Only when slash command detected)
```
5. Disable fileSearch for this call
6. Call Gemini with ONLY custom tools enabled
7. Pass RAG results as 'content' parameter to tool
8. Gemini MUST use specified tool (no fileSearch option available)
9. Tool generates content → cellType + content
10. Create cell in UI
```

### User Flow with Slash Commands

**Available Commands**:
- `/notatka` - Create note cell (50-150 words)
- `/utworz` - Generate test questions JSON (response only)
- `/podsumuj` - Generate summary (response only)
- `/diagram` - Create diagram cell (Excalidraw)

**Example: Create Note**
```
User types: "/notatka Stwórz notatkę o działach w fizjologii"

System:
1. Detects /notatka command
2. Searches docs for "działach w fizjologii" → gets content
3. Calls Gemini with ONLY notatka_tool enabled
4. Passes doc content as tool parameter
5. Tool generates note content
6. Creates note cell automatically
7. User can edit and save
```

**Example: Without Command (Regular RAG)**
```
User types: "Jakie są działy w fizjologii?"

System:
1. No slash command detected
2. Uses fileSearch normally (no custom tools)
3. Returns grounded answer from documents
4. No cell creation
```

### Implementation Details

**Slash Command Detection** (`parse-mcp-commands.ts`):
```typescript
const toolPattern = /\/(utworz|notatka|podsumuj|diagram)/gi;
```

**Conditional Tool Enabling** (`rag-actions.ts`):
```typescript
const { cleanQuestion, resources, tools } = parseMcpCommands(question)

if (tools.includes('notatka')) {
  // Two-phase approach
  // 1. Get RAG content first
  const ragContent = await manualFileSearch(cleanQuestion)

  // 2. Call with ONLY custom tools (no fileSearch)
  const result = await callGeminiWithTools(
    cleanQuestion,
    ragContent,
    [NOTATKA_TOOL_DEFINITION] // Only this tool, no fileSearch
  )
}
```

### Why This Solution Works

**Advantages**:
1. **Explicit user intent**: Slash commands make tool usage clear
2. **No tool selection conflict**: Only one tool enabled at a time
3. **RAG still works**: We get document context first, manually
4. **Reliable execution**: No guessing which tool Gemini should use
5. **User control**: Users choose when to create content vs ask questions

**Trade-offs**:
1. **User training needed**: Users must learn slash commands
2. **Less automatic**: Can't auto-detect "create note" intent
3. **Two API calls**: One for RAG, one for tool execution
4. **Hybrid complexity**: More conditional logic in code

### Alternative Approaches Considered

**Option 1: Keyword Detection Only** ❌
- Tried detecting "stwórz", "utwórz", "wygeneruj" + content type
- Added explicit guidance prompts to Gemini
- Failed: Gemini still called `query` instead of custom tools
- Unreliable for production use

**Option 2: Separate Gemini Model for Routing** ❌
- Use secondary Gemini call to determine intent
- Route to either fileSearch OR custom tools
- Rejected: Added latency, complexity, and cost
- Still doesn't solve underlying API bug

**Option 3: Wait for Google to Fix** ❌
- Monitor official bug reports and changelogs
- Implement workarounds until fixed
- Rejected: No ETA on fix, blocks development

**Option 4: Use Different LLM for Tools** ❌
- Keep Gemini for RAG, use Claude/GPT for tools
- Rejected: Added complexity, multiple API keys, inconsistent behavior

### Future: Automatic Intent Detection

Once Google fixes the API bug, we can enhance to automatic mode:
```typescript
// Future: No slash commands needed
User: "Stwórz notatkę o fizjologii"
System: Auto-detects intent, uses notatka_tool directly
```

Until then, slash commands provide reliable, explicit control.

---

### References

- [Gemini 2.5 Pro file_search and function_declarations issue](https://discuss.ai.google.dev/t/title-gemini-2-5-pro-file-search-and-function-declarations/109436)
- [File Search Tool Documentation](https://ai.google.dev/gemini-api/docs/file-search)
- [Introducing File Search Tool](https://blog.google/technology/developers/file-search-gemini-api/)
- [Combining fileSearch and functionDeclarations](https://discuss.ai.google.dev/t/combining-filesearch-e-functiondeclarations-in-gemini-api/111146)

---

## 🎯 Core Concept

**Hybrid Approach**: Some tools create cells, some return formatted responses

**Response-Only Tools** (`/utworz`, `/podsumuj`):
```
User: "@cardiology.pdf /utworz 10"
AI: Generates test questions JSON
UI: Shows formatted JSON in RAG response
User: Copies JSON for test import
```

**Cell-Creating Tools** (`/notatka`, `/diagram`):
```
User: "@cardiology.pdf /notatka"
AI: Generates note content
UI: Opens DRAFT note cell with content
User: Reviews, edits, approves
System: Saves cell to database
```

**Key Insight**:
- Response tools = Immediate consumption (copy, read)
- Cell tools = Long-term editing and reference

---

## 🛠️ Tool Definitions

### 1. `/utworz` - Generate Test Questions (Response Only)

**Purpose**: Generate multiple-choice test questions in Wolfmed JSON format
**Behavior**: Returns JSON in RAG response for user to copy (does NOT create cell)

**Input**:
```typescript
{
  questionCount: number;
  category?: string;
  content: string;  // From PDF/note content
}
```

**Output** (Tool Result):
```typescript
{
  content: JSON.stringify({
    questions: [
      {
        id: "uuid",
        meta: { course: "medycyna", category: "cardiology" },
        data: {
          question: "Jakie jest główne zadanie serca?",
          answers: [
            { option: "...", isCorrect: false },
            { option: "...", isCorrect: true }
          ]
        }
      }
    ]
  }, null, 2),  // Pretty-printed JSON
  metadata: {
    count: 10,
    category: 'cardiology',
    displayFormat: 'json'
  }
}
```

**User Flow**:
```
User: "@cardiology.pdf /utworz 10 pytań o anatomii serca"
↓
Gemini calls utworz_tool(questionCount: 10, category: 'cardiology', content: PDF)
↓
Tool generates 10 test questions in JSON format
↓
RAG response shows formatted JSON
↓
User copies JSON and uses separate test import flow
```

**Why No Cell**: Tests have a dedicated import system, JSON is shown for copying

---

### 2. `/podsumuj` - Generate Summary (Response Only)

**Purpose**: Generate comprehensive summary of provided resource(s)
**Behavior**: Returns markdown summary in RAG response (does NOT create cell)

**Input**:
```typescript
{
  content: string;  // Resource content to summarize
}
```

**Output**:
```typescript
{
  content: "# Podsumowanie: Kardiologia\n\n## Kluczowe punkty:\n- Anatomia serca...\n- Cykl sercowy...",
  metadata: {
    type: 'summary',
    wordCount: 250
  }
}
```

**User Flow**:
```
User: "@cardiology.pdf /podsumuj"
↓
Gemini calls podsumuj_tool with PDF content
↓
Tool generates structured summary (headings, bullet points)
↓
RAG response shows formatted summary
↓
User reads summary in chat interface
```

**Why No Cell**: Summary is for immediate consumption, displayed in RAG response

---

### 3. `/notatka` - Create Quick Note Cell ✅

**Purpose**: Extract key information and create concise note
**Behavior**: Creates note cell for user editing and saving

**Input**:
```typescript
{
  content: string;
  focus?: string;  // Optional: what to focus on
}
```

**Output**:
```typescript
{
  cellType: "note",  // Creates note cell!
  content: "# Szybka notatka\n\n**Serce**: Mięsień pompujący krew...\n**Anatomia**: 4 komory...",
  metadata: {
    type: 'quick-note',
    wordCount: 87
  }
}
```

**User Flow**:
```
User: "@cardiology.pdf /notatka heart anatomy"
↓
Gemini calls notatka_tool(content: PDF, focus: 'heart anatomy')
↓
Tool generates concise note (50-150 words)
↓
UI opens DRAFT note cell
↓
User reviews, edits as needed
↓
User clicks "Approve & Save" → Note cell created in database
```

**Why Cell**: Notes are meant for further editing and long-term reference

**Difference from /podsumuj**:
- `/podsumuj`: Longer summary (200-500 words), shown in response
- `/notatka`: Quick note (50-150 words), creates editable cell

---

### 4. `/diagram` - Create Excalidraw Diagram Cell ✅

**Purpose**: Generate visual diagram from resource content
**Behavior**: Creates draw cell with Excalidraw JSON

**Input**:
```typescript
{
  content: string;
  diagramType?: 'flowchart' | 'anatomy' | 'concept-map' | 'timeline';
  focus?: string;  // e.g., "cardiac cycle", "heart anatomy"
}
```

**Output**:
```typescript
{
  cellType: "draw",  // Creates draw cell!
  content: JSON.stringify({
    elements: [
      {
        id: "rect1",
        type: "rectangle",
        x: 100,
        y: 100,
        width: 180,
        height: 80,
        strokeColor: "#1e1e1e",
        backgroundColor: "#a5d8ff",
        // ... full Excalidraw element props
      },
      {
        id: "text1",
        type: "text",
        text: "Serce",
        x: 130,
        y: 125,
        fontSize: 20,
        // ... text props
      },
      {
        id: "arrow1",
        type: "arrow",
        x: 280,
        y: 140,
        points: [[0, 0], [100, 0]],
        // ... arrow props
      }
    ],
    appState: {
      viewBackgroundColor: "#ffffff"
    }
  }),
  metadata: {
    type: 'flowchart'
  }
}
```

**User Flow**:
```
User: "@anatomy.pdf /diagram cardiac cycle flowchart"
↓
Gemini calls diagram_tool(content: PDF, diagramType: 'flowchart')
↓
Tool loads Excalidraw template structure
↓
Gemini generates diagram JSON based on template
↓
UI opens DRAFT draw cell with diagram
↓
User edits diagram in Excalidraw (move, resize, add elements)
↓
User clicks "Approve & Save" → Draw cell created in database
```

**Why Cell**: Diagrams are complex visual content that needs editing
**Template**: Uses `/docs/Excalidraw_Mock_Template.json` as structure reference

---

## 🏗️ Architecture: Tool → Cell Creation Flow

### Complete Data Flow:

```
┌─────────────────────────────────────────────────────────┐
│  USER INPUT                                             │
│  "@cardiology.pdf /notatka create note about heart"    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  PARSE & RESOLVE                                        │
│  - resources: ["cardiology.pdf"]                        │
│  - tools: ["notatka"]                                   │
│  - Fetch PDF content → 50KB text                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  GEMINI RAG QUERY                                       │
│  - Question: "create note about heart"                  │
│  - Context: PDF content                                 │
│  - Tools available: [notatka_tool, utworz_tool, ...]   │
│                                                          │
│  Gemini Decision:                                       │
│  "User wants note → I should call notatka_tool"         │
│                                                          │
│  Response:                                              │
│  {                                                       │
│    functionCalls: [{                                    │
│      name: "notatka_tool",                             │
│      args: { content: "...", focus: "heart" }          │
│    }]                                                   │
│  }                                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  TOOL EXECUTION (Server-Side)                           │
│                                                          │
│  notatka_tool({ content: "...", focus: "heart" })      │
│    ↓                                                     │
│  Call Gemini with structured prompt:                    │
│    "Extract key information about heart anatomy.        │
│     Format as concise note with:                        │
│     - Heading                                           │
│     - Key definitions (bold)                            │
│     - Important points (bullet list)                    │
│     Keep under 150 words."                              │
│    ↓                                                     │
│  Gemini returns formatted note content                  │
│    ↓                                                     │
│  Return:                                                 │
│  {                                                       │
│    cellType: "note",                                    │
│    content: "# Heart Anatomy\n\n**Serce**: ...",        │
│    metadata: { type: 'quick-note', source: '...' }     │
│  }                                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  SEND RESULT BACK TO GEMINI (Multi-Turn)                │
│                                                          │
│  ai.models.generateContent({                             │
│    contents: [                                           │
│      { text: original question },                       │
│      { functionResponse: { name, response: {...} } }    │
│    ]                                                     │
│  })                                                      │
│                                                          │
│  Final Response:                                         │
│  {                                                       │
│    answer: "I've created a concise note about heart     │
│             anatomy based on your PDF. You can review   │
│             and edit it below.",                        │
│    toolResults: [{                                       │
│      name: "notatka_tool",                              │
│      response: {                                         │
│        cellType: "note",                                │
│        content: "# Heart Anatomy\n\n...",               │
│        metadata: {...}                                   │
│      }                                                   │
│    }]                                                    │
│  }                                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  UI - DRAFT CELL RENDERING                              │
│                                                          │
│  RagCellForm receives response with toolResults         │
│    ↓                                                     │
│  Detects cellType: "note" in toolResults                │
│    ↓                                                     │
│  Creates DRAFT cell (not in database yet):              │
│  {                                                       │
│    id: "draft-temp-uuid",                               │
│    type: "note",                                        │
│    content: "# Heart Anatomy\n\n...",                   │
│    isDraft: true  ← Special flag                        │
│  }                                                       │
│    ↓                                                     │
│  Renders DraftCellPreview component:                    │
│  ┌──────────────────────────────────────────────┐      │
│  │  📝 Draft Note Created                        │      │
│  │  ────────────────────────────────────────────│      │
│  │  # Heart Anatomy                              │      │
│  │                                                │      │
│  │  **Serce**: Mięsień pompujący krew...        │      │
│  │  **Anatomia**: 4 komory (2 przedsionki...)   │      │
│  │                                                │      │
│  │  [Edit] [Approve & Save] [Discard]           │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  User Actions:                                           │
│  - Click "Edit" → Opens NoteCell in edit mode          │
│  - Click "Approve & Save" → Calls server action        │
│  - Click "Discard" → Removes draft                     │
└────────────────────┬────────────────────────────────────┘
                     │ User clicks "Approve & Save"
                     ↓
┌─────────────────────────────────────────────────────────┐
│  SERVER ACTION - CREATE CELL                            │
│                                                          │
│  createCellFromDraft(cellData)                          │
│    ↓                                                     │
│  Generate permanent UUID                                │
│    ↓                                                     │
│  Add to user's cells:                                   │
│  {                                                       │
│    cells: {                                             │
│      ...existingCells,                                  │
│      "new-uuid": {                                      │
│        id: "new-uuid",                                  │
│        type: "note",                                    │
│        content: "# Heart Anatomy\n\n..."                │
│      }                                                   │
│    },                                                    │
│    order: [...existingOrder, "new-uuid"]                │
│  }                                                       │
│    ↓                                                     │
│  Save to database (updateUserCellsList)                 │
│    ↓                                                     │
│  Return success                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  UI UPDATE                                              │
│  - Draft cell replaced with permanent cell              │
│  - Cell appears in CellList                             │
│  - User can now edit normally via NoteCell              │
│  - Success toast: "Note saved successfully!"           │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 New Cell Type: "test"

Since we're creating tests via `/utworz`, we need a test cell type:

**Add to cellTypes.ts**:
```typescript
export type CellTypes = "note" | "rag" | "draw" | "test"
```

**Test Cell Component** (`src/components/cells/TestCell.tsx`):
```typescript
import { Cell } from '@/types/cellTypes'
import { useCellsStore } from '@/store/useCellsStore'

interface TestQuestion {
  id: string;
  meta: { course: string; category: string };
  data: {
    question: string;
    answers: { option: string; isCorrect: boolean }[];
  };
}

export default function TestCell({ cell }: { cell: Cell }) {
  const cellContent = useCellsStore((s) => s.data[cell.id]?.content)
  const questions: { questions: TestQuestion[] } = cellContent
    ? JSON.parse(cellContent)
    : { questions: [] }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Test ({questions.questions.length} pytań)</h3>

      {questions.questions.map((q, idx) => (
        <div key={q.id} className="border p-4 rounded">
          <p className="font-semibold">{idx + 1}. {q.data.question}</p>
          <div className="mt-2 space-y-1">
            {q.data.answers.map((ans, aidx) => (
              <label key={aidx} className="flex items-center gap-2">
                <input type="radio" name={`q-${idx}`} />
                <span className={ans.isCorrect ? 'text-green-600 font-medium' : ''}>
                  {ans.option}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="px-4 py-2 bg-blue-500 text-white rounded">
        Save Test to Database
      </button>
    </div>
  )
}
```

**Add to CellListItem.tsx**:
```typescript
{cell.type === 'test' && (
  <div className="border border-zinc-400/20 p-1.5 rounded bg-red-300/30">
    <div className="relative h-10 w-full">
      <ActionBar cell={cell} />
    </div>
    <DynamicTestCell cell={cell} />
  </div>
)}
```

---

## 🔧 Implementation Tasks

### Week 1: Core Infrastructure

**Day 1-2: Multi-Turn Tool Execution**
- [ ] Implement multi-turn pattern in `google-rag.ts`
- [ ] Add tool executor in `src/server/tools/executor.ts`
- [ ] Test function call → execution → result back to Gemini

**Day 3-4: Draft Cell System**
- [ ] Create `DraftCellPreview` component
- [ ] Add draft cell state to `useCellsStore`
- [ ] Implement approve/discard actions
- [ ] Create `createCellFromDraft` server action

**Day 5: Test Cell Type**
- [ ] Add "test" to CellTypes
- [ ] Create `TestCell.tsx` component
- [ ] Add dynamic import for TestCell
- [ ] Test rendering test questions

---

### Week 2: Tool Implementations

**Day 1-2: `/utworz` Tool**
- [ ] Create `/src/server/tools/utworz-tool.ts`
- [ ] Load template from `/templates/wolfmed-test-format.json`
- [ ] Generate test questions with Gemini
- [ ] Return cellType: "test" with questions JSON
- [ ] Test: "@cardiology.pdf /utworz 5 pytań"

**Day 3: `/notatka` Tool**
- [ ] Create `/src/server/tools/notatka-tool.ts`
- [ ] Prompt: "Extract key information as concise note"
- [ ] Return cellType: "note" with markdown content
- [ ] Test: "@anatomy.pdf /notatka heart structure"

**Day 4: `/podsumuj` Tool**
- [ ] Create `/src/server/tools/podsumuj-tool.ts`
- [ ] Prompt: "Create comprehensive summary with headings"
- [ ] Return cellType: "note" with structured summary
- [ ] Test: "@lecture.pdf /podsumuj"

**Day 5: `/draw` Tool (MVP)**
- [ ] Create `/src/server/tools/draw-tool.ts`
- [ ] Start with simple template-based approach
- [ ] Pre-built templates for: flowchart, anatomy, concept-map
- [ ] Return cellType: "draw" with Excalidraw JSON
- [ ] Test: "@process.pdf /draw flowchart"

---

### Week 3: Polish & Production

**Day 1-2: Material PDF Extraction**
- [ ] Implement PDF text extraction in `fetchResourceContent`
- [ ] Use Gemini File API for PDF parsing
- [ ] Apply 50KB truncation limit
- [ ] Cache extracted text in database (optional)

**Day 3: Error Handling & UX**
- [ ] Loading states for tool execution
- [ ] Error messages for failed tool calls
- [ ] Retry mechanisms
- [ ] Toast notifications for success/error

**Day 4: Testing & Bug Fixes**
- [ ] Test all tools with different resources
- [ ] Test draft cell approval flow
- [ ] Test cell persistence
- [ ] Fix edge cases

**Day 5: Documentation & Cleanup**
- [ ] Remove debug logging
- [ ] Update user documentation
- [ ] Code cleanup and optimization
- [ ] Deploy to production

---

## 📊 Tool Implementation Details

### Tool Structure Pattern

```typescript
// src/server/tools/notatka-tool.ts
import { GoogleGenAI } from '@google/genai';

interface NotatkaTool Input {
  content: string;
  focus?: string;
}

interface ToolResult {
  cellType: 'note' | 'test' | 'draw';
  content: string;
  metadata?: Record<string, any>;
}

export async function notatkaTool(args: NotatkaToolInput): Promise<ToolResult> {
  const { content, focus = '' } = args;

  // Build prompt
  const prompt = `
Extract key information from this content and create a concise note.
${focus ? `Focus specifically on: ${focus}` : ''}

Content:
${content}

Requirements:
- Use clear headings (# and ##)
- Bold important terms (**term**)
- Bullet points for lists
- Keep under 150 words
- Write in Polish

Return ONLY the markdown note content, no additional commentary.
`;

  // Call Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.7
    }
  });

  const noteContent = response.candidates[0].content.parts[0].text;

  return {
    cellType: 'note',
    content: noteContent.trim(),
    metadata: {
      type: 'quick-note',
      wordCount: noteContent.split(/\s+/).length,
      generatedAt: new Date().toISOString()
    }
  };
}
```

---

## 🎨 UI Components

### DraftCellPreview Component

```typescript
// src/components/cells/DraftCellPreview.tsx
'use client'

import { useState } from 'react'
import { Cell } from '@/types/cellTypes'
import { DynamicNoteCell, DynamicTestCell, DynamicExcalidraw } from '.'
import { useCellsStore } from '@/store/useCellsStore'
import { createCellFromDraft } from '@/actions/cells'

interface DraftCellPreviewProps {
  draftCell: Cell & { isDraft: true };
  onApprove: () => void;
  onDiscard: () => void;
}

export default function DraftCellPreview({
  draftCell,
  onApprove,
  onDiscard
}: DraftCellPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    try {
      await createCellFromDraft(draftCell);
      onApprove();
    } catch (error) {
      console.error('Failed to create cell:', error);
      alert('Failed to save cell');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {draftCell.type === 'note' && '📝'}
            {draftCell.type === 'test' && '📋'}
            {draftCell.type === 'draw' && '🎨'}
          </span>
          <div>
            <h3 className="font-bold text-lg">Draft {draftCell.type} Created</h3>
            <p className="text-sm text-gray-600">Review and approve to save</p>
          </div>
        </div>
      </div>

      {/* Render appropriate cell component */}
      <div className="mb-4 border rounded p-2 bg-white">
        {draftCell.type === 'note' && <DynamicNoteCell cell={draftCell} />}
        {draftCell.type === 'test' && <DynamicTestCell cell={draftCell} />}
        {draftCell.type === 'draw' && <DynamicExcalidraw cell={draftCell} />}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : '✓ Approve & Save'}
        </button>
        <button
          onClick={onDiscard}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          ✕ Discard
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Scenarios

### Test 1: Create Note from PDF
```
User: "@cardiology.pdf /notatka heart anatomy"
Expected:
- Tool extracts key info about heart anatomy
- Draft note cell appears with markdown content
- User approves → Note saved to database
```

### Test 2: Generate Test Questions
```
User: "@exam-prep.pdf /utworz 5 easy questions"
Expected:
- Tool generates 5 easy multiple-choice questions
- Draft test cell appears with questions
- User reviews, approves → Test saved
```

### Test 3: Create Summary
```
User: "@lecture.pdf /podsumuj comprehensive summary"
Expected:
- Tool creates structured summary with headings
- Draft note cell appears
- User edits summary, approves → Saved
```

### Test 4: Generate Diagram
```
User: "@process.pdf /draw flowchart of patient intake"
Expected:
- Tool generates simple flowchart in Excalidraw format
- Draft draw cell appears with editable diagram
- User adjusts diagram, approves → Saved
```

---

## ✅ Success Criteria

1. **Tool Execution**: All 4 tools execute successfully
2. **Draft Cells**: Draft cells render correctly for each type
3. **User Approval**: Approve flow saves cells to database
4. **Edit Before Save**: Users can edit draft cells before approving
5. **Discard Works**: Discarding draft doesn't create database entry
6. **Multi-Resource**: Tools work with multiple @ resources
7. **Error Handling**: Clear errors when tools fail
8. **UX**: Smooth, intuitive flow from query → draft → approval → saved cell

---

## 🚀 Future Enhancements

**Phase 2 Tools**:
- `/quiz` - Interactive quiz cell (new cell type)
- `/flashcards` - Flashcard deck cell (new cell type)
- `/timeline` - Timeline diagram cell
- `/concept-map` - Mind map cell

**Advanced Features**:
- Multi-cell generation (one query creates multiple cells)
- Cell templates (user-defined formats)
- Cell linking (reference cells within cells)
- Collaborative editing on draft cells
- Version history for cells

---

**Status**: Ready for implementation. Start with multi-turn execution + draft cell system.

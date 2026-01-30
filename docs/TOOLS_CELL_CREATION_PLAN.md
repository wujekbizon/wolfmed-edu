# AI-Powered Cell Creation Tools - Implementation Plan

**Date**: 2026-01-29
**Vision**: Tools that create cells for user approval, not just formatted responses
**Status**: Architecture Finalized

---

## 🎯 Core Concept

**Traditional Approach** (What we DON'T want):
```
User: "Summarize this PDF"
AI: Returns text summary in chat
User: Copies to note manually
```

**Our Approach** (Cell-First AI Assistant):
```
User: "@cardiology.pdf /notatka"
AI: Reads PDF, creates summary
UI: Opens DRAFT note cell with content
User: Reviews, edits, approves
System: Saves cell to database
```

**Key Insight**: Tools **generate cells** as draft outputs. User always has final approval before persistence.

---

## 🛠️ Tool Definitions

### 1. `/utworz` - Create Test Cell

**Purpose**: Generate multiple-choice test questions in Wolfmed JSON format

**Input**:
```typescript
{
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  context: string;  // From PDF/note content
}
```

**Output** (Tool Result):
```typescript
{
  cellType: "test",  // New cell type for tests
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
  }),
  metadata: {
    count: 10,
    difficulty: 'medium',
    source: '@cardiology.pdf'
  }
}
```

**User Flow**:
```
User: "@cardiology.pdf /utworz 10 pytań o anatomii serca"
↓
Gemini calls utworz_tool(questionCount: 10, category: 'anatomy')
↓
Tool generates 10 test questions
↓
UI opens DRAFT test cell (type: "test")
↓
User reviews questions, can edit/delete
↓
User clicks "Save Test" → Creates test in database
```

---

### 2. `/podsumuj` - Create Summary Note Cell

**Purpose**: Generate comprehensive summary of provided resource(s)

**Input**:
```typescript
{
  content: string;     // Resource content to summarize
  maxLength?: number;  // Optional word limit
  format?: 'bullet' | 'paragraph';
}
```

**Output**:
```typescript
{
  cellType: "note",
  content: "# Podsumowanie: Kardiologia\n\n## Kluczowe punkty:\n- Anatomia serca...\n- Cykl sercowy...",
  metadata: {
    type: 'summary',
    wordCount: 250,
    source: '@cardiology.pdf'
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
UI opens DRAFT note cell
↓
User reviews, adds own notes
↓
User clicks "Save Note" → Note saved to database
```

---

### 3. `/notatka` - Create Short Note Cell

**Purpose**: Extract key information and create concise note

**Input**:
```typescript
{
  content: string;
  focus?: string;  // Optional: what to focus on ("key terms", "definitions", etc.)
}
```

**Output**:
```typescript
{
  cellType: "note",
  content: "# Szybka notatka\n\n**Serce**: Mięsień pompujący krew...\n**Anatomia**: 4 komory...",
  metadata: {
    type: 'quick-note',
    source: '@cardiology.pdf'
  }
}
```

**Difference from /podsumuj**:
- `/podsumuj`: Comprehensive summary, structured, 200-500 words
- `/notatka`: Quick reference, key points only, 50-150 words

---

### 4. `/draw` - Create Excalidraw Diagram Cell

**Purpose**: Generate visual diagram from resource content

**Input**:
```typescript
{
  content: string;
  diagramType: 'flowchart' | 'anatomy' | 'concept-map' | 'timeline';
  focus: string;  // e.g., "cardiac cycle", "heart anatomy"
}
```

**Output**:
```typescript
{
  cellType: "draw",
  content: JSON.stringify({
    elements: [
      // Excalidraw elements (rectangles, arrows, text)
      {
        type: "rectangle",
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        backgroundColor: "#fff",
        strokeColor: "#000",
        // ... other Excalidraw props
      },
      {
        type: "arrow",
        x: 300,
        y: 150,
        // ...
      },
      {
        type: "text",
        text: "Serce",
        x: 150,
        y: 130,
        fontSize: 20
      }
    ],
    appState: {
      viewBackgroundColor: "#ffffff"
    }
  }),
  metadata: {
    diagramType: 'anatomy',
    source: '@cardiology.pdf'
  }
}
```

**User Flow**:
```
User: "@anatomy.pdf /draw cardiac cycle diagram"
↓
Gemini calls draw_tool
↓
Tool parses content, generates Excalidraw JSON:
  - Boxes for heart chambers
  - Arrows for blood flow
  - Labels for anatomical structures
↓
UI opens DRAFT draw cell with diagram
↓
User can edit diagram in Excalidraw (move elements, add annotations)
↓
User clicks "Save Diagram" → Draw cell saved to database
```

**Challenge**: Excalidraw JSON generation is complex. Solutions:
1. **Use templates**: Pre-built diagram templates for common medical concepts
2. **LLM-assisted generation**: Gemini generates simplified structure, we convert to Excalidraw format
3. **Iterative approach**: Start with basic shapes, improve over time

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

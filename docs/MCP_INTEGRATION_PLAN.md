# MCP Integration Plan - Wolfmed RAG Enhancement

**Date**: 2026-01-29 | **Updated**: 2026-01-30
**Branch**: `claude/add-comment-guidelines-nWvcg`
**Status**: ✅ @ Resources MVP Complete | ✅ Autocomplete Complete | ✅ DisplayName Resolution Complete | ⚠️ Gemini API Limitation Discovered

---

## ⚠️ IMPORTANT UPDATE (2026-01-30): Gemini API Limitation

**Critical Issue Discovered**: Gemini 2.5 Pro has a known bug when combining `fileSearch` with custom `functionDeclarations`. When both are enabled simultaneously, the model incorrectly calls a non-existent `"query"` function instead of performing file search or calling our custom tools.

**Impact**: Cannot implement fully automatic tool selection as originally planned.

**Solution**: Implementing hybrid slash command approach where users explicitly trigger tools with `/notatka`, `/utworz`, `/diagram`, `/podsumuj` commands. This uses a two-phase execution pattern:
1. RAG retrieval first (fileSearch only)
2. Tool execution second (custom tools only, no fileSearch)

**For Full Details**: See [TOOLS_CELL_CREATION_PLAN.md - Gemini API Limitation Section](./TOOLS_CELL_CREATION_PLAN.md#️-critical-limitation-gemini-api-filesearch--function-calling-conflict)

**References**:
- [Official Bug Report (Google AI Forum)](https://discuss.ai.google.dev/t/title-gemini-2-5-pro-file-search-and-function-declarations/109436)
- [Community Discussion](https://discuss.ai.google.dev/t/combining-filesearch-e-functiondeclarations-in-gemini-api/111146)

---

## 🎯 Current Implementation Status (2026-01-29)

### ✅ What's Working:

1. **@ Resource Commands** - Users can reference docs, notes, and materials
   - Parser extracts `@displayName` from input (e.g., `@test`, `@anatomy`, `@MCP_INTEGRATION_PLAN`)
   - Autocomplete dropdown shows available resources when typing `@`
   - DisplayName → URI resolution system working
   - Content fetching from multiple sources (docs, database notes, materials placeholder)

2. **Resource Autocomplete UI**
   - Dropdown appears when user types `@`
   - Keyboard navigation (↑↓, Enter, Escape)
   - Filters resources as user types
   - Inserts user-friendly displayName (not ugly URI)
   - Polish language, zinc theme styling

3. **MCP Server Foundation**
   - HTTP-based MCP server at `/api/mcp`
   - `/read` tool for fetching markdown files from `/docs` folder
   - Resources API at `/api/mcp/resources`
   - 50KB file size truncation limit

4. **Database Integration**
   - User notes fetched from database (`getNoteById`)
   - Materials listed in autocomplete (content fetch placeholder)
   - Proper user authentication and authorization

### 🚧 What Needs Work:

1. **Material Content Fetching** - Placeholder exists, needs PDF/file content extraction
2. **/ Tool Implementations** - Definitions exist but no actual execution logic
3. **Cell Persistence** - Response saving not yet implemented
4. **Error Handling** - Need better UX for failed resource resolution

---

## 🏗️ Architecture Overview

### Data Flow Diagram:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                  │
│                                                                          │
│  RagCellForm (src/components/cells/RagCellForm.tsx)                    │
│  ┌────────────────────────────────────────────────────────┐            │
│  │ Textarea: "explain heart @test /utworz"                 │            │
│  │                                                          │            │
│  │ [ResourceAutocomplete] ← Shows when user types @       │            │
│  │  ┌─────────────────────────────────────┐              │            │
│  │  │ 📝 test (Note)                       │ ← displayName│            │
│  │  │ 📄 MCP INTEGRATION PLAN (Document)   │              │            │
│  │  │ 📚 anatomy (Material)                │              │            │
│  │  └─────────────────────────────────────┘              │            │
│  └────────────────────────────────────────────────────────┘            │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ Form Submit
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVER ACTION LAYER                                 │
│                                                                          │
│  askRagQuestion (src/actions/rag-actions.ts)                           │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ 1. Parse: parseMcpCommands(input)                         │          │
│  │    → cleanQuestion: "explain heart"                       │          │
│  │    → resources: ["test"]                                  │          │
│  │    → tools: ["utworz"]                                    │          │
│  │                                                            │          │
│  │ 2. Resolve: resolveDisplayNameToUri("test", userId)      │          │
│  │    → Fetch /api/mcp/resources                             │          │
│  │    → Match "test" → "note://06a33d39-..."                 │          │
│  │                                                            │          │
│  │ 3. Fetch: fetchResourceContent(uri, userId)              │          │
│  │    → note:// → getNoteById(id, userId)                    │          │
│  │    → material:// → [placeholder]                          │          │
│  │    → docs:// → MCP /read tool                             │          │
│  │                                                            │          │
│  │ 4. Query: queryWithFileSearch(question, context, tools)  │          │
│  │    → Send to Gemini with additional context               │          │
│  └──────────────────────────────────────────────────────────┘          │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        RESOURCE LAYER                                    │
│                                                                          │
│  /api/mcp/resources (GET)                                               │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ Aggregates all resource types:                            │          │
│  │                                                            │          │
│  │ 1. MCP Docs (from /docs folder)                          │          │
│  │    mcpServer.readResource('docs://list')                 │          │
│  │    → Returns: [{name: "file.md", displayName: "file"}]   │          │
│  │                                                            │          │
│  │ 2. User Notes (from database)                            │          │
│  │    getAllUserNotes(userId)                                │          │
│  │    → Returns: [{name: "note://id", displayName: "test"}] │          │
│  │                                                            │          │
│  │ 3. User Materials (from database)                        │          │
│  │    getMaterialsByUser(userId)                             │          │
│  │    → Returns: [{name: "material://id", displayName: ...}]│          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  /api/mcp (POST) - MCP Tool Execution                                   │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ Handles tool calls:                                       │          │
│  │ - read: Fetch file from /docs folder (50KB max)          │          │
│  │ - [Future]: utworz, podsumuj, flashcards, etc.          │          │
│  └──────────────────────────────────────────────────────────┘          │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     MCP SERVER & DATABASE                                │
│                                                                          │
│  MCP Server (src/server/mcp/server.ts)                                  │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ - listTools(): Register available tools                   │          │
│  │ - executeTool(): Call tool implementations               │          │
│  │ - listResources(): List available resources              │          │
│  │ - readResource(): Read resource content                  │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  Database Queries (src/server/queries.ts)                               │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ - getAllUserNotes(userId)                                 │          │
│  │ - getNoteById(noteId, userId)                            │          │
│  │ - getMaterialsByUser(userId)                             │          │
│  └──────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Responsibilities

### Frontend Layer

**`src/components/cells/RagCellForm.tsx`**
- Main RAG cell component
- Integrates autocomplete hooks
- Handles form submission
- Displays RAG responses

**`src/components/cells/ResourceAutocomplete.tsx`**
- Dropdown UI component
- Shows filtered resource list
- Handles keyboard navigation and clicks
- Polish language, zinc theme styling

**`src/hooks/useResourceAutocomplete.ts`**
- Fetches available resources from `/api/mcp/resources`
- Manages loading and error states
- Runs on component mount

**`src/hooks/useResourceAutocompleteInput.ts`**
- Handles autocomplete logic (show/hide, filtering)
- Keyboard navigation (↑↓, Enter, Escape)
- Inserts displayName into textarea
- Detects @ character and manages cursor position

### Server Action Layer

**`src/actions/rag-actions.ts`**
- Main server action: `askRagQuestion()`
- Parses MCP commands from user input
- Resolves displayName → URI
- Fetches resource content
- Queries Gemini RAG with context
- Returns response with sources and tool results

**`src/helpers/parse-mcp-commands.ts`**
- Extracts @ resource references (regex: `/@([\w\s-]+)/gi`)
- Extracts / tool commands
- Cleans question text
- Returns: `{ cleanQuestion, resources[], tools[] }`

### API Layer

**`src/app/api/mcp/route.ts`**
- POST endpoint for MCP tool execution
- Validates tool names and arguments
- Calls MCP server `executeTool()`
- Returns tool results

**`src/app/api/mcp/resources/route.ts`**
- GET endpoint for listing all available resources
- Aggregates:
  - MCP docs (from /docs folder)
  - User notes (from database)
  - User materials (from database)
- Returns unified Resource[] array
- Includes counts for each resource type

### MCP Server Layer

**`src/server/mcp/server.ts`**
- MCP server initialization
- Tool registry (read, etc.)
- Resource handlers (listResources, readResource)
- Capability declarations

**`src/server/mcp/tools/read-doc.ts`**
- Reads .md files from /docs folder
- 50KB truncation limit
- Error handling

**`src/server/mcp/types.ts`**
- TypeScript type definitions for MCP
- Tool input/output types

### Database Layer

**`src/server/queries.ts`**
- `getAllUserNotes(userId)` - Fetch all user notes
- `getNoteById(noteId, userId)` - Fetch specific note with auth check
- `getMaterialsByUser(userId)` - Fetch user materials

**`src/types/resourceTypes.ts`**
- `Resource` interface:
  ```typescript
  {
    name: string;           // URI: note://id, material://id, filename.md
    displayName: string;    // User-friendly: "test", "anatomy"
    type: 'doc' | 'note' | 'material';
    metadata?: {...}
  }
  ```

---

## 🔄 Complete Request Flow Example

**User Action**: Types `@test` and selects from autocomplete

```
1. RagCellForm
   ├─ User types "@t"
   ├─ useResourceAutocompleteInput detects @
   ├─ Shows ResourceAutocomplete dropdown
   └─ User selects "test" → inserts "@test " into textarea

2. Form Submit: "@test explain the heart"
   ↓
3. askRagQuestion (Server Action)
   ├─ parseMcpCommands("@test explain the heart")
   │  └─ Returns: { cleanQuestion: "explain the heart", resources: ["test"], tools: [] }
   │
   ├─ resolveDisplayNameToUri("test", userId)
   │  ├─ Fetches /api/mcp/resources
   │  ├─ Finds resource: { name: "note://06a33d39-...", displayName: "test", type: "note" }
   │  └─ Returns: "note://06a33d39-..."
   │
   ├─ fetchResourceContent("note://06a33d39-...", userId)
   │  ├─ Detects note:// URI scheme
   │  ├─ Calls getNoteById("06a33d39-...", userId)
   │  └─ Returns: "# test\n\nThis is my note content about the heart..."
   │
   ├─ queryWithFileSearch(
   │    cleanQuestion: "explain the heart",
   │    context: "# test\n\nThis is my note content..."
   │  )
   │  └─ Sends to Gemini with additional context
   │
   └─ Returns FormState with answer and sources

4. RagCellForm displays response to user
```

---

## Business Vision

**Goal**: Pioneer @ and / commands in educational RAG platform

**Differentiation**:
- Not a ChatGPT clone
- Personalized AI with user's own materials
- Ephemeral micro-conversations (3-message history)
- Tool-augmented learning experience

---

## Core Features

### 1. @ Commands (Resource References)
**Purpose**: Reference user's personal study materials

**Examples**:
- `@anatomy.pdf explain cardiac cycle`
- `@lecture-2 summarize key points`
- `@my-notes review respiratory system`

**Implementation**: MCP Resources

---

### 2. / Commands (Tool Execution)
**Purpose**: Execute specific learning tools

**Examples**:
- `/utworz` - Generate test questions in JSON format (app's test format)
- `/podsumuj` - Summarize RAG response
- `/flashcards` - Create flashcards from answer
- `/tlumacz` - Translate to English

**Implementation**: MCP Tools

---

## Architecture Decision: TypeScript MCP

### Why TypeScript Over Python:

✅ **No deployment complexity** - Runs natively in Node.js/Next.js
✅ **Single language** - No Python runtime needed
✅ **Vercel-friendly** - No separate service required
✅ **Type safety** - Full TypeScript integration
✅ **Production-ready** - No process management overhead

### Documentation:
- GitHub: https://github.com/modelcontextprotocol/typescript-sdk
- NPM: https://www.npmjs.com/package/@modelcontextprotocol/sdk
- Examples: https://github.com/modelcontextprotocol/servers

---

## Technical Architecture

### Communication Flow:

```
User Input: "@anatomy.pdf explain cardiac cycle /utworz"
      ↓
1. RagCellForm - Parse @ and / commands
      ↓
2. Server Action - askRagQuestion(question, resources, tools)
      ↓
3. MCP Server (TS) - Fetch resources, prepare tools
      ↓
4. Gemini RAG - Query with file context + system prompts + function calling
      ↓
5. Tool Execution - /utworz generates test JSON
      ↓
6. Response - Answer + test questions
```

---

## 📋 Next Steps & Roadmap

### 🎯 Immediate Next Tasks:

1. **Material Content Fetching** (High Priority)
   - Implement PDF/file content extraction for `material://` URIs
   - Use pdf-parse or similar library
   - Apply 50KB truncation limit like docs
   - Handle UploadThing URL fetching

2. **/ Tool Implementations** (Medium Priority)
   - `/utworz` - Generate test questions in Wolfmed JSON format
   - `/podsumuj` - Summarize response (50-100 words)
   - `/flashcards` - Generate Q&A flashcards
   - `/quiz` - Quick 3-question quiz
   - `/tlumacz` - Translate to English
   - Handle Gemini function calling responses

3. **Cell Persistence** (Medium Priority)
   - Save RAG responses to `userCellsList.cells[cellId].response`
   - Load saved response on cell mount
   - Show "Continue conversation" UI

4. **Error Handling & UX** (Low Priority)
   - Better error messages for failed resource resolution
   - Loading states for long-running queries
   - User-facing file size warnings
   - Retry mechanisms

### 🐛 Known Issues & Tech Debt:

1. **Material Content** - Placeholder exists, needs implementation
2. **Debug Logging** - Remove console.log statements from production
3. **Multiple API Calls** - Each RagCellForm makes separate /api/mcp/resources call (consider caching)
4. **Parser Edge Cases** - Test with special characters, multiple @, etc.

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Basic MCP server + 2 tools + cell persistence

**Tasks**:
1. **Use Existing Materials System**
   - Use existing `materials` table (already has UploadThing integration)
   - Query user's materials: `SELECT * FROM materials WHERE userId = ? AND type = 'pdf'`
   - Secure access already implemented (user can only see own files)
   - @ commands reference materials by filename: `@anatomy.pdf` → match `title` field

2. **MCP Server Setup**
   - Install `@modelcontextprotocol/sdk`
   - Create `/src/server/mcp-server.ts`
   - Implement 2 MCP tools:
     - `get_user_material(userId, filename)` - Fetch PDF text
     - `utworz_test(context, difficulty)` - Generate test JSON

3. **Input Parsing**
   - Parse `@filename` references in user input
   - Parse `/command` in user input
   - Extract and validate commands

4. **Gemini Integration**
   - Update `queryWithFileSearch()` to accept MCP tools
   - Use Gemini function calling with MCP tools
   - Handle tool execution responses

5. **Cell Persistence**
   - Update RAG cell save logic to persist response in `userCellsList.cells`
   - Store last response + tool results in cell data
   - Load saved response on cell mount
   - Show "Continue conversation" if previous response exists

**Deliverables**:
- ✅ Users upload materials (already works - using existing system)
- ✅ Users can query: `@anatomy.pdf what is the heart?`
- ✅ Users can use: `/utworz` to generate tests
- ✅ RAG cell content persists to database like other cells
- ✅ Last response shows when user reopens cell

---

### Phase 2: Enhanced Tools (Week 2)
**Goal**: Add more learning tools + autocomplete

**New Tools**:
- `/podsumuj` - Summarize response (50-100 words)
- `/flashcards` - Generate flashcards (Q&A format)
- `/quiz` - Quick 3-question quiz
- `/tlumacz` - Translate answer to English

**UI Enhancements**:
- Autocomplete for @ (show user's files)
- Autocomplete for / (show available commands)
- Visual indicators: "Using @anatomy.pdf..." during processing
- Tool execution status: "Generating test questions..."

**Deliverables**:
- ✅ 6 total tools available
- ✅ Autocomplete for @ and /
- ✅ Visual feedback during tool execution

---

### Phase 3: Advanced Features (Week 3+)
**Goal**: Multi-file context + tool composition

**Features**:
- Multi-file context: `@anatomy.pdf @physiology.pdf compare...`
- Tool composition: `/utworz + /flashcards`
- Tool history: Save generated tests/flashcards
- Share tools: Export tests to share with classmates
- Streaming tool execution (if needed)

**Deliverables**:
- ✅ Multi-file RAG queries
- ✅ Combined tool execution
- ✅ Tool result persistence

---

## 📝 Feature Deep Dive: @ Autocomplete

**Priority**: High (Next task after current MVP)
**Estimated Time**: 2-3 hours
**Status**: Not started

### User Experience:

```
User types: "@"
  ↓
Dropdown appears with list:
┌─────────────────────────────┐
│ 📄 MCP_INTEGRATION_PLAN.md  │
│ 📄 Anatomia.md              │
│ 📄 Fizjologia.md            │
│ 📄 Biochemia_z_Biofizyka.md │
│ ... (10 more files)         │
└─────────────────────────────┘

User types: "@mcp"
  ↓
Filtered dropdown:
┌─────────────────────────────┐
│ 📄 MCP_INTEGRATION_PLAN.md  │ ← Highlighted
└─────────────────────────────┘

User presses ↓ or clicks → Inserts "@MCP_INTEGRATION_PLAN.md "
```

### Implementation Plan:

**1. Backend: Resource List API**

Create `GET /api/mcp/resources` endpoint:

```typescript
// src/app/api/mcp/resources/route.ts
import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const docsPath = join(process.cwd(), 'docs');
    const files = await readdir(docsPath);

    const mdFiles = files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        displayName: f.replace('.md', '').replace(/_/g, ' ')
      }));

    return NextResponse.json({ resources: mdFiles });
  } catch (error) {
    return NextResponse.json({ resources: [] });
  }
}
```

**2. Frontend: Autocomplete Hook**

Create `useResourceAutocomplete` hook:

```typescript
// src/hooks/useResourceAutocomplete.ts
import { useState, useEffect } from 'react';

interface Resource {
  name: string;
  displayName: string;
}

export function useResourceAutocomplete() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const res = await fetch('/api/mcp/resources');
        const data = await res.json();
        setResources(data.resources || []);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  return { resources, loading };
}
```

**3. Frontend: Autocomplete Component**

Update `RagCellForm` with autocomplete logic:

```typescript
// In RagCellForm component:
const [showAutocomplete, setShowAutocomplete] = useState(false);
const [autocompleteQuery, setAutocompleteQuery] = useState('');
const [selectedIndex, setSelectedIndex] = useState(0);
const { resources } = useResourceAutocomplete();

// Detect @ character
const handleInputChange = (e) => {
  const value = e.target.value;
  const cursorPos = e.target.selectionStart;

  // Find last @ before cursor
  const textBeforeCursor = value.substring(0, cursorPos);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex !== -1) {
    const query = textBeforeCursor.substring(lastAtIndex + 1);
    // Check if still typing (no space after @)
    if (!query.includes(' ')) {
      setAutocompleteQuery(query);
      setShowAutocomplete(true);
      return;
    }
  }

  setShowAutocomplete(false);
};

// Filter resources
const filteredResources = resources.filter(r =>
  r.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
);

// Keyboard navigation
const handleKeyDown = (e) => {
  if (!showAutocomplete) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSelectedIndex(i => Math.min(i + 1, filteredResources.length - 1));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSelectedIndex(i => Math.max(i - 1, 0));
  } else if (e.key === 'Enter' && filteredResources.length > 0) {
    e.preventDefault();
    insertResource(filteredResources[selectedIndex].name);
  } else if (e.key === 'Escape') {
    setShowAutocomplete(false);
  }
};

// Insert selected resource
const insertResource = (filename) => {
  const input = inputRef.current;
  const cursorPos = input.selectionStart;
  const value = input.value;

  // Find @ position
  const textBefore = value.substring(0, cursorPos);
  const atIndex = textBefore.lastIndexOf('@');

  // Replace @query with @filename
  const newValue =
    value.substring(0, atIndex) +
    `@${filename} ` +
    value.substring(cursorPos);

  input.value = newValue;
  input.focus();
  setShowAutocomplete(false);
};
```

**4. UI Component**

```tsx
{showAutocomplete && filteredResources.length > 0 && (
  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
    {filteredResources.map((resource, index) => (
      <button
        key={resource.name}
        onClick={() => insertResource(resource.name)}
        className={cn(
          "w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2",
          index === selectedIndex && "bg-blue-50"
        )}
      >
        <span>📄</span>
        <span className="font-medium">{resource.name}</span>
      </button>
    ))}
  </div>
)}
```

### Edge Cases to Handle:

1. **Multiple @ symbols**: Only show autocomplete for the @ closest to cursor
2. **@ in middle of text**: Position dropdown relative to @ position
3. **No matches**: Show "No files found" message
4. **Loading state**: Show skeleton while fetching resources
5. **Mobile**: Touch-friendly dropdown size
6. **Accessibility**: ARIA labels, keyboard navigation

### Testing Checklist:

- [ ] Type `@` → dropdown appears
- [ ] Type `@mcp` → filtered to MCP_INTEGRATION_PLAN.md
- [ ] Arrow keys navigate dropdown
- [ ] Enter inserts selected file
- [ ] Click inserts file
- [ ] Escape closes dropdown
- [ ] Multiple `@` in text works correctly
- [ ] Works on mobile

### Future Enhancements:

1. **Recently used**: Show recently used files first
2. **File preview**: Hover shows first 3 lines
3. **File icons**: Different icons for .md, .pdf, .txt
4. **Fuzzy search**: Match "mcp" to "MCP_INTEGRATION_PLAN.md"
5. **Categories**: Group by file type or subject

---

## Database Schema

### Existing Tables (Already in Schema):

**`materials` table** - User uploaded PDF/documents:
```typescript
{
  id: uuid,
  userId: string,
  title: string,
  key: string (unique),
  url: string,         // UploadThing URL
  type: string,        // "pdf", "md", "txt"
  category: string,    // course category
  size: number,        // file size in bytes
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**`userCellsList` table** - Stores all user cells (including RAG cells):
```typescript
{
  id: uuid,
  userId: string,
  cells: jsonb,        // Array of cell objects
  order: jsonb,        // Array of cell IDs for ordering
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Cell Persistence:

**RAG Cell Structure (stored in `cells` JSONB)**:
```typescript
{
  id: string,           // Cell UUID
  type: "rag",          // Cell type
  content: string,      // User's question
  response?: {          // Optional: Last AI response
    answer: string,
    sources?: string[],
    timestamp: string,
    toolResults?: {     // Results from / commands
      utworz?: TestQuestion[],
      flashcards?: Flashcard[],
      // ... other tool results
    }
  },
  resources?: string[], // @ file references used
  createdAt: string,
  updatedAt: string
}
```

**How Persistence Works**:
1. User asks question in RAG cell
2. Server action processes query + MCP tools
3. Response saved to `userCellsList.cells[cellId].response`
4. User can see conversation history on reload
5. Only **last response** persisted (ephemeral 3-message history in UI only)

### Optional Table (Phase 3):

**`tool_executions` table** - Track tool usage for analytics:
```sql
CREATE TABLE tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input_context TEXT,
  output_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## MCP Server Implementation

### File: `/src/server/mcp-server.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Initialize MCP server
const server = new Server(
  {
    name: 'wolfmed-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_user_material',
      description: 'Fetch user uploaded PDF or document content',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          filename: { type: 'string', description: 'Filename to fetch' },
        },
        required: ['userId', 'filename'],
      },
    },
    {
      name: 'utworz_test',
      description: 'Generate test questions in Wolfmed JSON format',
      inputSchema: {
        type: 'object',
        properties: {
          context: { type: 'string', description: 'Context for test generation' },
          questionCount: { type: 'number', description: 'Number of questions' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        },
        required: ['context', 'questionCount'],
      },
    },
  ],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_user_material':
      return await getUserMaterial(args.userId, args.filename);

    case 'utworz_test':
      return await generateTest(args.context, args.questionCount, args.difficulty);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Wolfmed MCP Server running on stdio');
}

main().catch(console.error);
```

---

## Input Parsing Logic

### File: `/src/helpers/parseMcpCommands.ts`

```typescript
export interface ParsedInput {
  cleanQuestion: string;
  resources: string[];  // @filename references
  tools: string[];      // /command references
}

export function parseMcpCommands(input: string): ParsedInput {
  const resources: string[] = [];
  const tools: string[] = [];

  // Extract @filename
  const resourcePattern = /@([\w-]+\.(?:pdf|md|txt))/g;
  let match;
  while ((match = resourcePattern.exec(input)) !== null) {
    resources.push(match[1]);
  }

  // Extract /command
  const toolPattern = /\/(utworz|podsumuj|flashcards|quiz|tlumacz)/g;
  while ((match = toolPattern.exec(input)) !== null) {
    tools.push(match[1]);
  }

  // Remove @ and / from question
  const cleanQuestion = input
    .replace(resourcePattern, '')
    .replace(toolPattern, '')
    .trim();

  return { cleanQuestion, resources, tools };
}
```

**Example**:
```typescript
parseMcpCommands("@anatomy.pdf explain heart /utworz")
// Returns:
{
  cleanQuestion: "explain heart",
  resources: ["anatomy.pdf"],
  tools: ["utworz"]
}
```

---

## Updated Server Action

### File: `/src/actions/rag-actions.ts`

```typescript
import { parseMcpCommands } from '@/helpers/parseMcpCommands';
import { executeMcpTools } from '@/server/mcp-integration';

export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth();

  const question = formData.get('question') as string;

  // Parse MCP commands
  const { cleanQuestion, resources, tools } = parseMcpCommands(question);

  // Fetch user materials if @ references exist
  let additionalContext = '';
  if (resources.length > 0) {
    // Query existing materials table
    const materials = await getUserMaterials(userId, resources);
    additionalContext = materials.map(m => m.content).join('\n\n');
  }

  // Query Gemini RAG with context
  const result = await queryWithFileSearch(
    cleanQuestion,
    additionalContext
  );

  // Execute tools if / commands exist
  let toolResults = {};
  if (tools.length > 0) {
    toolResults = await executeMcpTools(userId, tools, result.answer);
  }

  return {
    ...toFormState('SUCCESS', result.answer),
    values: {
      sources: result.sources,
      toolResults
    }
  };
}
```

---

## Helper Functions

### File: `/src/server/materials-queries.ts` (or add to existing queries)

```typescript
import { db } from './db/index'
import { materials } from './db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Get user's materials by filename
 * @param userId - User ID
 * @param filenames - Array of filenames (e.g. ["anatomy.pdf", "physiology.pdf"])
 * @returns Array of material objects with content
 */
export async function getUserMaterials(
  userId: string,
  filenames: string[]
): Promise<Array<{ title: string; url: string; content: string }>> {
  const results = await db
    .select()
    .from(materials)
    .where(
      and(
        eq(materials.userId, userId),
        // Match any of the filenames in title field
        // Note: You may need to add sql operator for IN clause
      )
    )

  // Fetch PDF content from URLs (using pdf-parse or similar)
  const withContent = await Promise.all(
    results.map(async (material) => {
      const content = await extractPdfText(material.url)
      return {
        title: material.title,
        url: material.url,
        content
      }
    })
  )

  return withContent
}

/**
 * Extract text from PDF URL
 * @param url - UploadThing URL
 * @returns Extracted text content
 */
async function extractPdfText(url: string): Promise<string> {
  // Implementation: fetch PDF, use pdf-parse to extract text
  // Max 50KB text to avoid token limits
  return "extracted text..."
}
```

---

## Cell Persistence

### How RAG Cells Persist:

**1. Cell Structure in Database**:
```typescript
// userCellsList.cells JSONB contains:
{
  "cell-uuid-123": {
    id: "cell-uuid-123",
    type: "rag",
    content: "@anatomy.pdf explain the heart /utworz",
    response: {
      answer: "The heart is a muscular organ...",
      sources: ["doc1", "doc2"],
      timestamp: "2026-01-21T10:30:00Z",
      toolResults: {
        utworz: [
          {
            id: "q1",
            meta: { course: "anatomy", category: "cardiology" },
            data: {
              question: "What is the function of the heart?",
              answers: [...]
            }
          }
        ]
      }
    },
    resources: ["anatomy.pdf"],
    createdAt: "2026-01-21T10:00:00Z",
    updatedAt: "2026-01-21T10:30:00Z"
  }
}
```

**2. Save Cell Content** (after RAG query completes):
```typescript
// In RagCellForm or server action
async function saveRagCellResponse(
  userId: string,
  cellId: string,
  question: string,
  response: {
    answer: string,
    sources?: string[],
    toolResults?: any
  },
  resources: string[]
) {
  const userCellsList = await db
    .select()
    .from(userCellsList)
    .where(eq(userCellsList.userId, userId))
    .limit(1)

  const cells = userCellsList[0].cells as Record<string, any>

  // Update cell with response
  cells[cellId] = {
    ...cells[cellId],
    content: question,
    response: {
      answer: response.answer,
      sources: response.sources,
      timestamp: new Date().toISOString(),
      toolResults: response.toolResults
    },
    resources,
    updatedAt: new Date().toISOString()
  }

  // Save back to database
  await db
    .update(userCellsList)
    .set({
      cells,
      updatedAt: new Date()
    })
    .where(eq(userCellsList.userId, userId))
}
```

**3. Load Cell on Mount**:
```typescript
// In RagCellForm
useEffect(() => {
  // Cell data comes from props (loaded server-side)
  if (cell.response) {
    // Show previous response
    setLastResponse(cell.response)
  }
}, [cell])
```

**Key Points**:
- Only **last response** saved (not full conversation history)
- Ephemeral 3-message UI history (useState, not persisted)
- When user saves/closes cell → response saved to DB
- When user reopens cell → last response displays
- User can continue with new question (old response lost in UI, but saved in DB)

---

## Test Question JSON Format

### Wolfmed Test Format (for `/utworz`):

```json
{
    "id": "0005ebb5-5728-48b9-9963-88cacfacc6bd",
    "meta": {
      "course": "opiekun-medyczny",
      "category": "opiekun-medyczny"
    },
    "data": {
      "answers": [
        {
          "option": "Pogorszenie kontaktu",
          "isCorrect": false
        },
        {
          "option": "Blednięcie",
          "isCorrect": false
        },
        {
          "option": "Zawroty głowy",
          "isCorrect": false
        },
        {
          "option": "Wszystkie wyżej wymienione",
          "isCorrect": true
        }
      ],
      "question": "Objawy sugerujące, że należy przerwać pionizację to:"
    },
    "createdAt": "2024-11-03 19:59:06.184919",
    "updatedAt": null
  },
```

---

## UI Components

### File: `/src/components/cells/RagCellForm.tsx` (Updated)

**Add**:
- Input suggestions for @ (show user files)
- Input suggestions for / (show available commands)
- Visual indicators for resource/tool usage
- Tool execution status display

**Example UI**:
```tsx
{/* Resource indicator */}
{resources.length > 0 && (
  <div className="flex gap-2 mb-2">
    {resources.map(file => (
      <span key={file}>
        📄 {file}
      </span>
    ))}
  </div>
)}

{/* Tool execution indicator */}
{isExecutingTool && (
  <div>
    Executing: {currentTool}...
  </div>
)}
```

---

## Cost Analysis

### Token Usage with MCP:

**Before MCP**:
- Question: ~50 tokens
- RAG context: ~500 tokens
- Response: ~200 tokens
- **Total**: ~750 tokens = $0.00006 per query

**After MCP (with @file)**:
- Question: ~50 tokens
- RAG context: ~500 tokens
- User PDF context: ~1000 tokens (additional)
- Response: ~200 tokens
- Tool execution: ~100 tokens
- **Total**: ~1850 tokens = $0.00014 per query

**Impact**: ~2x token cost, still negligible ($0.14 per 1000 queries)

---

## Security Considerations

1. **File Access Control**:
   - Users can ONLY access their own uploaded files
   - Validate userId in all MCP tool calls
   - No cross-user file access

2. **Tool Rate Limiting**:
   - `/utworz` - 10 per hour (expensive operation)
   - Other tools - 20 per hour
   - Admin can override limits

3. **Input Validation**:
   - Sanitize @ and / references
   - Validate file extensions (.pdf, .md, .txt only)
   - Max file size: 10MB per upload

4. **Content Safety**:
   - PDF text extraction size limit (50KB)
   - Timeout on tool execution (30s max)
   - No executable file uploads

---

## Testing Checklist

### Phase 1:
- [ ] Upload PDF to user materials
- [ ] Query with `@filename` reference
- [ ] Parse @ and / commands correctly
- [ ] MCP server communicates with Gemini
- [ ] `/utworz` generates valid test JSON
- [ ] Tool results display in UI
- [ ] Rate limiting works
- [ ] File access control works

### Phase 2:
- [ ] All 6 tools functional
- [ ] Autocomplete for @ shows user files
- [ ] Autocomplete for / shows commands
- [ ] Visual indicators show tool execution
- [ ] Multiple tools can execute in one query

### Phase 3:
- [ ] Multi-file context works
- [ ] Tool composition works
- [ ] Tool history persists
- [ ] Export/share functionality

---

## Risks & Mitigations

**Risk 1**: TypeScript MCP SDK learning curve
- **Mitigation**: Use official examples, start with 2 simple tools

**Risk 2**: PDF text extraction complexity
- **Mitigation**: Use `pdf-parse` npm package, handle errors gracefully

**Risk 3**: Tool execution timeout
- **Mitigation**: 30s timeout, show error message, allow retry

**Risk 4**: Increased token costs
- **Mitigation**: Monitor usage, add warnings for expensive queries

---

## Success Metrics

**Phase 1**:
- ✅ Users can upload and reference materials
- ✅ `/utworz` generates valid tests
- ✅ 80% tool execution success rate

**Phase 2**:
- ✅ Average 2 tools used per session
- ✅ 50% users try @ commands within first week
- ✅ Positive user feedback on tool UX

**Phase 3**:
- ✅ 20% users combine multiple tools
- ✅ Test generation saves 5+ minutes per user
- ✅ Tool usage increases session length by 30%

---

## Next Steps

1. **Review this plan** - Get approval/feedback
2. **Create user_materials table** - Database migration
3. **Set up UploadThing** - PDF upload integration
4. **Install MCP SDK** - `pnpm add @modelcontextprotocol/sdk`
5. **Build MCP server** - Implement first 2 tools
6. **Update RagCellForm** - Add parsing logic
7. **Test end-to-end** - Upload PDF, query with @, use /utworz

---

**Plan Status**: Ready for Review
**Estimated Timeline**: 3 weeks (phased approach)
**Technical Complexity**: Medium-High
**Business Value**: High (unique differentiator)

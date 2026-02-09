# MCP + Gemini Architecture Analysis

**Date**: 2026-01-29
**Research Focus**: Understanding MCP capabilities, Gemini API tooling, and optimal integration architecture for Wolfmed RAG system

---

## Executive Summary

This document provides a comprehensive analysis of Model Context Protocol (MCP) architecture and Gemini API capabilities, with specific recommendations for the Wolfmed educational platform's hybrid RAG + MCP tool system.

**Key Findings**:
- ✅ Gemini API **does support function calling/tool use** natively
- ✅ Gemini has **built-in MCP support** as of late 2025 (experimental in Python/JS SDKs)
- ✅ Gemini File Search provides **fully-managed RAG** separate from MCP tools
- ✅ **Recommended architecture**: Hybrid approach using Gemini File Search for RAG + custom tools for actions
- ⚠️ MCP "sampling" feature allows servers to request LLM completions, but may be overkill for current needs

---

## 1. MCP Server Capabilities

### What MCP Servers Can Do

MCP servers expose three primary capability types:

#### 1.1 Tools (Server-Provided Functions)

**Purpose**: Executable functions that can be invoked by clients and used by LLMs to perform actions.

**Key Characteristics**:
- Discovered through `tools/list` endpoint
- Invoked via `tools/call` endpoint
- Range from simple calculations to complex API interactions
- Schema-based with input validation (JSON Schema)
- Synchronous execution model (request → response)

**Example Tool Schema**:
```typescript
{
  name: 'read_file',
  description: 'Read markdown files from /docs folder',
  inputSchema: {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        description: 'Filename to read'
      }
    },
    required: ['filename']
  }
}
```

**Current Wolfmed Implementation**:
- `read` tool: Fetches markdown files from `/docs` folder
- Tool definitions for `utworz`, `podsumuj`, `flashcards`, `quiz`, `tlumacz` (not yet implemented)
- Located in `/src/server/mcp/server.ts`

#### 1.2 Resources (Data Providers)

**Purpose**: Application-driven data sources that provide context to models.

**Key Differences from Tools**:
- **Resources**: App-controlled, read-only context (user decides when to fetch)
- **Tools**: Model-controlled, executable actions (LLM decides when to call)

**Resource URI Patterns**:
```
docs://filename.md          # MCP documentation files
note://noteId               # User notes from database
material://materialId       # User materials from database
```

**Discovery Pattern**:
- Listed through `resources/list` endpoint
- Read via `resources/read` endpoint
- Support URI-based addressing

**Current Wolfmed Implementation**:
- `docs://list` resource: Lists available markdown files in `/docs`
- Custom URI schemes for user content (notes, materials)
- API aggregation at `/api/mcp/resources`

#### 1.3 Prompts (Template Library)

**Purpose**: Predefined prompt templates for specific tasks.

**Use Cases**:
- Standardized question formats
- Role-based prompts
- Task-specific templates

**Status in Wolfmed**: Not currently implemented

---

## 2. MCP Client Capabilities

### What MCP Clients Can Do

MCP clients are the consumer side of the protocol, connecting to servers to utilize exposed capabilities.

#### 2.1 Core Client Functions

**Discovery**:
- Connect to MCP servers via multiple transports
- List available tools, resources, and prompts
- Cache capability metadata

**Execution**:
- Invoke tools with validated inputs
- Fetch resource content by URI
- Handle async responses

**Transport Options**:
- **Streamable HTTP** (modern, stateless, recommended for 2026)
- **STDIO** (process-based, local servers)
- **HTTP+SSE** (legacy, backwards compatibility only)

#### 2.2 Client-Side Feature: Sampling

**What is Sampling?**

Sampling allows an MCP **server** to request LLM completions from the **client**, flipping the typical request flow.

**Use Case**:
```
Server needs AI reasoning mid-execution
    ↓
Server sends sampling request to client
    ↓
Client runs LLM completion (with user approval)
    ↓
Server receives result and continues execution
```

**Benefits**:
- Enables agentic workflows
- Server doesn't need direct LLM API access
- Human-in-the-loop control possible
- Multi-turn reasoning within tool execution

**When to Use**:
- Complex decision-making in tools
- Dynamic prompt generation
- User approval workflows
- Cost control (server doesn't pay for LLM calls)

**Current Wolfmed Status**: Not using sampling (may be future enhancement)

#### 2.3 MCP Client in Next.js Server Actions

**Integration Pattern** (from research):

```typescript
// Option 1: Direct SDK usage (current approach)
import { mcpServer } from '@/server/mcp/server';

async function serverAction() {
  // Call MCP server methods directly
  const result = await mcpServer.executeTool('read', args);
  return result;
}

// Option 2: HTTP-based MCP client (for remote servers)
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

async function serverAction() {
  const client = new Client({
    name: 'wolfmed-client',
    version: '1.0.0'
  });

  // Connect to MCP server
  await client.connect(transport);

  // List tools
  const tools = await client.listTools();

  // Call tool
  const result = await client.callTool({ name: 'read', arguments: args });

  return result;
}
```

**Wolfmed's Current Approach**:
- **Hybrid pattern**: Server instantiated in-process (not via client SDK)
- Direct method calls (`mcpServer.executeTool()`)
- HTTP API wrapper at `/api/mcp` for external access
- Works well for monolithic Next.js deployment

**Recommendation**: Current approach is valid for Vercel deployment. Consider full client/server separation only if:
- Need to run MCP servers as separate services
- Want to connect to external MCP servers
- Require strict process isolation

---

## 3. Gemini API Capabilities

### 3.1 Function Calling / Tool Use

**Status**: ✅ **Fully Supported** in Gemini API

**Overview**:
- Also called "tool use" in Gemini documentation
- Allows model to use external tools, APIs, and functions
- Model outputs structured data specifying tool to call and parameters
- Developer handles tool execution and passes results back

**Key Features** (2026):
- **Structured outputs**: Gemini 3+ models support function calls that adhere to specific schemas
- **Automatic tool calling**: SDK can automatically execute tool calls
- **Multi-turn handling**: Model can request multiple tool calls in sequence
- **Built-in MCP support**: Gemini SDK integrates MCP tools natively (experimental)

**How It Works**:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: userQuery,
  config: {
    tools: [
      {
        functionDeclarations: [
          {
            name: 'utworz_test',
            description: 'Generate test questions',
            parameters: {
              type: 'object',
              properties: {
                questionCount: { type: 'number' },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
              }
            }
          }
        ]
      }
    ]
  }
});

// Handle function calls
if (response.functionCalls) {
  for (const call of response.functionCalls) {
    // Execute tool
    const result = await executeTool(call.name, call.args);

    // Send result back to model for final response
    const finalResponse = await ai.models.generateContent({
      // ... include function result
    });
  }
}
```

**Current Wolfmed Implementation**:
- ✅ Tool definitions passed to Gemini via `config.tools`
- ✅ Function calls extracted from response
- ❌ **Not yet executing tools** (definitions only)
- ❌ No multi-turn handling (send result back to model)

Located in `/src/server/google-rag.ts` lines 148-185.

### 3.2 Gemini File Search (Built-in RAG)

**Status**: ✅ **Fully Available** (Released November 2025)

**What It Is**:
- Fully-managed RAG system built into Gemini API
- Abstracts away chunking, embedding, vector indexing, and retrieval
- No need for external vector database

**Architecture**:
```
Documents → File Search Store → Embeddings → Vector Index
                                                    ↓
User Query → Gemini API → Retrieve Context → Generate Answer
```

**Key Components**:

1. **File Search Stores**:
   - Container for document embeddings
   - Persists indefinitely (unlike raw File API uploads)
   - Globally scoped, user manages lifecycle

2. **Automatic Embedding**:
   - Uses `gemini-embedding-001` model
   - Chunks documents with optimal strategies
   - Generates embeddings at index time

3. **Dynamic Retrieval**:
   - Query-time retrieval from store
   - Automatic context injection into prompts
   - Built-in citation support

**Pricing** (2026):
- Storage: **Free**
- Query-time retrieval: **Free**
- Initial indexing: **$0.15 per 1M tokens**
- Only pay when first uploading/indexing files

**Current Wolfmed Implementation**:
```typescript
// Already using Gemini File Search!
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: enhancedQuery,
  config: {
    tools: [{
      fileSearch: {
        fileSearchStoreNames: [fileSearchStoreName]
      }
    }]
  }
});
```

Located in `/src/server/google-rag.ts`.

**File Search Store Management**:
- ✅ Create store: `createFileSearchStore()`
- ✅ Upload files: `uploadFiles()`
- ✅ Query with store: `queryWithFileSearch()`
- ✅ Delete store: `deleteFileSearchStore()`

### 3.3 Combining File Search + Function Calling

**Can we use both?** ✅ **YES!**

```typescript
const response = await ai.models.generateContent({
  config: {
    tools: [
      {
        fileSearch: {
          fileSearchStoreNames: ['store-name']
        }
      },
      {
        functionDeclarations: [
          // Custom tools here
          { name: 'utworz_test', ... },
          { name: 'flashcards', ... }
        ]
      }
    ]
  }
});
```

**Wolfmed is already doing this!** (see `google-rag.ts` lines 142-156)

### 3.4 Native MCP Support in Gemini SDK

**Status**: ✅ **Experimental** (as of late 2025)

**What This Means**:
- Gemini SDK can connect to MCP servers directly
- Automatic tool discovery from MCP servers
- Auto-execution of MCP tools

**Example** (from research):
```typescript
// Gemini SDK connecting to MCP server
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
  mcp: {
    servers: [
      {
        name: 'wolfmed-server',
        url: 'http://localhost:3000/api/mcp'
      }
    ]
  }
});

// Tools from MCP server automatically available
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: query
  // MCP tools automatically included
});
```

**Should Wolfmed Use This?**

**Current Approach** (manual mapping):
```typescript
// We manually map MCP tools to Gemini function declarations
const mcpTools = tools.map(toolName => {
  switch (toolName) {
    case 'utworz': return { name: 'utworz_test', ... };
    // ...
  }
});
```

**Pros of Current Approach**:
- ✅ Full control over tool definitions
- ✅ Works with stable SDK
- ✅ No experimental features

**Pros of Native MCP Support**:
- ✅ Less boilerplate code
- ✅ Automatic tool discovery
- ✅ Standardized integration

**Recommendation**: **Wait** until Gemini MCP support is stable (currently experimental). Current manual mapping works well and provides more control.

---

## 4. Architecture Patterns & Recommendations

### 4.1 Current Wolfmed Architecture (What's Working)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT                                │
│  "explain heart @test /utworz"                                  │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│              PARSE (parse-mcp-commands.ts)                       │
│  cleanQuestion: "explain heart"                                 │
│  resources: ["test"]                                             │
│  tools: ["utworz"]                                              │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│           RESOLVE RESOURCES (rag-actions.ts)                     │
│  1. Fetch /api/mcp/resources (aggregates docs + notes + materials) │
│  2. Match "test" → "note://06a33d39-..."                        │
│  3. Fetch content: note:// → getNoteById()                      │
│     material:// → [placeholder]                                 │
│     docs:// → MCP /read tool                                    │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│            QUERY GEMINI (google-rag.ts)                          │
│  Tools config:                                                   │
│  [{                                                              │
│    fileSearch: { fileSearchStoreNames: [storeName] }  ← RAG     │
│  }, {                                                            │
│    functionDeclarations: [utworz, podsumuj, ...]     ← TOOLS   │
│  }]                                                              │
│                                                                  │
│  Additional context: User note/material content                  │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 GEMINI RESPONSE                                  │
│  - answer: Text response                                         │
│  - functionCalls: [{ name: 'utworz_test', args: {...} }]        │
│  - sources: File citations (from File Search)                   │
└─────────────────────────────────────────────────────────────────┘
```

**What's Working**:
- ✅ @ resource references with autocomplete
- ✅ URI-based resource addressing
- ✅ Multi-source aggregation (docs + notes + materials)
- ✅ Gemini File Search for main RAG corpus
- ✅ Tool definitions passed to Gemini
- ✅ Function call extraction

**What Needs Implementation**:
- ❌ **Tool execution**: Handle Gemini function calls
- ❌ **Multi-turn responses**: Send tool results back to model
- ❌ **Material content fetching**: PDF/file extraction
- ❌ **Cell persistence**: Save responses to database

### 4.2 Recommended Architecture: Hybrid RAG + MCP Tools

**Philosophy**: Use the right tool for the right job.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WOLFMED RAG SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │  GEMINI FILE SEARCH (Main Knowledge Base)         │          │
│  │  - Course materials (PDFs, MDs)                   │          │
│  │  - Static documentation                           │          │
│  │  - Reference content                              │          │
│  │                                                    │          │
│  │  Purpose: Answer questions from corpus            │          │
│  │  Type: Read-only, retrieval-based                │          │
│  └──────────────────────────────────────────────────┘          │
│                          +                                       │
│  ┌──────────────────────────────────────────────────┐          │
│  │  ADDITIONAL CONTEXT (User-Specific)              │          │
│  │  - User notes (from database)                    │          │
│  │  - User materials (PDFs uploaded by user)        │          │
│  │  - Personal study content                        │          │
│  │                                                    │          │
│  │  Purpose: Personalize RAG with user content      │          │
│  │  Type: Fetched on-demand, injected into prompt   │          │
│  └──────────────────────────────────────────────────┘          │
│                          +                                       │
│  ┌──────────────────────────────────────────────────┐          │
│  │  MCP TOOLS (Actions)                              │          │
│  │  - /utworz → Generate test questions             │          │
│  │  - /podsumuj → Summarize response                │          │
│  │  - /flashcards → Create flashcards               │          │
│  │  - /quiz → Generate quick quiz                   │          │
│  │  - /tlumacz → Translate to English               │          │
│  │                                                    │          │
│  │  Purpose: Transform/generate content              │          │
│  │  Type: Executable functions with specific outputs │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why This Hybrid Approach?**

| Component | Purpose | Technology | Why? |
|-----------|---------|------------|------|
| **Gemini File Search** | Main knowledge retrieval | File Search Store | Free storage, automatic embeddings, built-in citations |
| **User Context** | Personalized content | Direct fetch + inject | Doesn't need indexing (ephemeral), user-specific |
| **MCP Tools** | Actions & transformations | Function calling | Structured outputs, LLM decides when to use |

### 4.3 MCP Server vs Direct Function Implementation

**Question**: Should tools be "real" MCP server tools or just Gemini function declarations?

**Option A: MCP Server Tools** (current partial implementation)
```typescript
// MCP server defines tools
mcpServer.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [{ name: 'utworz_test', ... }]
}));

// Map MCP tools → Gemini function declarations
const mcpTools = await mcpServer.listTools();
const geminiTools = mcpTools.map(tool => ({
  name: tool.name,
  description: tool.description,
  parameters: tool.inputSchema
}));
```

**Pros**:
- ✅ Standardized protocol
- ✅ Portable (could connect external MCP clients)
- ✅ Follows spec

**Cons**:
- ❌ Extra abstraction layer
- ❌ More complex codebase
- ❌ Not using MCP "client" features (just server)

---

**Option B: Direct Gemini Function Declarations** (simpler)
```typescript
// Define tools directly for Gemini
const tools = [
  {
    name: 'utworz_test',
    description: 'Generate test questions',
    parameters: { ... }
  }
];

// Gemini calls function
const response = await ai.models.generateContent({
  config: { tools: [{ functionDeclarations: tools }] }
});

// Execute locally
if (response.functionCalls) {
  const result = await executeToolLocally(call.name, call.args);
}
```

**Pros**:
- ✅ Simpler, less abstraction
- ✅ Direct control over execution
- ✅ No protocol overhead

**Cons**:
- ❌ Not portable to other MCP clients
- ❌ Doesn't follow MCP spec
- ❌ Can't expose to external tools

---

**Recommendation**: **Hybrid Approach** (best of both)

Keep current architecture with refinement:

1. **MCP Server** for resource management:
   - `/docs` file listing and reading
   - Resource URI registry
   - Expose to external MCP clients if needed

2. **Direct Gemini functions** for tools:
   - Define tools in `rag-actions.ts`
   - Execute locally in Next.js
   - Simpler, faster, more maintainable

**Why?**
- Resources benefit from MCP standardization (discovery, URIs)
- Tools are Wolfmed-specific, don't need portability
- Reduces complexity while keeping extensibility

### 4.4 Multi-Turn Tool Execution Pattern

**Current Gap**: Wolfmed extracts `functionCalls` but doesn't execute them or send results back to model.

**Proper Multi-Turn Pattern**:

```typescript
export async function askRagQuestion(formData: FormData) {
  // ... parse, resolve resources, fetch context ...

  // Initial query with tools
  let response = await queryWithFileSearch(
    cleanQuestion,
    storeName,
    additionalContext,
    mcpTools
  );

  // Check for function calls
  if (response.functionCalls && response.functionCalls.length > 0) {
    // Execute each tool
    const toolResults = [];

    for (const call of response.functionCalls) {
      const result = await executeTool(call.name, call.args);
      toolResults.push({
        name: call.name,
        response: result
      });
    }

    // Send tool results back to model for final response
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: cleanQuestion },
        { functionResponse: toolResults }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ fileSearch: { ... } }]
      }
    });

    return {
      answer: finalResponse.text,
      toolResults: toolResults,
      sources: response.sources
    };
  }

  // No tool calls, return answer directly
  return {
    answer: response.answer,
    sources: response.sources
  };
}

async function executeTool(name: string, args: any) {
  switch (name) {
    case 'utworz_test':
      return await generateTestQuestions(args);
    case 'podsumuj':
      return await summarizeText(args);
    case 'flashcards':
      return await generateFlashcards(args);
    // ...
  }
}
```

**Benefits**:
- Model can use tool results to formulate final answer
- Enables multi-step reasoning
- Tools can be chained (model decides order)

### 4.5 Material Content Fetching (Next Priority)

**Current Status**: Placeholder at line 43 in `rag-actions.ts`

```typescript
if (uri.startsWith('material://')) {
  const materialId = uri.replace('material://', '')
  return `[Material ${materialId} - content fetching not yet implemented]`
}
```

**Implementation Plan**:

```typescript
import { getMaterialById } from '@/server/queries';
import { extractPdfText } from '@/lib/pdf-extractor';

async function fetchResourceContent(uri: string, userId: string): Promise<string> {
  // ... existing note:// and docs:// handling ...

  if (uri.startsWith('material://')) {
    const materialId = uri.replace('material://', '');

    // Fetch material from database
    const material = await getMaterialById(materialId, userId);

    if (!material) {
      return `[Material not found or access denied]`;
    }

    // Check if already has extracted text
    if (material.extractedText) {
      return material.extractedText;
    }

    // Extract text from file URL
    try {
      const text = await extractPdfText(material.url);

      // Optional: Cache extracted text in database
      await updateMaterial(materialId, { extractedText: text });

      return text;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      return `[Failed to extract text from ${material.title}]`;
    }
  }
}
```

**Libraries for PDF extraction**:
- `pdf-parse` - Simple, works with Node.js buffers
- `@google/generative-ai` - Can extract text from PDFs directly
- `pdfjs-dist` - Mozilla's PDF.js (more complex but powerful)

**Recommended**: Use `@google/genai` since already using Google AI SDK:

```typescript
import { GoogleGenAI } from '@google/genai';

async function extractPdfText(url: string): Promise<string> {
  // Fetch PDF from UploadThing URL
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  // Use Gemini to extract text
  const ai = getGoogleAI();
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      parts: [{
        inlineData: {
          mimeType: 'application/pdf',
          data: Buffer.from(arrayBuffer).toString('base64')
        }
      }, {
        text: 'Extract all text from this PDF document. Return only the text content.'
      }]
    }]
  });

  return result.text || '';
}
```

**Limits**:
- Apply 50KB truncation (like docs)
- Consider caching extracted text in database
- Handle extraction errors gracefully

---

## 5. Answers to Specific Questions

### Q1: What can an MCP server do?

**Answer**:
- ✅ **Expose tools** for execution (functions, APIs)
- ✅ **Provide resources** for context (read-only data)
- ✅ **Offer prompts** (templates)
- ✅ **Request sampling** (ask client's LLM for completions)
- ✅ **Manage connections** (multiple transports)
- ❌ Cannot directly call LLMs (unless using sampling)
- ❌ Cannot access client's context directly

**Wolfmed's MCP Server**:
- ✅ Lists `/docs` markdown files
- ✅ Reads file content via `read` tool
- ✅ Could expose more tools (but currently using direct Gemini functions)
- ❌ Not using sampling (not needed yet)

### Q2: How does @modelcontextprotocol/sdk client work?

**Answer**:
- Client connects to MCP servers via transport (HTTP, STDIO, SSE)
- Discovers capabilities (`listTools`, `listResources`, `listPrompts`)
- Invokes tools and fetches resources
- Can initiate sampling requests to LLM
- Manages connection lifecycle

**Can it be used in Next.js server actions?** ✅ **YES**

```typescript
'use server'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export async function serverAction() {
  const client = new Client({ name: 'wolfmed', version: '1.0.0' });
  // ... use client
}
```

**But**: Wolfmed doesn't currently need a client SDK because the MCP server is in-process (same Next.js app). Direct method calls work fine.

**When to use MCP client**:
- Connecting to external MCP servers
- Process separation (server runs separately)
- Standard protocol compliance

### Q3: Does Gemini support function calling / tool use?

**Answer**: ✅ **YES** - Fully supported

- Native function calling since Gemini 1.5
- Enhanced with structured outputs in Gemini 3+
- Experimental MCP integration (auto-discovers MCP tools)
- Multi-turn tool execution supported

**Current Wolfmed Usage**:
- ✅ Tool definitions passed to Gemini
- ✅ Function calls extracted
- ❌ **Not executing tools yet**
- ❌ No multi-turn (send results back)

### Q4: Can Gemini call external tools through MCP protocol?

**Answer**: ✅ **YES** (experimental, as of late 2025)

Gemini SDK can connect to MCP servers and auto-discover tools, but this is **experimental** in Python/JS SDKs.

**Should Wolfmed use this?**
- **Not yet** - Wait for stable release
- Current manual mapping is more reliable
- Full control over tool definitions

### Q5: How does Gemini's File API / RAG work?

**Answer**: Gemini has **two file-related features**:

**1. File API** (temporary uploads):
- Upload files to `ai.files.upload()`
- Persist for 48 hours
- Reference in prompts
- Use case: Ad-hoc document analysis

**2. File Search** (managed RAG):
- ✅ Create persistent File Search Stores
- ✅ Upload documents (embeddings auto-generated)
- ✅ Query with automatic retrieval
- ✅ Built-in citations
- ✅ Free storage and query-time retrieval
- Use case: Production RAG systems

**Wolfmed uses**: File Search (the right choice!)

### Q6: Can we combine Gemini RAG + MCP tools?

**Answer**: ✅ **ABSOLUTELY YES**

```typescript
const response = await ai.models.generateContent({
  config: {
    tools: [
      { fileSearch: { fileSearchStoreNames: ['store'] } },  // RAG
      { functionDeclarations: [...] }                       // Tools
    ]
  }
});
```

**Wolfmed is already doing this!** Just needs to execute the tools.

---

## 6. Final Architecture Recommendations

### Recommended Architecture: Hybrid RAG + Direct Tools

```
┌───────────────────────────────────────────────────────────────┐
│                     WOLFMED RAG CELL                           │
└───────────────────┬───────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │  Parse MCP Commands   │
        │  @resources /tools    │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Resolve & Fetch Resources        │
        │  - docs:// → MCP /read tool       │
        │  - note:// → Database query       │
        │  - material:// → PDF extraction   │
        └───────────┬───────────────────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Query Gemini with:               │
        │  1. File Search (main RAG)        │
        │  2. Additional context (user)     │
        │  3. Function declarations (tools) │
        └───────────┬───────────────────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Gemini Response                  │
        │  - text: Answer                   │
        │  - functionCalls: [tool requests] │
        └───────────┬───────────────────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Execute Tools (if needed)        │
        │  - utworz → generate tests        │
        │  - podsumuj → summarize           │
        │  - flashcards → create cards      │
        └───────────┬───────────────────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Send Tool Results Back to Gemini │
        │  Get final formatted response     │
        └───────────┬───────────────────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Return to User                   │
        │  - Answer with citations          │
        │  - Tool results (tests, cards)    │
        └───────────────────────────────────┘
```

### Key Decisions:

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| **RAG System** | Use Gemini File Search | Free, managed, automatic embeddings, built-in citations |
| **User Content** | Fetch & inject into prompt | Ephemeral, no need for indexing, user-specific |
| **Tools Definition** | Direct Gemini function declarations | Simpler, less abstraction, full control |
| **Tool Execution** | Local Next.js functions | No MCP overhead, faster, easier debugging |
| **MCP Server** | Keep for resources only | Good for docs listing, could expose externally |
| **MCP Client** | Don't use (yet) | In-process server works fine, no external servers |
| **Gemini MCP Integration** | Wait for stable release | Currently experimental, manual mapping is reliable |
| **Multi-turn** | Implement ASAP | Critical for tools to work properly |

### Implementation Priority:

1. **High Priority** (next 1-2 weeks):
   - ✅ Implement tool execution (`executeTool()` function)
   - ✅ Add multi-turn handling (send results back to Gemini)
   - ✅ Material PDF text extraction
   - ✅ Test `/utworz` tool end-to-end

2. **Medium Priority** (next month):
   - Implement remaining tools (`/podsumuj`, `/flashcards`, `/quiz`, `/tlumacz`)
   - Cell persistence (save responses)
   - Error handling improvements
   - Rate limiting for expensive tools

3. **Low Priority** (future):
   - MCP sampling (for complex multi-step tools)
   - External MCP server integration
   - Switch to native Gemini MCP support (when stable)
   - Tool composition (chain multiple tools)

---

## 7. Code Examples for Next Steps

### 7.1 Complete Multi-Turn Implementation

**Update `/src/server/google-rag.ts`**:

```typescript
export async function queryWithFileSearch(
  question: string,
  storeName?: string,
  additionalContext?: string,
  tools?: Array<{ name: string; description: string; parameters: any }>
): Promise<{ answer: string; sources?: string[]; toolResults?: any }> {
  const ai = getGoogleAI();

  // ... existing setup ...

  // Initial request
  let response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: enhancedQuery,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: configTools
    }
  });

  // Handle function calls (multi-turn)
  if (response.functionCalls && Array.isArray(response.functionCalls)) {
    const toolResults: Record<string, any> = {};

    // Execute all requested tools
    for (const call of response.functionCalls) {
      if (call.name) {
        try {
          const result = await executeToolLocally(call.name, call.args);
          toolResults[call.name] = result;
        } catch (error) {
          console.error(`Tool execution failed for ${call.name}:`, error);
          toolResults[call.name] = { error: 'Tool execution failed' };
        }
      }
    }

    // Send tool results back to model for final response
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        enhancedQuery,
        {
          role: 'model',
          parts: response.functionCalls.map(call => ({
            functionCall: call
          }))
        },
        {
          role: 'function',
          parts: Object.entries(toolResults).map(([name, result]) => ({
            functionResponse: {
              name,
              response: result
            }
          }))
        }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: configTools
      }
    });

    return {
      answer: finalResponse.text || '',
      sources: [],
      toolResults
    };
  }

  // No function calls, return original response
  return {
    answer: response.text || '',
    sources: []
  };
}

async function executeToolLocally(name: string, args: any): Promise<any> {
  switch (name) {
    case 'utworz_test':
      return await generateTestQuestions(args);
    case 'podsumuj':
      return await summarizeText(args);
    case 'flashcards':
      return await generateFlashcards(args);
    case 'quiz':
      return await generateQuiz(args);
    case 'tlumacz':
      return await translateText(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### 7.2 Tool Implementation Example: /utworz

**Create `/src/server/tools/generate-test.ts`**:

```typescript
import { GoogleGenAI } from '@google/genai';

interface GenerateTestInput {
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  context?: string;
}

interface TestQuestion {
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

export async function generateTestQuestions(
  input: GenerateTestInput
): Promise<TestQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

  const prompt = `
Generate ${input.questionCount} medical test questions in Polish.
Difficulty: ${input.difficulty || 'medium'}
Context: ${input.context || 'General medical knowledge'}

IMPORTANT: Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "uuid",
    "meta": {
      "course": "course-name",
      "category": "category-name"
    },
    "data": {
      "question": "Question text in Polish",
      "answers": [
        { "option": "Answer A", "isCorrect": false },
        { "option": "Answer B", "isCorrect": true },
        { "option": "Answer C", "isCorrect": false },
        { "option": "Answer D", "isCorrect": false }
      ]
    }
  }
]

Requirements:
- Exactly 4 answers per question
- Only 1 correct answer
- Questions must be in Polish
- Include varied difficulty
- Use medical terminology appropriately
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ text: prompt }],
    config: {
      responseMimeType: 'application/json'
    }
  });

  try {
    const questions = JSON.parse(response.text);
    return questions;
  } catch (error) {
    console.error('Failed to parse test questions:', error);
    throw new Error('Invalid test question format from AI');
  }
}
```

### 7.3 Material PDF Extraction

**Create `/src/lib/pdf-extractor.ts`**:

```typescript
import { GoogleGenAI } from '@google/genai';

const MAX_TEXT_LENGTH = 50000; // 50KB limit

export async function extractPdfText(url: string): Promise<string> {
  try {
    // Fetch PDF from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // Use Gemini to extract text
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data
            }
          },
          {
            text: 'Extract all text content from this PDF document. Return only the extracted text, no formatting or commentary.'
          }
        ]
      }]
    });

    let extractedText = result.text || '';

    // Apply truncation limit
    if (extractedText.length > MAX_TEXT_LENGTH) {
      extractedText = extractedText.substring(0, MAX_TEXT_LENGTH) + '\n\n[Text truncated at 50KB]';
    }

    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
```

**Update `/src/actions/rag-actions.ts`**:

```typescript
import { extractPdfText } from '@/lib/pdf-extractor';
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

    if (!material) {
      return '[Material not found or access denied]';
    }

    // Check cache first
    if (material.extractedText) {
      return material.extractedText;
    }

    // Extract and cache
    try {
      const text = await extractPdfText(material.url);

      // Cache for future use (optional)
      // await updateMaterial(materialId, { extractedText: text });

      return `# ${material.title}\n\n${text}`;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      return `[Failed to extract text from ${material.title}]`;
    }
  }

  // docs:// handling (existing)
  // ...
}
```

---

## 8. Additional Resources

### Official Documentation

**Model Context Protocol**:
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Building MCP Clients](https://modelcontextprotocol.info/docs/tutorials/building-a-client-node/)
- [MCP Tools Guide](https://modelcontextprotocol.info/docs/concepts/tools/)

**Gemini API**:
- [Function Calling Guide](https://ai.google.dev/gemini-api/docs/function-calling)
- [File Search Documentation](https://ai.google.dev/gemini-api/docs/file-search)
- [Tool Use with Live API](https://ai.google.dev/gemini-api/docs/live-tools)
- [Gemini MCP Integration](https://medium.com/google-cloud/model-context-protocol-mcp-with-google-gemini-llm-a-deep-dive-full-code-ea16e3fac9a3)

**Next.js Integration**:
- [Next.js MCP Guide](https://nextjs.org/docs/app/guides/mcp)
- [Vercel MCP Handler](https://github.com/vercel/mcp-handler)
- [AI SDK MCP Tools](https://ai-sdk.dev/cookbook/next/mcp-tools)

### Community Resources

- [MCP Developer Guide 2026](https://publicapis.io/blog/mcp-model-context-protocol-guide)
- [Building MCP Servers with TypeScript](https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/)
- [Gemini File Search Tutorial](https://www.datacamp.com/tutorial/google-file-search-tool)
- [MCP Architecture Guide](https://obot.ai/resources/learning-center/mcp-architecture/)

---

## 9. Conclusion

### Summary of Findings

1. **MCP Servers** provide tools, resources, and prompts; can request LLM completions via sampling
2. **MCP Clients** connect to servers, discover capabilities, invoke tools; can be used in Next.js server actions
3. **Gemini API** fully supports function calling/tool use with native MCP integration (experimental)
4. **Gemini File Search** provides fully-managed RAG with free storage and retrieval
5. **Hybrid architecture** (Gemini File Search + user context + MCP tools) is optimal for Wolfmed

### Recommended Next Steps

**Immediate** (this week):
1. Implement multi-turn tool execution in `google-rag.ts`
2. Create tool implementations starting with `/utworz`
3. Add PDF extraction for materials

**Short-term** (next 2 weeks):
1. Implement remaining tools
2. Add cell persistence
3. Comprehensive testing

**Long-term** (future):
1. Monitor Gemini MCP native support (migrate when stable)
2. Consider MCP sampling for complex workflows
3. Explore external MCP server integrations

### Key Insights

- ✅ Current Wolfmed architecture is **fundamentally sound**
- ✅ Don't need full MCP client/server separation for in-process tools
- ✅ Gemini File Search is the right choice for main RAG
- ✅ Direct function implementations are simpler than full MCP tools
- ⚠️ Missing multi-turn execution is critical gap
- 💡 User content should be fetched on-demand, not indexed
- 💡 Tools = actions, Resources = context (keep separate)

**The path forward is clear: Complete the tool execution loop, and Wolfmed will have a best-in-class educational RAG system.**

---

**Document Version**: 1.0
**Last Updated**: 2026-01-29
**Author**: AI Architecture Research
**Status**: Completed ✅

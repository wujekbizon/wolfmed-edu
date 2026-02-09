# RAG Resource Architecture Plan

## Overview

This document outlines the architecture for extending the RAG (Retrieval-Augmented Generation) system to support user-specific resources (notes and materials) alongside existing MCP-managed documentation files.

## Current State

### Existing Components

- **MCP Server**: Manages `/docs` files via `docs://` protocol
- **API Route** (`/api/mcp/resources`): Lists available MCP resources
- **RagCellForm**: Provides autocomplete for resource references using `@` character
- **useResourceAutocomplete**: Fetches and manages available resources
- **Clerk Auth**: User authentication system

### Current Flow

1. User types `@` in RagCell
2. `useResourceAutocomplete` fetches from `/api/mcp/resources`
3. Shows autocomplete with available docs
4. User selects resource → inserts into question
5. RAG action processes question with referenced resources

## Problem Statement

Users need to reference their own notes and materials (stored in database) alongside documentation files when asking RAG questions. Currently, only MCP documentation files are available in autocomplete.

## Solution Architecture

### Primary Approach: Server-Side Resource Aggregation

**Philosophy**: Compose all available resources at the API layer, keeping resource types separate but presenting a unified interface.

#### Resource URI Scheme

```
docs://filename.md          # MCP documentation files
note://noteId               # User notes from database
material://materialId       # User materials from database
```

#### Benefits

- ✅ Clean separation of concerns
- ✅ No prop drilling required
- ✅ Single source of truth for available resources
- ✅ Easy to extend with new resource types
- ✅ Works naturally with existing authentication
- ✅ MCP stays focused on external/static resources
- ✅ Database queries happen server-side where they belong

---

## Implementation Plan

### Phase 1: Extend API Route (Default Implementation)

#### Step 1.1: Update `/api/mcp/resources/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { mcpServer } from '@/server/mcp/server';
import { getUserNotes, getUserMaterials } from '@/lib/db';

export async function GET() {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    // Fetch MCP documentation resources
    const mcpResult = await mcpServer.readResource('docs://list');
    const fileList = mcpResult.contents?.[0]?.text 
      ? JSON.parse(mcpResult.contents[0].text) 
      : [];
    
    // Map MCP docs to resource format
    const docResources = fileList.map((filename: string) => ({
      name: `docs://${filename}`,
      displayName: filename.replace('.md', '').replace(/_/g, ' '),
      type: 'doc',
      icon: '📚'
    }));

    // Fetch user-specific resources if authenticated
    let userResources = [];
    if (userId) {
      const [notes, materials] = await Promise.all([
        getUserNotes(userId),
        getUserMaterials(userId)
      ]);
      
      // Map notes to resource format
      const noteResources = notes.map(note => ({
        name: `note://${note.id}`,
        displayName: note.title,
        type: 'note',
        icon: '📝',
        metadata: {
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      }));
      
      // Map materials to resource format
      const materialResources = materials.map(material => ({
        name: `material://${material.id}`,
        displayName: material.title,
        type: 'material',
        icon: '📄',
        metadata: {
          fileType: material.fileType,
          createdAt: material.createdAt
        }
      }));
      
      userResources = [...noteResources, ...materialResources];
    }

    // Combine all resources
    const allResources = [...docResources, ...userResources];

    return NextResponse.json({ 
      resources: allResources,
      counts: {
        docs: docResources.length,
        notes: userResources.filter(r => r.type === 'note').length,
        materials: userResources.filter(r => r.type === 'material').length
      }
    });
  } catch (error) {
    console.error('Failed to list resources:', error);
    return NextResponse.json({ 
      resources: [],
      error: 'Failed to fetch resources' 
    }, { status: 500 });
  }
}
```

#### Step 1.2: Update Resource Type Definition

```typescript
// types/resourceTypes.ts
export interface Resource {
  name: string;           // URI: docs://file.md, note://123, material://456
  displayName: string;    // Human-readable name
  type: 'doc' | 'note' | 'material';
  icon?: string;          // Optional icon for UI
  metadata?: {            // Optional metadata for filtering/display
    createdAt?: Date;
    updatedAt?: Date;
    fileType?: string;
    [key: string]: any;
  };
}

export interface ResourcesResponse {
  resources: Resource[];
  counts?: {
    docs: number;
    notes: number;
    materials: number;
  };
  error?: string;
}
```

#### Step 1.3: Update `useResourceAutocomplete` Hook

```typescript
// hooks/useResourceAutocomplete.ts
import { useState, useEffect } from 'react';
import type { Resource } from '@/types/resourceTypes';

export function useResourceAutocomplete() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/mcp/resources');
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
          setResources([]);
        } else {
          setResources(data.resources || []);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        setError('Failed to load resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  return { resources, loading, error };
}
```

#### Step 1.4: Enhance ResourceAutocomplete UI (Optional)

```typescript
// components/cells/ResourceAutocomplete.tsx
export function ResourceAutocomplete({ 
  resources, 
  selectedIndex, 
  onSelect, 
  loading 
}: ResourceAutocompleteProps) {
  // Group resources by type for better UX
  const groupedResources = resources.reduce((acc, resource) => {
    const type = resource.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="absolute bottom-full mb-2 w-full bg-white border border-zinc-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
      {loading && (
        <div className="px-4 py-2 text-sm text-zinc-500">
          Loading resources...
        </div>
      )}
      
      {!loading && Object.entries(groupedResources).map(([type, items]) => (
        <div key={type}>
          <div className="px-4 py-1 text-xs font-semibold text-zinc-500 uppercase bg-zinc-50">
            {type}s
          </div>
          {items.map((resource, idx) => (
            <button
              key={resource.name}
              onClick={() => onSelect(resource.name)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 ${
                idx === selectedIndex ? 'bg-zinc-100' : ''
              }`}
            >
              <span className="mr-2">{resource.icon}</span>
              {resource.displayName}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Step 1.5: Update RAG Action to Handle Multiple Resource Types

```typescript
// actions/rag-actions.ts
import { auth } from '@clerk/nextjs/server';
import { mcpServer } from '@/server/mcp/server';
import { getNoteById, getMaterialById } from '@/lib/db';

export async function askRagQuestion(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { status: 'ERROR', message: 'Unauthorized' };
  }

  const question = formData.get('question') as string;
  const cellId = formData.get('cellId') as string;

  // Extract resource references from question
  const resourceRefs = extractResourceReferences(question);
  
  // Fetch content for all referenced resources
  const contextContents = await Promise.all(
    resourceRefs.map(ref => fetchResourceContent(ref, userId))
  );

  // Build context for RAG
  const context = contextContents
    .filter(Boolean)
    .map(content => content.text)
    .join('\n\n---\n\n');

  // Call RAG system with context
  const answer = await ragSystem.ask({
    question,
    context,
    userId
  });

  return {
    status: 'SUCCESS',
    message: answer.text,
    values: {
      sources: answer.sources,
      usedResources: resourceRefs
    }
  };
}

// Helper: Extract resource references from question
function extractResourceReferences(text: string): string[] {
  const regex = /@(docs|note|material):\/\/[\w-\.]+/g;
  return text.match(regex) || [];
}

// Helper: Fetch content based on resource type
async function fetchResourceContent(uri: string, userId: string) {
  try {
    if (uri.startsWith('docs://')) {
      const result = await mcpServer.readResource(uri);
      return {
        uri,
        text: result.contents?.[0]?.text || '',
        type: 'doc'
      };
    } else if (uri.startsWith('note://')) {
      const noteId = uri.replace('note://', '');
      const note = await getNoteById(noteId, userId);
      return {
        uri,
        text: note.content,
        type: 'note'
      };
    } else if (uri.startsWith('material://')) {
      const materialId = uri.replace('material://', '');
      const material = await getMaterialById(materialId, userId);
      return {
        uri,
        text: material.content || material.extractedText,
        type: 'material'
      };
    }
  } catch (error) {
    console.error(`Failed to fetch resource ${uri}:`, error);
    return null;
  }
}
```

#### Step 1.6: Create Database Query Functions

```typescript
// lib/db/notes.ts
import { db } from '@/lib/db';

export async function getUserNotes(userId: string) {
  return await db.note.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getNoteById(noteId: string, userId: string) {
  return await db.note.findFirst({
    where: { 
      id: noteId,
      userId  // Security: ensure user owns the note
    }
  });
}
```

```typescript
// lib/db/materials.ts
import { db } from '@/lib/db';

export async function getUserMaterials(userId: string) {
  return await db.material.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      fileType: true,
      content: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getMaterialById(materialId: string, userId: string) {
  return await db.material.findFirst({
    where: { 
      id: materialId,
      userId  // Security: ensure user owns the material
    }
  });
}
```

---

### Phase 2: Full MCP Integration (Optional Future Enhancement)

**When to consider**: If you need to integrate external systems, add caching layers, or want protocol-level consistency.

#### Approach

Extend MCP server to handle user resources through custom protocols:

```typescript
// server/mcp/userResourceHandler.ts
class UserResourceHandler {
  async handleNoteProtocol(noteId: string, userId: string) {
    const note = await getNoteById(noteId, userId);
    return {
      contents: [{
        uri: `note://${noteId}`,
        mimeType: 'text/markdown',
        text: note.content
      }]
    };
  }

  async handleMaterialProtocol(materialId: string, userId: string) {
    const material = await getMaterialById(materialId, userId);
    return {
      contents: [{
        uri: `material://${materialId}`,
        mimeType: material.mimeType,
        text: material.content
      }]
    };
  }

  async listUserResources(userId: string) {
    const [notes, materials] = await Promise.all([
      getUserNotes(userId),
      getUserMaterials(userId)
    ]);
    
    return {
      resources: [
        ...notes.map(n => ({ uri: `note://${n.id}`, name: n.title })),
        ...materials.map(m => ({ uri: `material://${m.id}`, name: m.title }))
      ]
    };
  }
}
```

#### Benefits of Full MCP Integration

- Unified protocol handling
- Better caching opportunities
- Consistent error handling
- Easier to add external resource providers
- Protocol-level security/authorization

#### Trade-offs

- More complex setup
- MCP server needs user context injection
- Potentially overkill for simple database queries

---

## Security Considerations

### Authentication & Authorization

1. **API Route Level**
   - Always verify `userId` from Clerk auth
   - Return empty arrays for unauthenticated users
   - Never expose other users' resources

2. **Resource Fetching**
   - Always include `userId` in database queries
   - Use `findFirst` with `where: { userId }` to prevent unauthorized access
   - Validate resource ownership before returning content

3. **RAG Action Level**
   - Re-verify authentication
   - Check resource ownership when fetching content
   - Sanitize user inputs before querying

### Example Security Pattern

```typescript
// Always use this pattern for user resource queries
export async function getResourceSafely(
  resourceId: string, 
  userId: string, 
  resourceType: 'note' | 'material'
) {
  const resource = await db[resourceType].findFirst({
    where: { 
      id: resourceId,
      userId // Critical: prevents accessing other users' data
    }
  });
  
  if (!resource) {
    throw new Error(`${resourceType} not found or access denied`);
  }
  
  return resource;
}
```

---

## Performance Considerations

### Caching Strategy

```typescript
// Optional: Add caching for resource lists
import { unstable_cache } from 'next/cache';

const getCachedUserResources = unstable_cache(
  async (userId: string) => {
    const [notes, materials] = await Promise.all([
      getUserNotes(userId),
      getUserMaterials(userId)
    ]);
    return { notes, materials };
  },
  ['user-resources'],
  { 
    revalidate: 60, // Cache for 60 seconds
    tags: ['user-resources'] 
  }
);
```

### Database Optimization

```typescript
// Only select needed fields
select: {
  id: true,
  title: true,
  // Don't fetch content field for list view
}

// Add database indexes
// migrations/add_resource_indexes.sql
CREATE INDEX idx_notes_user_updated ON notes(user_id, updated_at DESC);
CREATE INDEX idx_materials_user_created ON materials(user_id, created_at DESC);
```

### Lazy Loading

Consider loading resources only when autocomplete is opened:

```typescript
export function useResourceAutocomplete({ lazy = false } = {}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    if (loading || (resources.length > 0 && lazy)) return;
    // ... fetch logic
  }, [loading, resources.length, lazy]);

  // Only fetch on mount if not lazy
  useEffect(() => {
    if (!lazy) {
      fetchResources();
    }
  }, [lazy, fetchResources]);

  return { resources, loading, fetchResources };
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/api/mcp/resources.test.ts
describe('GET /api/mcp/resources', () => {
  it('returns only docs for unauthenticated users', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.resources.every(r => r.type === 'doc')).toBe(true);
  });

  it('returns docs + user resources for authenticated users', async () => {
    mockAuth({ userId: 'user123' });
    const response = await GET();
    const data = await response.json();
    expect(data.resources.some(r => r.type === 'note')).toBe(true);
    expect(data.resources.some(r => r.type === 'material')).toBe(true);
  });

  it('handles database errors gracefully', async () => {
    mockAuth({ userId: 'user123' });
    mockDbError();
    const response = await GET();
    expect(response.status).toBe(500);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/rag-with-resources.test.ts
describe('RAG with mixed resources', () => {
  it('can reference docs, notes, and materials in one question', async () => {
    const formData = new FormData();
    formData.append('question', 
      'Compare @docs://anatomy.md with @note://123 and @material://456'
    );
    
    const result = await askRagQuestion(EMPTY_FORM_STATE, formData);
    expect(result.status).toBe('SUCCESS');
    expect(result.values.usedResources).toHaveLength(3);
  });
});
```

---

## Migration Plan

### Step-by-Step Rollout

1. **Week 1: API Route Extension**
   - Implement Phase 1, Step 1.1-1.3
   - Deploy behind feature flag
   - Test with internal users

2. **Week 2: RAG Action Update**
   - Implement Step 1.5
   - Add resource content fetching
   - Test multi-resource queries

3. **Week 3: UI Enhancements**
   - Implement grouped autocomplete
   - Add visual indicators for resource types
   - User testing and feedback

4. **Week 4: Performance & Security Audit**
   - Add caching layer
   - Security review
   - Load testing

### Feature Flag Pattern

```typescript
// lib/features.ts
export const FEATURE_FLAGS = {
  USER_RESOURCES_IN_RAG: process.env.NEXT_PUBLIC_ENABLE_USER_RESOURCES === 'true'
};

// In API route
if (!FEATURE_FLAGS.USER_RESOURCES_IN_RAG) {
  // Return only MCP docs (old behavior)
  return NextResponse.json({ resources: docResources });
}
```

---

## Future Enhancements

### 1. Resource Versioning
Track which version of a note/material was used in a RAG query

### 2. Resource Permissions
Share notes/materials between users with proper access control

### 3. External Integrations
- Google Drive files: `gdrive://fileId`
- Notion pages: `notion://pageId`
- GitHub repos: `github://owner/repo/file`

### 4. Smart Resource Suggestions
ML-based recommendations for relevant resources based on question context

### 5. Resource Preview
Show snippet/preview of resource content in autocomplete

---

## Troubleshooting

### Common Issues

**Issue**: Resources not appearing in autocomplete
- Check Clerk auth is working: `const { userId } = await auth()`
- Verify database queries return data
- Check browser console for fetch errors

**Issue**: "Access denied" errors when using resources
- Ensure `userId` is passed to all database queries
- Check resource ownership in RAG action
- Verify Clerk session is valid

**Issue**: Slow autocomplete performance
- Add database indexes on `userId` columns
- Implement caching strategy
- Consider pagination for users with many resources

---

## Conclusion

This architecture provides a clean, scalable solution for integrating user-specific resources into the RAG system while maintaining security and performance. The default implementation (API Route Extension) offers immediate value with minimal complexity, while the MCP Integration path remains available for future scaling needs.

### Key Principles

✅ **Server-side composition** - Aggregate resources where authentication exists  
✅ **Protocol-based URIs** - Clean, extensible resource identification  
✅ **Security-first** - Always verify ownership before serving content  
✅ **Progressive enhancement** - Start simple, scale when needed  
✅ **Type safety** - Leverage TypeScript throughout


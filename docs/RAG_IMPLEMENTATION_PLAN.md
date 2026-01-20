# RAG System Implementation Plan

## Architecture Overview

**Pattern**: Server-first with Server Actions + Google File Search Store
**SDK**: `@google/genai` (official Google GenAI SDK)

## Key Changes from Original Plan

✅ **Correct API**: Using `fileSearchStore` (not "corpus")
✅ **Correct SDK**: `@google/genai` (not `@google/generative-ai`)
✅ **Admin Dashboard**: Manage stores via `/admin` route
✅ **Zod**: Already installed, using existing

---

## Dependencies

```bash
pnpm install @google/genai
```

---

## Implementation Steps

### 1. Environment Setup

```env
GOOGLE_API_KEY=your_api_key_here
GOOGLE_FILE_SEARCH_STORE_NAME=projects/.../fileSearchStores/...
```

### 2. Create Google RAG Helper

**File:** `/src/lib/google-rag.ts`

```typescript
import { GoogleGenAI } from '@google/genai';

// Initialize client
// Create/get fileSearchStore
// Upload files to store
// Query with fileSearch tool
```

**Functions:**
- `createFileSearchStore(displayName)` → storeName
- `uploadDocumentsToStore(storeName, files[])` → operation status
- `queryWithFileSearch(question, storeName)` → response
- Error handling

### 3. Admin Dashboard Components

**Route:** `/admin/rag-management`

**File:** `/src/app/(admin)/admin/rag-management/page.tsx`

**Features:**
- **Create Store**: Button to create new fileSearchStore
- **Upload Documents**: Bulk upload `/docs/*.md` files
- **Store Status**: Display store name, file count, status
- **Document List**: Show uploaded documents
- **Test Query**: Input to test RAG queries
- **Store Info**: Display current `GOOGLE_FILE_SEARCH_STORE_NAME`

**Components:**
- `CreateStoreButton.tsx` - Create new store
- `UploadDocsButton.tsx` - Upload all medical docs
- `StoreStatusCard.tsx` - Display store info
- `DocumentListTable.tsx` - List uploaded documents
- `TestQueryForm.tsx` - Test RAG functionality

### 4. Admin Server Actions

**File:** `/src/actions/admin-rag-actions.ts`

```typescript
// Admin-only actions (check auth + admin role)
export async function createFileSearchStore(formData)
export async function uploadMedicalDocs(formData)
export async function getStoreStatus()
export async function listStoreDocuments()
export async function testRagQuery(formData)
```

**Security:**
- Check `userId` from Clerk
- Verify admin role/permissions
- Rate limiting for uploads
- Zod validation

### 5. User-Facing Server Action

**File:** `/src/actions/rag-actions.ts`

```typescript
export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState>
```

**Pattern:** Follow existing `updateMotto` action:
- `useActionState` hook
- Auth check with Clerk
- Rate limiting: **10 queries/hour per user**
- Zod validation: `RagQuerySchema`
- Call `queryWithFileSearch()`
- Return formatted response

### 6. Update RagCell Component

**File:** `/src/components/cells/RagCell.tsx`

**Updates:**
- Convert to form with `useActionState`
- Import `askRagQuestion` action
- Add `SubmitButton` component (reuse existing)
- Add `<RagResponse>` component
- Add loading state
- Add `<FieldError>` for validation (reuse existing)
- Pre-fill input with `cell.content`

### 7. Create Response Components

**File:** `/src/components/cells/RagResponse.tsx`
- Display AI response with markdown rendering
- Source citations (if available)
- Copy button for response
- Zinc/slate theme styling

**File:** `/src/components/cells/RagLoadingState.tsx`
- Animated loading indicator
- Polish message: "Szukam odpowiedzi w dokumentach..."
- Pulsing dots animation

### 8. Zod Schema

**File:** `/src/server/schema.ts`

```typescript
export const RagQuerySchema = z.object({
  question: z.string()
    .min(5, "Pytanie musi mieć min. 5 znaków")
    .max(500, "Pytanie zbyt długie"),
  cellId: z.string(),
})

// Admin schemas
export const CreateStoreSchema = z.object({
  displayName: z.string().min(3),
})
```

### 9. Database (Optional) - ⏭️ SKIP

---

## File Structure

```
/src
  /app
    /(admin)
      /admin
        /rag-management
          page.tsx                    # NEW - Admin dashboard
          /components
            CreateStoreButton.tsx     # NEW
            UploadDocsButton.tsx      # NEW
            StoreStatusCard.tsx       # NEW
            DocumentListTable.tsx     # NEW
            TestQueryForm.tsx         # NEW

  /actions
    rag-actions.ts                    # NEW - User actions
    admin-rag-actions.ts              # NEW - Admin actions

  /components
    /cells
      RagCell.tsx                     # UPDATE - Add form
      RagResponse.tsx                 # NEW
      RagLoadingState.tsx             # NEW

  /lib
    google-rag.ts                     # NEW - Core RAG logic

  /server
    schema.ts                         # UPDATE - Add schemas

/docs
  *.md                                # Existing medical docs (13 files)
```

---

## User Flow

### Admin Setup (One-time):

1. Navigate to `/admin/rag-management`
2. Click "Create File Search Store" → store created
3. Copy store name → Add to `.env`: `GOOGLE_FILE_SEARCH_STORE_NAME=...`
4. Click "Upload Medical Documents" → uploads all `/docs/*.md`
5. Wait for upload operation to complete
6. Test query to verify setup

### User Query Flow:

1. User clicks "Wyjaśnij z AI" on topic
2. Navigates to `/panel/nauka`
3. RAG cell auto-created with topic pre-filled
4. User edits/reviews question
5. Clicks "Wyjaśnij" button
6. Form submits → `askRagQuestion` server action
7. Action: validates, rate-limits, checks auth
8. Calls `queryWithFileSearch(question, storeName)`
9. Gemini searches store + generates answer
10. Response displays in `<RagResponse>` component
11. Optional: Save response to cell for persistence

---

## Correct API Usage

### Create Store:
```typescript
const store = await ai.fileSearchStores.create({
  config: { displayName: 'wolfmed-medical-docs' }
});
// Returns: { name: 'projects/.../fileSearchStores/...' }
```

### Upload Files:
```typescript
let operation = await ai.fileSearchStores.uploadToFileSearchStore({
  file: 'docs/Anatomia.md',
  fileSearchStoreName: store.name,
  config: { displayName: 'Anatomia' }
});

// Poll until done
while (!operation.done) {
  await new Promise(resolve => setTimeout(resolve, 5000));
  operation = await ai.operations.get({ operation });
}
```

### Query with File Search:
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash-exp",
  contents: question,
  config: {
    tools: [{
      fileSearch: {
        fileSearchStoreNames: [storeName]
      }
    }]
  }
});
```

---

## Rate Limiting

- **User Queries**: 10 per hour per user (key: `"rag:query"`)
- **Admin Uploads**: 5 per hour (key: `"rag:admin:upload"`)
- Use existing `checkRateLimit` helper
- Error: "Zbyt wiele zapytań, spróbuj za X minut"

---

## Error Handling

| Error Type | User Message |
|------------|--------------|
| Store not found | "Skonfiguruj File Search Store w panelu admina" |
| API errors | "Wystąpił błąd, spróbuj ponownie" |
| Rate limit | "Zbyt wiele zapytań, spróbuj za X minut" |
| Empty response | "Nie znalazłem odpowiedzi w dokumentach" |
| Validation | Display via `FieldError` component |
| Upload failure | "Nie można przesłać dokumentów" |

---

## Security

1. **API Key**: Store in `.env.local`, never commit
2. **Admin Auth**: Verify admin role for all admin actions
3. **User Auth**: Clerk authentication required for queries
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Zod schemas on all inputs
6. **Error Messages**: Don't expose internal errors

---

## Testing Checklist

- [ ] Install `@google/genai` with pnpm
- [ ] Admin dashboard accessible at `/admin/rag-management`
- [ ] Create fileSearchStore works
- [ ] Upload documents to store works
- [ ] Store status displays correctly
- [ ] Environment variable configured
- [ ] User RAG cell creates with topic
- [ ] Form validation works (5-500 chars)
- [ ] Rate limiting triggers
- [ ] Auth checks work (user + admin)
- [ ] Gemini returns relevant answers
- [ ] Response displays with markdown
- [ ] Loading states show
- [ ] Error messages display properly

---

## Next Steps

1. ⬜ Install `@google/genai` with pnpm
2. ⬜ Create `/src/lib/google-rag.ts` helper
3. ⬜ Create admin dashboard route + components
4. ⬜ Create admin server actions
5. ⬜ Create user server action
6. ⬜ Update `RagCell.tsx` component
7. ⬜ Create `RagResponse.tsx` + `RagLoadingState.tsx`
8. ⬜ Add Zod schemas
9. ⬜ Admin: Create store via dashboard
10. ⬜ Admin: Upload medical docs
11. ⬜ Test complete user flow
12. ⬜ Commit + Push to `claude/review-rag-plan-CBfZE`

---

**Plan Status:** Ready for Review → Implementation
**Last Updated:** 2026-01-20

# RAG System Implementation Plan

## Architecture Overview

**Pattern**: Server-first with Server Actions + Google File Search Store
**SDK**: `@google/genai` (official Google GenAI SDK)
**Storage**: PostgreSQL database for RAG configuration
**AI Model**: `gemini-2.5-flash` (only model that works)

## Key Implementation Details

✅ **Correct API**: Using `fileSearchStore` (not "corpus")
✅ **Correct SDK**: `@google/genai` (not `@google/generative-ai`)
✅ **Admin Dashboard**: `/admin/rag` route with full management
✅ **Database Storage**: RAG config stored in database (not .env)
✅ **Manual Upload**: File input with drag-drop (not bulk /docs folder)
✅ **System Prompts**: Medical education assistant with Polish responses
✅ **Chat UI**: Conversation-style interface for user queries
✅ **Delete Functionality**: Admin can delete stores from UI and database

---

## Implementation Status

### ✅ 1. Environment Setup

```env
GOOGLE_API_KEY=your_api_key_here
# GOOGLE_FILE_SEARCH_STORE_NAME - REMOVED (now stored in database)
```

**Note:** Store configuration is now in database table `wolfmed_rag_config`, not environment variables.

---

### ✅ 2. Database Schema

**File:** `/src/server/db/schema.ts`

```typescript
export const ragConfig = createTable("rag_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeName: text("store_name").notNull().unique(),
  storeDisplayName: text("store_display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Migration:** `pnpm db:push` to create table

**Queries:** `/src/server/rag-queries.ts`
- `getRagConfig()` - Get active store configuration
- `setRagConfig(storeName, displayName)` - Save/update store
- `deleteRagConfig(storeName)` - Remove store from database

---

### ✅ 3. Google RAG Helper

**File:** `/src/lib/google-rag.ts`

**Functions:**
- `createFileSearchStore(displayName)` → storeName
- `uploadFiles(storeName, files[])` → upload results
- `queryWithFileSearch(question, storeName?)` → AI response
- `getStoreInfo(storeName)` → store metadata
- `listStoreDocuments(storeName)` → document list
- `deleteFileSearchStore(storeName)` → delete store from Google

**Key Implementation:**
- Converts browser `File` objects to buffers for upload
- Polls Google operations until completion (5-second intervals, 60 max attempts)
- Supports .md, .txt, .pdf files with proper mime type detection
- Uses database config as primary source, env var as fallback

---

### ✅ 4. System Prompts

**File:** `/src/lib/rag-prompts.ts`

```typescript
export const SYSTEM_PROMPT = `Jesteś asystentem edukacji medycznej Wolfmed.

TWOJE ŹRÓDŁO WIEDZY:
- Masz dostęp do dokumentacji medycznej przez file search
- Dokumenty są po polsku i zawierają: materiały edukacyjne, procedury medyczne, terminologię

ZASADY ODPOWIEDZI:
1. Odpowiadaj TYLKO na podstawie informacji z dokumentów
2. Jeśli odpowiedzi NIE MA w dokumentach, odpowiedz: "Nie mam tej informacji w dostępnej dokumentacji"
3. Zawsze cytuj źródłowy dokument w odpowiedzi
4. Używaj poprawnej polskiej terminologii medycznej
5. Odpowiadaj jasno i edukacyjnie
...`

export function enhanceUserQuery(question: string): string
```

**Features:**
- Medical education context
- Polish language enforcement
- Document citation requirements
- Structured response format

---

### ✅ 5. Admin Dashboard

**Route:** `/admin/rag`

**File:** `/src/app/admin/rag/page.tsx`

**Components:** (All in `/src/components/rag/`)
- `CreateStoreSection.tsx` - Create new file search store
- `UploadDocsSection.tsx` - Manual file upload with drag-drop
- `StoreStatusCard.tsx` - Display store info + delete button
- `DocumentListTable.tsx` - List uploaded documents
- `TestQueryForm.tsx` - Test RAG functionality

**Features:**
- Server component pattern with `Suspense`
- No `requireAdmin()` in page (proxy.ts handles it)
- Drag-drop file upload zone
- File list with individual remove buttons
- Delete store functionality with confirmation

**Navigation:**
- Desktop: Admin header → "RAG" link
- Mobile: Admin header mobile nav → "RAG" link

---

### ✅ 6. Admin Server Actions

**File:** `/src/actions/admin-rag-actions.ts`

```typescript
// All actions use database, not env vars
export async function createFileSearchStoreAction(formState, formData): FormState
export async function uploadFilesAction(formState, formData): FormState
export async function getStoreStatusAction(): Promise<{success, data, error}>
export async function listStoreDocumentsAction(): Promise<{success, data, error}>
export async function testRagQueryAction(formState, formData): FormState
export async function deleteFileSearchStoreAction(formState, formData): FormState
```

**Security:**
- `requireAdminAction()` in all actions
- Rate limiting: create/upload/delete (3/hour), test (10/hour)
- Zod validation on all inputs
- Database integration for store management

**Pattern:**
- Uses `EMPTY_FORM_STATE` from constants
- Returns with spread operator: `{ ...toFormState('SUCCESS', msg), values: { data } }`
- Never pass third parameter to `toFormState()`

---

### ✅ 7. User-Facing Server Action

**File:** `/src/actions/rag-actions.ts`

```typescript
export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState>
```

**Implementation:**
- Auth check with Clerk
- Rate limiting: **10 queries/hour per user** (`rag:query`)
- Zod validation: `RagQuerySchema`
- Calls `queryWithFileSearch()` (auto-fetches store from database)
- Returns answer in toast message (only for errors)
- Success response displays in chat UI

**Rate Limit Config:** `/src/lib/rateLimit.ts`
```typescript
'rag:query': { interval: 60 * 60 * 1000, maxRequests: 10 },
'rag:admin:test': { interval: 60 * 60 * 1000, maxRequests: 10 },
'rag:admin:upload': { interval: 60 * 60 * 1000, maxRequests: 3 },
'rag:admin:create-store': { interval: 60 * 60 * 1000, maxRequests: 3 },
'rag:admin:delete-store': { interval: 60 * 60 * 1000, maxRequests: 3 }
```

---

### ✅ 8. RagCell Component

**File:** `/src/components/cells/RagCell.tsx`

**Design:** Chat-style interface
- Fixed height container (500px) with scroll
- User questions appear on right (dark bubbles)
- AI responses appear on left (light bubbles)
- Fixed input at bottom
- Auto-scroll to new messages
- Toast only for errors (not success responses)

**Implementation:**
- Uses `useActionState` hook
- Form with textarea and SubmitButton
- Conversation history in ref with auto-scroll
- Conditional toast: `state.status === 'ERROR' ? useToastMessage(state) : null`

---

### ✅ 9. Response Components

**File:** `/src/components/cells/RagResponse.tsx`
- Markdown rendering for AI response
- Clean zinc/white styling
- Answer text with proper formatting

**File:** `/src/components/cells/RagLoadingState.tsx`
- Animated pulsing dots
- Polish message: "Szukam odpowiedzi w dokumentach medycznych..."
- Gray zinc theme

---

### ✅ 10. Zod Schemas

**Files:**
- `/src/lib/ragSchemas.ts` - RAG-specific schemas
- `/src/lib/adminRagSchemas.ts` - Admin schemas

```typescript
export const RagQuerySchema = z.object({
  question: z.string()
    .min(5, "Pytanie musi mieć min. 5 znaków")
    .max(500, "Pytanie zbyt długie"),
  cellId: z.string(),
})

export const CreateStoreSchema = z.object({
  displayName: z.string()
    .min(3, "Nazwa musi mieć min. 3 znaki")
    .max(100, "Nazwa zbyt długa"),
})

export const UploadFilesSchema = z.object({
  files: z.array(z.instanceof(File))
    .min(1, "Wybierz co najmniej jeden plik")
})

export const TestQuerySchema = z.object({
  question: z.string().min(5),
  storeName: z.string().optional()
})
```

---

## File Structure (Implemented)

```
/src
  /app
    /admin
      /rag
        page.tsx                          # ✅ Admin dashboard (server component)

  /actions
    rag-actions.ts                        # ✅ User actions
    admin-rag-actions.ts                  # ✅ Admin actions

  /components
    /cells
      RagCell.tsx                         # ✅ Chat-style UI
      RagResponse.tsx                     # ✅ Response display
      RagLoadingState.tsx                 # ✅ Loading animation

    /rag
      CreateStoreSection.tsx              # ✅ Create store form
      UploadDocsSection.tsx               # ✅ File upload with drag-drop
      StoreStatusCard.tsx                 # ✅ Status + delete button
      DocumentListTable.tsx               # ✅ Document list
      TestQueryForm.tsx                   # ✅ Test query form

  /lib
    google-rag.ts                         # ✅ Core RAG logic
    rag-prompts.ts                        # ✅ System prompts
    ragSchemas.ts                         # ✅ User schemas
    adminRagSchemas.ts                    # ✅ Admin schemas
    rateLimit.ts                          # ✅ Updated with RAG limits

  /server
    /db
      schema.ts                           # ✅ Added ragConfig table
    rag-queries.ts                        # ✅ Database queries

/docs
  RAG_IMPLEMENTATION_PLAN.md              # ✅ This file (updated)
```

---

## User Flows

### Admin Setup:

1. Navigate to `/admin/rag` (link in admin header)
2. Click "Create File Search Store" → enter display name
3. Store created and saved to database automatically
4. Select files (.md, .txt, .pdf) via drag-drop or file input
5. Click "Prześlij Pliki" → files upload to Google
6. View uploaded documents in table
7. Test query to verify setup
8. (Optional) Delete store via "Usuń Store" button

### User Query Flow:

1. User clicks "Wyjaśnij z AI" on topic
2. Navigates to `/panel/nauka`
3. RAG cell auto-created with topic pre-filled
4. User edits/reviews question in chat input
5. Clicks "Wyślij" button
6. Loading state shows
7. AI response appears in chat bubble (left side)
8. User can ask follow-up questions
9. Conversation displays in chronological order

---

## API Usage Examples

### Create Store:
```typescript
const storeName = await createFileSearchStore('wolfmed-medical-docs')
await setRagConfig(storeName, 'wolfmed-medical-docs')
// Stored in database automatically
```

### Upload Files:
```typescript
const files = formData.getAll('files') as File[]
const results = await uploadFiles(storeName, files)
// Returns: { success: true, uploaded: [...], failed: [...] }
```

### Query with File Search:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: enhancedQuery,
  config: {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{
      fileSearch: {
        fileSearchStoreNames: [storeName]
      }
    }]
  }
})
```

### Delete Store:
```typescript
await deleteFileSearchStore(storeName)
await deleteRagConfig(storeName)
// Removes from Google and database
```

---

## Error Handling

| Error Type | User Message |
|------------|--------------|
| Store not configured | "File Search Store nie jest skonfigurowany" |
| API errors | "Wystąpił błąd podczas wyszukiwania odpowiedzi" |
| Rate limit | "Zbyt wiele zapytań. Spróbuj ponownie za X minut." |
| Empty response | "Nie znalazłem odpowiedzi w dokumentach" |
| Validation | Display via form state errors |
| Upload failure | Shows failed files in result message |
| No files selected | "Nie wybrano żadnych plików" |
| Invalid file type | "Nieprawidłowe typy plików: ..." |

---

## Security

1. **API Key**: Store in `.env`, never commit
2. **Admin Auth**:
   - `/admin` routes protected by `proxy.ts` middleware
   - `requireAdminAction()` in all admin server actions
3. **User Auth**: Clerk authentication required for queries
4. **Rate Limiting**: Redis-based with in-memory fallback
5. **Input Validation**: Zod schemas on all inputs
6. **Error Messages**: Generic messages, detailed logs in console
7. **Database Storage**: Production-ready (not .env hardcoding)

---

## Testing Checklist

- [x] Install `@google/genai` with pnpm
- [x] Create database migration for `ragConfig` table
- [x] Admin dashboard accessible at `/admin/rag`
- [x] Create fileSearchStore works and saves to database
- [x] Upload files with drag-drop works
- [x] File type validation (.md, .txt, .pdf)
- [x] Store status displays correctly
- [x] Delete store functionality works
- [x] Admin navigation link added (desktop + mobile)
- [x] User RAG cell displays chat UI
- [x] Form validation works (5-500 chars)
- [x] Rate limiting triggers for all actions
- [x] Auth checks work (user + admin)
- [x] System prompts enforce Polish medical responses
- [x] Gemini returns document-grounded answers
- [x] Response displays in chat bubbles
- [x] Loading states show
- [x] Toast only shows for errors (not success)
- [x] Auto-scroll to new messages
- [x] Error messages display properly

---

## Key Decisions Made

1. **Database Storage**: Chose database over .env for production scalability
2. **UUID Primary Key**: Used UUID for id, storeName as unique constraint for upsert
3. **Manual Upload**: File input with drag-drop instead of bulk /docs folder
4. **Chat UI**: Conversation-style interface for better UX
5. **System Prompts**: Added medical education context for consistent responses
6. **Model Selection**: `gemini-2.5-flash` (only working model)
7. **Toast Pattern**: Conditional - errors only, success shows in chat
8. **Delete Functionality**: Full delete (Google + database) via admin UI
9. **Navigation**: Simple "RAG" link in admin header
10. **Form Pattern**: Follow existing project patterns (EMPTY_FORM_STATE, spread operator)

---

## Production Deployment

1. Set `GOOGLE_API_KEY` in production environment
2. Run `pnpm db:push` to create `wolfmed_rag_config` table
3. Admin creates store via `/admin/rag` dashboard
4. Upload medical documents (.md, .txt, .pdf files)
5. Test queries to verify setup
6. Users can access RAG via `/panel/nauka` cells

**Note:** No `.env` variable needed for store name - automatically managed via database.

---

**Plan Status:** ✅ COMPLETED & IMPLEMENTED
**Last Updated:** 2026-01-21
**Branch:** `claude/review-rag-plan-CBfZE`
**Commits:**
- Database storage implementation
- UUID schema refactor
- File upload UI with drag-drop
- Admin navigation
- System prompts
- Delete functionality

# RAG System Implementation Plan

## Architecture Overview

**Pattern**: Server-first with Server Actions + Google File Search Store (FSS)

## SDK Decision

**Use: Google Generative AI SDK (Direct)**

**Why:**
- Native File API support for File Search Store
- Direct access to file uploads and corpus management
- Gemini 1.5 Pro supports grounding with files
- Vercel AI SDK doesn't support File Search Store

**Dependencies:**
```bash
npm install @google/generative-ai
```

## File Search Store Strategy

### Admin Setup (One-time):

1. **Upload Script** (`/scripts/upload-medical-docs.ts`)
   - Reads `/docs/*.md` files
   - Uploads to Google File Search Store
   - Creates corpus with medical documentation
   - Stores corpus ID in database or `.env`

2. **Store Corpus Reference**
   - Option A: Environment variable `GOOGLE_CORPUS_ID`
   - Option B: Database table `rag_corpus` with metadata

### Query Flow:

1. User asks question
2. Server action sends to Gemini with corpus grounding
3. Gemini searches files and generates contextualized answer
4. Return answer with sources (if available)

## Implementation Steps

### 1. Install Dependencies

```bash
npm install @google/generative-ai zod
```

### 2. Environment Setup

```env
GOOGLE_API_KEY=...
GOOGLE_CORPUS_ID=...  # After upload
```

### 3. Create Upload Script

**File:** `/scripts/upload-medical-docs.ts`

- Read all `/docs/*.md` files
- Upload via Google File API
- Create corpus
- Store corpus ID
- CLI tool for admin

### 4. Create Google RAG Helper

**File:** `/src/lib/google-rag.ts`

- Initialize Gemini client
- Query with file grounding
- Parse response with sources
- Error handling

### 5. Create Server Action

**File:** `/src/actions/rag-actions.ts`

```typescript
export async function askRagQuestion(
  formState: FormState,
  formData: FormData
): Promise<FormState>
```

**Responsibilities:**
- Auth check with Clerk
- Rate limiting (10 queries/hour)
- Zod validation with `RagQuerySchema`
- Call google-rag helper
- Return formatted response

**Pattern:** Follow `updateMotto` action in `/src/actions/actions.ts`:
- Use `useActionState` hook
- FormState return type
- Rate limiting with `checkRateLimit`
- Zod validation
- Error handling with `fromErrorToFormState`

### 6. Update RagCell Component

**File:** `/src/components/cells/RagCell.tsx`

**Current State:** Basic input with placeholder

**Updates Needed:**
- Convert to form with `useActionState` hook
- Import `askRagQuestion` action
- Add `SubmitButton` component
- Add response display area
- Add loading state
- Add error handling with `FieldError`
- Keep input pre-filled with `cell.content`

### 7. Create Supporting Components

#### New Components:

**`/src/components/cells/RagResponse.tsx`**
- Display AI response
- Markdown rendering (use `react-markdown` or similar)
- Source citations (if available from FSS)
- Copy button for response
- Styling: zinc/slate theme

**`/src/components/cells/RagLoadingState.tsx`**
- Animated loading indicator
- Message: "Szukam odpowiedzi w dokumentach..."
- Pulsing dots animation

#### Reuse Existing:
- `FieldError` - validation errors
- `SubmitButton` - form submission with loading state

### 8. Create Zod Schema

**File:** `/src/server/schema.ts`

```typescript
export const RagQuerySchema = z.object({
  question: z.string()
    .min(5, "Pytanie musi mieć min. 5 znaków")
    .max(500, "Pytanie zbyt długie"),
  cellId: z.string(),
})
```

### 9. Database (Optional)

If storing corpus metadata:

```sql
CREATE TABLE rag_corpus (
  id TEXT PRIMARY KEY,
  name TEXT,
  file_count INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## File Structure

```
/scripts
  upload-medical-docs.ts      # NEW - admin tool

/docs
  *.md                         # Existing medical documentation

/src
  /actions
    rag-actions.ts            # NEW - server action

  /components
    /cells
      RagCell.tsx             # UPDATE - add form + action
      RagResponse.tsx         # NEW - display response
      RagLoadingState.tsx     # NEW - loading state

  /lib
    google-rag.ts             # NEW - Google FSS integration

  /server
    schema.ts                 # UPDATE - add RagQuerySchema

  /store
    useCellsStore.ts          # UPDATE if needed for persistence
```

## Implementation Flow

### Admin Setup (One-time):

1. Run: `npm run upload-docs`
2. Script uploads `/docs/*.md` → Google File Search Store
3. Returns corpus ID
4. Add to `.env`: `GOOGLE_CORPUS_ID=...`

### User Query Flow:

1. User clicks "Wyjaśnij z AI" on topic
2. Navigates to `/panel/nauka`
3. RAG cell auto-created with topic pre-filled
4. User edits/reviews question
5. Clicks "Wyjaśnij" button
6. Form submits → `askRagQuestion` server action
7. Action validates, rate-limits, checks auth
8. Calls `queryRagWithFiles(question, corpusId)`
9. Gemini searches corpus + generates contextualized answer
10. Response displayed in `RagResponse` component
11. Optional: Save response to cell for persistence

## Rate Limiting

- **10 queries per hour per user**
- Key: `"rag:query"`
- Use existing `checkRateLimit` helper
- Error message: "Zbyt wiele zapytań, spróbuj za X minut"

## Error Handling

| Error Type | User Message |
|------------|--------------|
| File Search Store connection | "Nie mogę połączyć się z bazą wiedzy" |
| API errors | "Wystąpił błąd, spróbuj ponownie" |
| Rate limit exceeded | "Zbyt wiele zapytań, spróbuj za X minut" |
| Empty response | "Nie znalazłem odpowiedzi w dokumentach" |
| Validation errors | Display via `FieldError` component |

## Google File Search Store Integration

### Upload Format:

- Text files (.md, .txt)
- Each file tagged with category metadata
- Create single corpus for all medical docs
- Files from `/docs` directory:
  - Anatomia.md
  - Fizjologia.md
  - Biochemia_z_Biofizyka.md
  - ... (13 total files)

### Query Format:

```typescript
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: question }] }],
  tools: [{
    fileData: { corpusId: CORPUS_ID }
  }]
})
```

### Response Includes:

- Answer text
- Source file references (optional)
- Confidence scores (optional)
- Grounded in uploaded medical documentation

## Security Considerations

1. **API Key Protection**: Store in `.env.local`, never commit
2. **Rate Limiting**: Prevent abuse with per-user limits
3. **Auth Required**: All queries require Clerk authentication
4. **Input Validation**: Zod schema validation on all inputs
5. **Error Messages**: Don't expose internal errors to users

## Testing Checklist

- [ ] Upload script successfully creates corpus
- [ ] Environment variables configured
- [ ] RAG cell auto-creates with topic
- [ ] Form validation works (min 5 chars, max 500)
- [ ] Rate limiting triggers correctly
- [ ] Auth check prevents unauthorized access
- [ ] Gemini returns relevant answers
- [ ] Response displays correctly with markdown
- [ ] Loading states show during query
- [ ] Error messages display appropriately
- [ ] Sources/citations display (if available)

## Future Enhancements

1. **Streaming Responses**: Real-time streaming of AI responses
2. **Response Caching**: Cache common queries
3. **Source Citations**: Display which document sections were used
4. **Follow-up Questions**: Context-aware follow-ups
5. **Response Rating**: Let users rate answer quality
6. **Admin Dashboard**: Manage corpus, view analytics
7. **Multi-language**: Support English queries

## Dependencies Summary

```json
{
  "dependencies": {
    "@google/generative-ai": "latest",
    "zod": "^3.x",
    "react-markdown": "^9.x" // Optional for markdown rendering
  }
}
```

## Environment Variables

```env
# Required
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CORPUS_ID=corpus_id_after_upload

# Optional
RAG_RATE_LIMIT_PER_HOUR=10
RAG_MAX_QUESTION_LENGTH=500
```

## Next Steps

1. ✅ Plan approved
2. ⬜ Install dependencies
3. ⬜ Set up environment variables
4. ⬜ Create upload script
5. ⬜ Upload medical docs (admin task)
6. ⬜ Create google-rag helper
7. ⬜ Create server action
8. ⬜ Update RagCell component
9. ⬜ Create response components
10. ⬜ Test complete flow
11. ⬜ Deploy to production

---

**Plan Status:** Approved - Ready for Implementation
**Last Updated:** 2026-01-19

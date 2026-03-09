# Lecture & Media Feature – Implementation Plan

> Status: **DRAFT – awaiting final review before implementation**

---

## 1. What We Are Building

| Piece | Description |
|-------|-------------|
| **PlanCell (trimmed)** | Keep only "Generuj Wykład" + "Zapisz skrypt do notatki". Remove inline audio player. |
| **MediaCell** | New cell type `media`. Designed to support audio and video (audio only for now). Inserted automatically after lecture generation. |
| **`lectures` table** | Persists generated lectures (audio URL via UploadThing, script text, content hash for dedup). |
| **UploadThing extension** | New `lectureAudio` route – MP3, max 32MB, counts against user storage quota. |
| **Learning Center – Wykłady** | New route `/panel/nauka/wykłady` – list all saved lecture recordings fetched from UploadThing. Sort, filter, play, delete. |

**Out of scope for this implementation:** mini-courses, video playback (cell is architected for it but won't be wired up yet).

---

## 2. Database Schema Changes

### 2a. New table – `lectures`

```typescript
lectures: createTable("lectures", {
  id:          uuid().primaryKey().defaultRandom(),
  userId:      varchar({ length: 256 }).notNull(),      // Clerk user ID
  title:       varchar({ length: 256 }).notNull(),
  contentHash: varchar({ length: 64 }).notNull(),       // SHA-256 of planContent → dedup key
  audioKey:    varchar({ length: 256 }).notNull(),       // UploadThing file key (for deletion)
  audioUrl:    text().notNull(),                         // UploadThing download URL (for playback)
  scriptText:  text().notNull(),                         // raw lecture script (transcript view)
  duration:    integer(),                                // seconds – patched by client after first play
  createdAt:   timestamp().defaultNow().notNull(),
  updatedAt:   timestamp().defaultNow().notNull(),
})

// Indexes
index("lectures_user_id_idx").on(lectures.userId)
index("lectures_content_hash_idx").on(lectures.userId, lectures.contentHash)
```

**Deduplication logic**: before calling Gemini + TTS, SHA-256 hash the `planContent`. Query `lectures` for `userId + contentHash`. If found → return existing `audioUrl` and `scriptText` immediately. No API calls, no charge.

### 2b. UploadThing router extension

New endpoint in `src/app/api/uploadthing/core.ts`:

```typescript
lectureAudio: f({ "audio/mpeg": { maxFileSize: "32MB", maxFileCount: 1 } })
  .middleware(async ({ req }) => {
    const { userId } = await auth()
    if (!userId) throw new UploadThingError("Unauthorized")
    return { userId }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    return { url: file.url, key: file.key }
  })
```

**Storage quota**: lecture audio counts against `userLimits.storageUsed` (same 32MB per lecture max, same atomic transaction pattern as `materials.ts`). No separate quota table needed.

---

## 3. New Cell Type – `MediaCell`

### 3a. Type registration

Extend `CellTypes`:
```typescript
type CellTypes = "note" | "rag" | "draw" | "test" | "flashcard" | "plan" | "media"
```

### 3b. Cell content shape

Designed to handle both audio and video from the start, even though only audio is wired up now:

```typescript
interface MediaCellContent {
  sourceType: "audio" | "video"
  title: string
  url: string           // UploadThing URL (audio) or embed URL (video – future)
  lectureId?: string    // FK → lectures table (audio only)
}
```

### 3c. Component – `src/components/cells/MediaCell.tsx`

**Audio mode (implemented now):**
- Custom HTML5 `<audio>` controls: play/pause, seek bar, timestamp, restart
- "Transkrypcja" toggle – reveals `scriptText` from the lecture
- "Usuń wykład" – calls `deleteLectureAction`, removes the cell

**Video mode (stub, wired up later):**
- If `sourceType === "video"` render a placeholder / "coming soon" state
- Internal structure already split so swapping in `<video>` or `<iframe>` is a small diff

**No premium gate** – user already paid to generate; playback is free.

### 3d. Add to `cellButtons.ts`

```typescript
{
  type: "media",
  label: "Media",
  icon: PlayCircle,
  premium: false,
}
```

---

## 4. PlanCell Changes

### Remove
- All audio state: `audioUrl`, `isPlaying`, audio `ref`
- Inline `<audio>` player UI and all related handlers
- `generateLectureAction` base64 return value handling

### Keep / Add

```
PlanCell UI:
├── [existing plan content display]
├── "Generuj Wykład" button       →  triggers generation flow (see §5)
└── "Zapisz skrypt do notatki"    →  appears after generation completes
                                      saves scriptText as a new NoteCell below
```

**"Zapisz skrypt" flow:**
1. Take `scriptText` from generation result
2. Serialise to Lexical JSON (plain paragraph nodes)
3. Call `insertCellAfter(currentCellId, { type: "note", content: lexicalJson })`
4. Cells store syncs to DB via existing mechanism

---

## 5. Updated Generation Flow

```
User clicks "Generuj Wykład"
    │
    ├─ SHA-256 hash planContent → contentHash
    ├─ Call generateLectureAction(planContent, jobId)
    │   │
    │   ├─ Guards: auth → premium check → rate limit (lecture:generate, 3/day)
    │   │
    │   ├─ Query lectures: userId + contentHash
    │   │   ├─ FOUND  →  return { audioUrl, scriptText, lectureId }  (no API calls)
    │   │   └─ NOT FOUND → full generation:
    │   │       ├─ RAG retrieval       (Gemini 2.5 Flash + File Search)
    │   │       ├─ Script generation   (Gemini 2.5 Flash + lecture-template.json)
    │   │       ├─ TTS                 (chunked, Google Wavenet pl-PL-A)
    │   │       ├─ Upload MP3          (UploadThing lectureAudio route)
    │   │       ├─ saveLecture()       (insert lectures row + update storageUsed)
    │   │       └─ return { audioUrl, scriptText, lectureId }
    │
    └─ Client receives result
        ├─ insertCellAfter(planCellId, { type: "media", content: MediaCellContent })
        └─ Show "Zapisz skrypt do notatki" button (ephemeral, in PlanCell state)
```

**Cost protection:** identical plan content = zero API cost on repeat clicks.

---

## 6. Server Actions – `src/actions/lectures.ts`

All follow existing pattern: Zod validation → `auth()` → rate limit → DB → `revalidatePath`.

| Action | Description |
|--------|-------------|
| `saveLectureAction` | Upload MP3 buffer to UploadThing + insert `lectures` row + update `userLimits.storageUsed` (transaction). Called internally by `generateLectureAction`. |
| `deleteLectureAction` | `utapi.deleteFiles([audioKey])` + delete `lectures` row + decrement `storageUsed` (transaction). |
| `updateLectureDurationAction` | PATCH `duration` on a lecture row – called client-side after `onLoadedMetadata` fires. |

**Rate limits:**

| Key | Limit | Reason |
|-----|-------|--------|
| `lecture:generate` | 3 / day | Covers 2× Gemini + TTS + UploadThing write |
| `lecture:delete` | 20 / hour | Prevent runaway deletions |

---

## 7. Learning Center – Wykłady Section

### Route

```
src/app/panel/nauka/
├── page.tsx                      (existing)
├── notatki/[noteId]/page.tsx     (existing)
└── wykłady/
    └── page.tsx                  (new – LectureLibrary)
```

### `LectureLibrary` page – `/panel/nauka/wykłady`

Data: server component, fetches all `lectures` rows for `userId` ordered by `createdAt DESC`. Audio URLs come from UploadThing (already stored in `audioUrl`).

**Features:**
- Grid/list of lecture cards – title, creation date, duration
- Sort: newest (default), oldest, title A–Z, duration
- Filter/search: keyword against `title` (DB) and `scriptText` excerpt
- Per-card actions: ▶ Play inline, 📄 Transkrypcja, 🗑 Usuń
- Empty state with CTA pointing back to a PlanCell

**Premium gate:** yes – same check as other premium routes.

---

## 8. File Map

### New files

```
src/
├── actions/
│   └── lectures.ts
├── components/
│   └── cells/
│       └── MediaCell.tsx
├── server/
│   └── queries/
│       └── lectures.ts
└── app/
    └── panel/
        └── nauka/
            └── wykłady/
                └── page.tsx
```

### Changed files

```
src/
├── server/db/schema.ts               + lectures table
├── app/api/uploadthing/core.ts       + lectureAudio route
├── actions/rag-actions.ts            + hash check + saveLecture call
├── components/cells/
│   ├── PlanCell.tsx                  – remove audio player, + MediaCell insert + save-to-note
│   └── index.tsx                     + MediaCell dynamic import
├── types/ (cellTypes)                + "media" to CellTypes
└── app/panel/nauka/page.tsx          + "Wykłady" nav link
```

---

## 9. Implementation Order

1. DB schema – `lectures` table + `pnpm run db:push`
2. UploadThing – `lectureAudio` route
3. Server actions – `src/actions/lectures.ts` + DB queries
4. `generateLectureAction` – hash dedup + `saveLectureAction` call, return `audioUrl` instead of base64
5. `MediaCell` component – audio mode + video stub
6. Register `media` cell type everywhere
7. `PlanCell` – strip audio player, insert MediaCell, add save-to-note button
8. `LectureLibrary` page + nav link

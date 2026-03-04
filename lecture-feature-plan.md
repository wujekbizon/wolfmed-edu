# Lecture & Media Feature – Implementation Plan

> Status: **DRAFT – awaiting review before implementation**
> Video source TBD (user upload vs embed vs both) – marked where it affects scope.

---

## 1. What We Are Building

| Piece | Description |
|-------|-------------|
| **PlanCell (trimmed)** | Keep only "Generuj Wykład" + "Zapisz skrypt do notatki". Remove inline audio player. |
| **MediaCell** | New cell type `media`. Plays audio or video. Inserted automatically after lecture generation. |
| **`lectures` table** | Persists generated lectures (audio URL, script, content hash for dedup). |
| **UploadThing extension** | New `lectureAudio` route to store MP3s server-side. |
| **Learning Center – Wykłady** | New route `/panel/nauka/wykłady` – manage, sort, filter saved lectures. |
| **Mini-courses** | Optional grouping of lectures into ordered playlists (stretch, separate table). |

---

## 2. Database Schema Changes

### 2a. New table – `lectures`

```typescript
lectures: createTable("lectures", {
  id:          uuid().primaryKey().defaultRandom(),
  userId:      varchar({ length: 256 }).notNull(),           // Clerk user ID
  title:       varchar({ length: 256 }).notNull(),
  contentHash: varchar({ length: 64 }).notNull(),            // SHA-256 of planContent → dedup key
  audioKey:    varchar({ length: 256 }).notNull(),           // UploadThing file key
  audioUrl:    text().notNull(),                             // UploadThing download URL
  scriptText:  text().notNull(),                             // raw lecture script (for transcript view)
  duration:    integer(),                                    // seconds, filled client-side after playback
  createdAt:   timestamp().defaultNow().notNull(),
  updatedAt:   timestamp().defaultNow().notNull(),
})

// Indexes
index("lectures_user_id_idx").on(lectures.userId)
index("lectures_content_hash_idx").on(lectures.userId, lectures.contentHash)
```

**Deduplication logic**: before calling Gemini + TTS, hash the `planContent` string (SHA-256). Query `lectures` for matching `userId + contentHash`. If found → return existing `audioUrl` immediately without generating anything.

### 2b. New table – `mini_courses` *(stretch goal)*

```typescript
miniCourses: createTable("mini_courses", {
  id:          uuid().primaryKey().defaultRandom(),
  userId:      varchar({ length: 256 }).notNull(),
  title:       varchar({ length: 256 }).notNull(),
  description: text().default(""),
  lectureIds:  jsonb().$type<string[]>().default([]),        // ordered list of lecture IDs
  createdAt:   timestamp().defaultNow().notNull(),
  updatedAt:   timestamp().defaultNow().notNull(),
})
```

### 2c. UploadThing router extension

Add a new endpoint to `src/app/api/uploadthing/core.ts`:

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

> **Storage quota**: Lecture audio counts against `userLimits.storageUsed` the same way materials do – use the same atomic transaction pattern from `materials.ts`.

---

## 3. New Cell Type – `MediaCell`

### 3a. Type registration

Extend `CellTypes`:
```typescript
type CellTypes = "note" | "rag" | "draw" | "test" | "flashcard" | "plan" | "media"
```

### 3b. Cell content shape

```typescript
interface MediaCellContent {
  type: "audio" | "video"
  title: string
  url: string                   // playback URL
  lectureId?: string            // FK → lectures table (audio only)
  // video: TBD pending answer on source
}
```

### 3c. Component – `src/components/cells/MediaCell.tsx`

**Audio mode:**
- HTML5 `<audio>` with custom controls (play/pause/restart/seek bar/timestamp)
- "Ver transcipt" toggle – shows `scriptText` from lecture
- "Usuń wykład" – calls `deleteLectureAction`, removes cell

**Video mode:** *(design TBD pending video source decision)*
- If upload: `<video>` element with UploadThing URL
- If embed: `<iframe>` with sanitised YouTube/Vimeo URL

**No premium gate** – user already paid to generate; playback is free.

### 3d. Add to `cellButtons.ts`

```typescript
{
  type: "media",
  label: "Media",
  icon: PlayCircle,
  premium: false,  // playback doesn't require premium
}
```

---

## 4. PlanCell Changes

### Remove
- All audio state: `audioUrl`, `isPlaying`, audio ref
- Inline `<audio>` player UI
- `generateLectureAction` return value handling for base64

### Keep / Add

```
PlanCell UI:
├── [existing plan content display]
├── "Generuj Wykład" button  →  triggers generation flow (see §5)
└── "Zapisz skrypt do notatki" button  →  appears after generation, saves scriptText as NoteCell
```

**"Zapisz skrypt" flow:**
1. Take `scriptText` returned from generation
2. Convert to Lexical JSON format
3. Call `insertCellAfter` with type `note` and the Lexical content
4. Cells store syncs to DB as normal

---

## 5. Updated Generation Flow

```
User clicks "Generuj Wykład"
    │
    ├─ Hash planContent → SHA-256 contentHash
    ├─ Call generateLectureAction(planContent, jobId)
    │   │
    │   ├─ Query lectures table: userId + contentHash
    │   │   ├─ FOUND → skip Gemini + TTS, return { audioUrl, scriptText, lectureId }
    │   │   └─ NOT FOUND → continue:
    │   │       ├─ RAG retrieval (Gemini File Search)
    │   │       ├─ Script generation (Gemini 2.5 Flash)
    │   │       ├─ TTS (chunked, Google Wavenet)
    │   │       ├─ Upload MP3 to UploadThing (lectureAudio route)
    │   │       ├─ Insert row into lectures table
    │   │       └─ return { audioUrl, scriptText, lectureId }
    │
    └─ Client receives result
        ├─ insertCellAfter(currentCellId, { type: "media", content: MediaCellContent })
        └─ Cells auto-save to DB via existing sync mechanism
```

**Cost protection:** the `contentHash` dedup check means re-clicking "Generuj Wykład" on unchanged plan content costs $0.

---

## 6. New Server Actions

All follow existing pattern: Zod validation → auth → rate limit → DB → revalidatePath.

| Action | File | Description |
|--------|------|-------------|
| `saveLectureAction` | `src/actions/lectures.ts` | Upload MP3 + insert `lectures` row (called internally by `generateLectureAction`) |
| `deleteLectureAction` | `src/actions/lectures.ts` | Delete from UploadThing + DB + update storageUsed |
| `updateLectureDurationAction` | `src/actions/lectures.ts` | Patch `duration` once client knows it |
| `getLecturesAction` | `src/actions/lectures.ts` | Fetch all lectures for user (for Wykłady page) |
| `createMiniCourseAction` | `src/actions/lectures.ts` | Insert `mini_courses` row *(stretch)* |
| `updateMiniCourseAction` | `src/actions/lectures.ts` | Reorder / rename course *(stretch)* |
| `deleteMiniCourseAction` | `src/actions/lectures.ts` | Delete course (not lectures) *(stretch)* |

**Rate limits to add in `checkRateLimit`:**

| Key | Limit | Reason |
|-----|-------|--------|
| `lecture:generate` | 3/day | Expensive (2× Gemini + TTS + upload) |
| `lecture:delete` | 20/hour | Prevent abuse |

---

## 7. Learning Center – Wykłady Section

### Route structure

```
src/app/panel/nauka/
├── page.tsx                    (existing – LearningHubDashboard)
├── notatki/[noteId]/page.tsx   (existing)
└── wykłady/
    ├── page.tsx                (new – LectureManager)
    └── [courseId]/page.tsx     (new stretch – MiniCourse player)
```

### `LectureManager` – `/panel/nauka/wykłady`

**Features:**
- List all saved lectures for the user
- Sort: date created (default), title A–Z, duration
- Filter: by topic/keyword (search on title + scriptText excerpt)
- Each card shows: title, creation date, duration, mini waveform or audio thumbnail
- Actions per card: ▶ Play (inline), 📄 Transcript, ➕ Add to course, 🗑 Delete
- "Nowy kurs" button → create mini-course from selected lectures *(stretch)*

**Mini-course view** `/panel/nauka/wykłady/[courseId]`:
- Ordered playlist of lectures
- Auto-advance to next on completion
- Progress indicator (X of Y lectures)

---

## 8. File Map – New & Changed Files

### New files

```
src/
├── actions/
│   └── lectures.ts                        # All lecture server actions
├── components/
│   └── cells/
│       └── MediaCell.tsx                  # Audio + video player cell
├── server/
│   └── queries/
│       └── lectures.ts                    # DB query functions for lectures
└── app/
    └── panel/
        └── nauka/
            └── wykłady/
                ├── page.tsx               # LectureManager page
                └── [courseId]/
                    └── page.tsx           # MiniCourse player (stretch)
```

### Changed files

```
src/
├── server/db/schema.ts                    # Add lectures + miniCourses tables
├── app/api/uploadthing/core.ts            # Add lectureAudio route
├── actions/rag-actions.ts                 # Add hash check + saveLecture call
├── components/cells/
│   ├── PlanCell.tsx                       # Remove audio player, add MediaCell insert
│   └── index.tsx                          # Register MediaCell dynamic import
├── types/
│   └── cellTypes.ts (or similar)          # Add "media" to CellTypes
└── app/panel/nauka/page.tsx               # Add "Wykłady" nav link / section
```

---

## 9. Open Questions

| # | Question | Impact |
|---|----------|--------|
| 1 | **Video source?** User upload (UploadThing) / YouTube embed / both | Determines MediaCell video mode, storage quota impact, UploadThing route |
| 2 | **Lecture storage quota?** Count against existing 20MB `userLimits` or separate lecture quota? | Schema + action logic |
| 3 | **Mini-courses – in scope now or later?** | Whether to create `mini_courses` table in this PR |
| 4 | **`wykłady` page access gated to premium?** | Route middleware |

---

## 10. Implementation Order

If approved, suggested sequence:

1. DB schema (`lectures` table + migration)
2. UploadThing `lectureAudio` route
3. Server actions (`src/actions/lectures.ts`)
4. Update `generateLectureAction` – add hash check + save flow
5. `MediaCell` component
6. Register `media` cell type
7. `PlanCell` cleanup (remove audio, add MediaCell insert + "save to note")
8. `LectureManager` page + route
9. Mini-courses *(if in scope)*

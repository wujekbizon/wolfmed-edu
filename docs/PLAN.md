# Generate Lecture from Plan — Implementation Plan

## Goal

Enable the "Generuj wykład" button in `PlanCell` to generate a structured lecture (as a `note` cell) based on the plan's topic and content, using the existing RAG/AI + SSE progress infrastructure.

---

## Current State

- `PlanCell.tsx` has a disabled "Generuj wykład" button with a "Wkrótce dostępne" tooltip
- Existing infrastructure: `useRagProgress` hook, `RagProgressIndicator` component, `askRagQuestion` action, `executeToolWithContent`, `useProgressStore`, SSE route `/api/rag/progress`
- `CellTypes = "note" | "rag" | "draw" | "test" | "flashcard" | "plan"` — no new type needed; lecture outputs as `'note'`
- `useCellsStore.insertCellAfterWithContent` inserts a new cell after the current one

---

## UX Behavior

- User clicks "Generuj wykład" → button disables, progress indicator appears inside the cell
- **No info toast on start** — progress bar is the visual feedback
- Generation runs on the server; if user navigates away, SSE disconnects but server completes — **normal behavior, no special handling**
- On complete: `toast.success("Wykład gotowy!")` + new note cell inserted after the plan cell
- On error: `toast.error(message)`

---

## Files to Change / Create

### 1. `templates/lecture-template.json` ← NEW

Prompt template for lecture generation. Instructs the AI to produce a rich Markdown lecture in Polish based on the plan's topic and step structure. Similar pattern to `plan-template.json` (systemPrompt + userPrompt).

### 2. `src/server/tools/executor.ts`

- Add `let lectureTemplate` cache variable
- Add `getLectureTemplate()` loader
- Add `wykladTool(args)` function — calls Gemini with the template, returns `{ cellType: 'note', content: markdownLecture }`
- Add `case 'wyklad_tool':` to `executeToolLocally` switch

### 3. `src/server/tools/definitions.ts`

Add `wyklad_tool` entry to `TOOL_DEFINITIONS`:
```ts
{
  name: 'wyklad_tool',
  description: 'Generate a structured lecture in Polish based on provided plan/content. Returns markdown formatted lecture as a note cell.',
  parameters: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'Plan JSON or topic content to base the lecture on' }
    },
    required: ['content']
  }
}
```

### 4. `src/actions/rag-actions.ts`

Add `'wyklad'` to `toolMap` inside `askRagQuestion`:
```ts
'wyklad': TOOL_DEFINITIONS.find(t => t.name === 'wyklad_tool'),
```

Add a dedicated `generateLectureAction(planContent: string, jobId: string): Promise<FormState>` server action that:
- Creates job, checks auth + premium
- Runs progress steps (searching knowledge base → generating → finalizing)
- Calls `executeToolWithContent('wyklad_tool', planContent, wykladToolDef, [])`
- Returns `toFormState('SUCCESS', lectureMarkdown)` with `values.cellType = 'note'`

### 5. `src/constants/progress.ts`

Add `'wyklad_tool'` / `'wyklad'` entries to `TOOL_LABELS_ACCUSATIVE` and `TOOL_LABELS_GENITIVE`.

### 6. `src/components/cells/PlanCell.tsx`

Major update — enable the button with full generation flow:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRagProgress } from '@/hooks/useRagProgress'
import { useCellsStore } from '@/store/useCellsStore'
import { generateLectureAction } from '@/actions/rag-actions'
import RagProgressIndicator from '@/components/cells/RagProgressIndicator'
// ... existing imports
```

State:
- `const [isPending, startTransition] = useTransition()`
- `const { jobId, stage, progress, message, tool, userLogs, technicalLogs, error: progressError, startListening, reset } = useRagProgress()`
- `const { insertCellAfterWithContent } = useCellsStore()`

Handler:
```tsx
const handleGenerate = () => {
  startListening()
  startTransition(async () => {
    const result = await generateLectureAction(cell.content, jobId)
    reset()
    if (result.status === 'SUCCESS' && result.message) {
      insertCellAfterWithContent(cell.id, 'note', result.message)
      toast.success('Wykład gotowy!')
    } else {
      toast.error(result.message || 'Nie udało się wygenerować wykładu.')
    }
  })
}
```

Button: replace `disabled` static button with active button (`onClick={handleGenerate}`, `disabled={isPending}`).

Progress indicator: render `RagProgressIndicator` below the button when `isPending`.

---

## Data Flow

```
User clicks "Generuj wykład" (PlanCell)
         ↓
startListening() — SSE connects to /api/rag/progress?jobId=...
         ↓
generateLectureAction(planContent, jobId) — server action starts
         ↓
Progress events stream via SSE → RagProgressIndicator updates in cell
         ↓
AI generates lecture markdown (Gemini via wyklad_tool)
         ↓
Action returns SUCCESS with lecture markdown
         ↓
insertCellAfterWithContent(cell.id, 'note', lectureMarkdown)
toast.success("Wykład gotowy!")
```

---

## Summary of Changes

| # | Type | File | Change |
|---|------|------|--------|
| 1 | New | `templates/lecture-template.json` | AI prompt template for lecture generation |
| 2 | Update | `src/server/tools/executor.ts` | Add `wykladTool()` + switch case |
| 3 | Update | `src/server/tools/definitions.ts` | Add `wyklad_tool` definition |
| 4 | Update | `src/actions/rag-actions.ts` | Add `generateLectureAction` + `'wyklad'` to toolMap |
| 5 | Update | `src/constants/progress.ts` | Add `wyklad` labels |
| 6 | Update | `src/components/cells/PlanCell.tsx` | Enable button, add progress + generation logic |

**No new cell type** — lecture outputs as `'note'`.
**Reusing:** `useRagProgress`, `RagProgressIndicator`, `useCellsStore`, SSE infrastructure, `executeToolWithContent`, progress store.
